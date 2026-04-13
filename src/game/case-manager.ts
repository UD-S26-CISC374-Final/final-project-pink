import type { Case, Difficulty, Verdict } from "./data/types";

import easyCases from "./data/easy-cases.json";
import mediumCases from "./data/medium-cases.json";
import hardCases from "./data/hard-cases.json";
import tutorialCases from "./data/tutorial-cases.json";

// We should adjsut these values, but the scoring system could be:
const POINTS_CORRECT_VERDICT = 10;
const POINTS_ESSENTIAL_EVIDENCE = 5;
const POINTS_MISLEADING_EVIDENCE = -5;
// redundant evidence is 0 — neutral but a wasted slot

export interface CaseResult {
    caseId: string;
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

    // Setup

    /** Call once before starting a run to load the right case set. */
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
            default:
                this.cases = tutorialCases as Case[];
        }
        this.reset();
    }

    /** Load the tutorial case set explicitly. */
    loadTutorial(): void {
        this.cases = tutorialCases as Case[];
        this.reset();
    }

    /** Reset progress without reloading the case list. */
    private reset(): void {
        this.currentCaseIndex = 0;
        this.selectedEvidenceIds = [];
        this.caseResults = [];
        this.totalScore = 0;
    }

    // Getters for current case and progress (read by GameScene and VerdictScene)

    getCurrentCase(): Case {
        return this.cases[this.currentCaseIndex];
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
            // end guard
            this.currentCaseIndex++;
        }
        this.selectedEvidenceIds = [];
    }

    // Evidence selection (mutated by GameScene)

    toggleEvidence(evidenceId: string): void {
        const idx = this.selectedEvidenceIds.indexOf(evidenceId);
        if (idx === -1) {
            this.selectedEvidenceIds.push(evidenceId);
        } else {
            this.selectedEvidenceIds.splice(idx, 1);
        }
    } // adds or removes the evidenceId from the selected list

    isEvidenceSelected(evidenceId: string): boolean {
        return this.selectedEvidenceIds.includes(evidenceId);
    } // lets the game scene highlight selected evidence

    canSelectMoreEvidence(): boolean {
        const currentCase = this.getCurrentCase();
        return this.selectedEvidenceIds.length < currentCase.evidenceSlots;
    } // enforces slot limit

    // Scoring (called by VerdictScene after the player submits a verdict)

    /**
     * Evaluates the player's verdict and currently selected evidence,
     * records the result, and returns the points earned for this case.
     */
    submitVerdict(playerVerdict: Verdict): CaseResult {
        const currentCase = this.getCurrentCase();
        const verdictCorrect = playerVerdict === currentCase.correctVerdict;

        let points = 0;

        if (verdictCorrect) {
            points += POINTS_CORRECT_VERDICT;
        }

        for (const evidenceId of this.selectedEvidenceIds) {
            const feedback = currentCase.testFeedback.find(
                (f) => f.testId === evidenceId,
            );
            if (feedback) {
                if (feedback.quality === "essential") {
                    points += POINTS_ESSENTIAL_EVIDENCE;
                } else if (feedback.quality === "misleading") {
                    points += POINTS_MISLEADING_EVIDENCE;
                }
                // redundant → 0
            }
        }

        const result: CaseResult = {
            caseId: currentCase.id,
            verdictCorrect,
            selectedEvidenceIds: [...this.selectedEvidenceIds],
            pointsEarned: points,
        };

        this.caseResults.push(result);
        this.totalScore += points;

        return result;
    }

    // Summary data (read by SummaryScene)

    getTotalScore(): number {
        return this.totalScore;
    }

    getCaseResults(): CaseResult[] {
        return [...this.caseResults];
    }

    /** Max possible score if every case is decided correctly with only essential evidence. */
    getMaxPossibleScore(): number {
        return this.cases.reduce((total, c) => {
            const essentialCount = c.testFeedback.filter(
                (f) => f.quality === "essential",
            ).length;
            // Cap essential evidence at the number of available slots
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
