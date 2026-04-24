import type { Case, Difficulty, Verdict } from "./data/types";

import easyCases from "./data/easy-cases.json";
import mediumCases from "./data/medium-cases.json";
import hardCases from "./data/hard-cases.json";
import tutorialCases from "./data/tutorial-cases.json";

const TUTORIAL_COMPLETED_KEY = "caseByCase_tutorialCompleted";

const POINTS_CORRECT_VERDICT = 10;
const POINTS_ESSENTIAL_EVIDENCE = 5;
const POINTS_MISLEADING_EVIDENCE = -5;

export interface CaseResult {
    caseId: string;
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
    private currentCaseIndex: number = 0;

    selectedEvidenceIds: string[] = [];

    private caseResults: CaseResult[] = [];
    private totalScore: number = 0;

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

    getCaseById(id: string): Case | undefined {
        return this.cases.find((c) => c.id === id);
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

    submitVerdict(playerVerdict: Verdict): CaseResult {
        const currentCase = this.getCurrentCase();
        const verdictCorrect = playerVerdict === currentCase.correctVerdict;

        let points = 0;

        if (verdictCorrect) {
            points += POINTS_CORRECT_VERDICT;
        }

        const letterToIndex: Partial<Record<string, number>> = { A: 0, B: 1, C: 2, D: 3 };
        for (const letter of this.selectedEvidenceIds) {
            const index = letterToIndex[letter];
            if (index === undefined) continue;
            const feedback = currentCase.testFeedback[index];
            if (feedback.quality === "essential") {
                points += POINTS_ESSENTIAL_EVIDENCE;
            } else if (feedback.quality === "misleading") {
                points += POINTS_MISLEADING_EVIDENCE;
            }
        }

        const result: CaseResult = {
            caseId: currentCase.id,
            playerVerdict,
            verdictCorrect,
            selectedEvidenceIds: [...this.selectedEvidenceIds],
            pointsEarned: points,
        };

        this.caseResults.push(result);
        this.totalScore += points;

        return result;
    }

    // Summary data

    getTotalScore(): number {
        return this.totalScore;
    }

    getCaseResults(): CaseResult[] {
        return [...this.caseResults];
    }

    getMaxPossibleScore(): number {
        return this.caseResults.reduce((total, result) => {
            const c = this.cases.find((cas) => cas.id === result.caseId);
            if (!c) return total;
            const essentialCount = c.testFeedback.filter(
                (f) => f.quality === "essential",
            ).length;
            const scoringEssential = Math.min(essentialCount, c.evidenceSlots);
            return (
                total +
                POINTS_CORRECT_VERDICT +
                scoringEssential * POINTS_ESSENTIAL_EVIDENCE
            );
        }, 0);
    }

    getCorrectVerdictCount(): number {
        return this.caseResults.filter((r) => r.verdictCorrect).length;
    }
}

export default CaseManager;
