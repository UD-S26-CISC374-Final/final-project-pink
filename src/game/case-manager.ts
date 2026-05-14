import type { Case, Difficulty, Verdict } from "./data/types";

import easyCases from "./data/easy-cases.json";
import mediumCases from "./data/medium-cases.json";
import hardCases from "./data/hard-cases.json";
import tutorialCases from "./data/tutorial-cases.json";

const TUTORIAL_COMPLETED_KEY = "caseByCase_tutorialCompleted";
const RESULTS_STORAGE_KEY = "caseByCase_lastResults";

const POINTS_CORRECT_VERDICT = 10;
const POINTS_ESSENTIAL_EVIDENCE = 5;
const POINTS_MISLEADING_EVIDENCE = -5;

export interface CaseResult {
    caseId: string;
    caseDifficulty: Difficulty;
    playerVerdict: Verdict;
    verdictCorrect: boolean;
    selectedEvidenceIds: string[];
    pointsEarned: number;
}

/**
 * Singleton that owns all game-state shared across scenes:
 *  - the active case list (determined by difficulty)
 *  - which case the player is currently on
 *  - which evidence cards are selected for the current case
 *  - the cumulative score and per-case results
 *  - tutorial completion tracking (via localStorage)
 */
class CaseManager {
    private static instance: CaseManager | null = null;

    private cases: Case[] = [];
    currentCaseIndex: number = 0;

    selectedEvidenceIds: string[] = [];

    private caseResults: CaseResult[] = [];
    private totalScore: number = 0;
    private isTutorialMode: boolean = false;
    private constructor() {}

    static getInstance(): CaseManager {
        if (CaseManager.instance === null) {
            CaseManager.instance = new CaseManager();
        }
        return CaseManager.instance;
    }

    // Tutorial tracking

    hasTutorialBeenCompleted(): boolean {
        return localStorage.getItem(TUTORIAL_COMPLETED_KEY) === "true";
    }

    markTutorialCompleted(): void {
        localStorage.setItem(TUTORIAL_COMPLETED_KEY, "true");
    }

    // Setup

    /** Load the full case set for a given difficulty. */
    loadCases(difficulty: Difficulty): void {
        switch (difficulty) {
            case "easy":
                this.cases = easyCases as Case[];
                break;
            case "medium":
                this.cases = mediumCases as Case[];
                break;
            case "hard":
                this.cases = hardCases as Case[];
                break;
        }
        this.reset();
    }

    /** Load the tutorial case set explicitly. */
    loadTutorial(): void {
        this.cases = tutorialCases as Case[];
        this.reset();
    }

    /**
     * Load the randomized 15-case set for non-tutorial mode.
     * Reads from localStorage if already generated, otherwise creates and saves a new set.
     */
    loadNonTutorialCases(): void {
        const saved = localStorage.getItem("randomizedCases");
        if (saved) {
            this.cases = JSON.parse(saved) as Case[];
        } else {
            const difficulties: Array<"easy" | "medium" | "hard"> = [
                "easy",
                "medium",
                "hard",
            ];
            const allCasePools = {
                easy: easyCases as Case[],
                medium: mediumCases as Case[],
                hard: hardCases as Case[],
            };
            const randomized: Case[] = [];
            for (const diff of difficulties) {
                const pool = allCasePools[diff];
                const picked: Case[] = [];
                const indices = new Set<number>();
                while (picked.length < 5 && picked.length < pool.length) {
                    const idx = Math.floor(Math.random() * pool.length);
                    if (!indices.has(idx)) {
                        indices.add(idx);
                        picked.push(pool[idx]);
                    }
                }
                randomized.push(...picked);
            }
            localStorage.setItem("randomizedCases", JSON.stringify(randomized));
            this.cases = randomized;
        }
        this.reset();
    }

    /**
     * Pick a single random easy case and load it as the active case list.
     * Used when the player clicks Start after completing the tutorial.
     */
    loadRandomEasyCase(): void {
        const pool = easyCases as Case[];
        const randomIndex = Math.floor(Math.random() * pool.length);
        this.cases = [pool[randomIndex]];
        this.reset();
    }

    /** Reset progress without reloading the case list. */
    private reset(): void {
        this.currentCaseIndex = 0;
        this.selectedEvidenceIds = [];
        this.caseResults = [];
        this.totalScore = 0;
    }

    // Getters for current case and progress

    getCurrentCase(): Case {
        return this.cases[this.currentCaseIndex];
    }

    getCaseById(id: string, difficulty?: Difficulty): Case | undefined {
        const matchesCase = (c: Case) =>
            c.id === id && (!difficulty || c.difficulty === difficulty);

        const fromLoaded = this.cases.find(matchesCase);
        if (fromLoaded) return fromLoaded;

        // Fallback: search localStorage randomized cases (non-tutorial mode)
        const saved = localStorage.getItem("randomizedCases");
        if (saved) {
            const savedCases = JSON.parse(saved) as Case[];
            const fromStorage = savedCases.find(matchesCase);
            if (fromStorage) return fromStorage;
        }

        // Final fallback: search tutorial cases
        return (tutorialCases as Case[]).find(matchesCase);
    }

    getCurrentCaseIndex(): number {
        return this.currentCaseIndex;
    }

    getTotalCases(): number {
        return this.cases.length;
    }

    isLastCase(): boolean {
        return this.currentCaseIndex >= this.cases.length - 1;
    }

    /** Advance to the next case and clear evidence selection. */
    advanceCase(): void {
        if (!this.isLastCase()) {
            this.currentCaseIndex++;
        }
        this.selectedEvidenceIds = [];
    }

    // Evidence selection

    toggleEvidence(evidenceId: string): void {
        const idx = this.selectedEvidenceIds.indexOf(evidenceId);
        if (idx === -1) {
            this.selectedEvidenceIds.push(evidenceId);
        } else {
            this.selectedEvidenceIds.splice(idx, 1);
        }
    }

    isEvidenceSelected(evidenceId: string): boolean {
        return this.selectedEvidenceIds.includes(evidenceId);
    }

    canSelectMoreEvidence(): boolean {
        const currentCase = this.getCurrentCase();
        return this.selectedEvidenceIds.length < currentCase.evidenceSlots;
    }

    // Scoring

    /**
     * Submit a verdict for the current case using the internal case reference.
     * Note: Prefer submitVerdictWithCase() if you have the case object directly.
     */
    submitVerdict(playerVerdict: Verdict): CaseResult {
        const currentCase = this.getCurrentCase();
        if (!currentCase) {
            throw new Error(
                "Cannot submit verdict: no case loaded in CaseManager",
            );
        }
        return this.submitVerdictWithCase(currentCase, playerVerdict);
    }

    /**
     * Submit a verdict with an explicit case object.
     * Use this when the case object is already available (e.g., from getCaseData).
     */
    submitVerdictWithCase(
        caseObject: Case,
        playerVerdict: Verdict,
    ): CaseResult {
        const verdictCorrect = playerVerdict === caseObject.correctVerdict;

        let points = 0;

        if (verdictCorrect) {
            points += POINTS_CORRECT_VERDICT;
        }

        const letters = ["A", "B", "C", "D"];
        const letterToIndex: Partial<Record<string, number>> = {
            A: 0,
            B: 1,
            C: 2,
            D: 3,
        };

        if (caseObject.requiredBranches) {
            for (const letter of this.selectedEvidenceIds) {
                const index = letterToIndex[letter];
                if (index === undefined) continue;
                const fb = caseObject.testFeedback[index] as {
                    logicBranch?: string;
                    misleading?: boolean;
                };
                if (!fb.logicBranch) continue;
                if (fb.misleading) {
                    points += POINTS_MISLEADING_EVIDENCE;
                } else {
                    const branchCoveredByOther = caseObject.testFeedback.some(
                        (f, j) => {
                            const tf = f as { logicBranch?: string };
                            return (
                                j !== index &&
                                tf.logicBranch === fb.logicBranch &&
                                this.selectedEvidenceIds.includes(letters[j])
                            );
                        },
                    );
                    if (!branchCoveredByOther)
                        points += POINTS_ESSENTIAL_EVIDENCE;
                }
            }
        } else {
            for (const letter of this.selectedEvidenceIds) {
                const index = letterToIndex[letter];
                if (index === undefined) continue;
                const feedback = caseObject.testFeedback[index];
                if (feedback.quality === "essential") {
                    points += POINTS_ESSENTIAL_EVIDENCE;
                } else if (feedback.quality === "misleading") {
                    points += POINTS_MISLEADING_EVIDENCE;
                }
            }
        }

        const result: CaseResult = {
            caseId: caseObject.id,
            caseDifficulty: caseObject.difficulty,
            playerVerdict,
            verdictCorrect,
            selectedEvidenceIds: [...this.selectedEvidenceIds],
            pointsEarned: points,
        };

        const existingIdx = this.caseResults.findIndex(
            (r) =>
                r.caseId === caseObject.id &&
                r.caseDifficulty === caseObject.difficulty,
        );

        if (existingIdx !== -1) {
            this.totalScore -= this.caseResults[existingIdx].pointsEarned;
            this.caseResults[existingIdx] = result;
        } else {
            this.caseResults.push(result);
        }

        this.totalScore += points;

        return result;
    }

    // Summary data

    getTotalScore(): number {
        return this.totalScore;
    }

    getCaseResults(): CaseResult[] {
        const byCaseKey = new Map<string, CaseResult>();
        for (const result of this.caseResults) {
            const key = `${result.caseId}|${result.caseDifficulty}`;
            byCaseKey.set(key, result);
        }
        return Array.from(byCaseKey.values());
    }

    getMaxPossibleScore(): number {
        return this.caseResults.reduce((total, result) => {
            const matchesResult = (cas: Case) =>
                cas.id === result.caseId &&
                cas.difficulty === result.caseDifficulty;

            let c = this.cases.find(matchesResult);
            if (!c) {
                const saved = localStorage.getItem("randomizedCases");
                if (saved) {
                    const savedCases = JSON.parse(saved) as Case[];
                    c = savedCases.find(matchesResult);
                }
            }
            if (!c) {
                c = (tutorialCases as Case[]).find(matchesResult);
            }
            if (!c) return total;
            const maxEssential =
                c.requiredBranches ?
                    Math.min(c.requiredBranches.length, c.evidenceSlots)
                :   Math.min(
                        c.testFeedback.filter((f) => f.quality === "essential")
                            .length,
                        c.evidenceSlots,
                    );
            return (
                total +
                POINTS_CORRECT_VERDICT +
                maxEssential * POINTS_ESSENTIAL_EVIDENCE
            );
        }, 0);
    }

    getCorrectVerdictCount(): number {
        return this.caseResults.filter((r) => r.verdictCorrect).length;
    }

    saveResults(): void {
        const data = {
            totalScore: this.totalScore,
            maxPossibleScore: this.getMaxPossibleScore(),
            correctVerdictCount: this.getCorrectVerdictCount(),
            caseResults: this.caseResults,
        };
        localStorage.setItem(RESULTS_STORAGE_KEY, JSON.stringify(data));
    }
}

export default CaseManager;
