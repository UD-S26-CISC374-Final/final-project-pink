export type Verdict = "guilty" | "not guilty";
export type Difficulty = "easy" | "medium" | "hard";

export interface UnitTest {
    id: string;
    label: string; // e.g. "AbsoluteValue(5) -> 5"
    input: string;
    expectedOutput: string;
    actualOutput: string;
    passes: boolean;
    showResult: boolean; // If we want to show the result of the test or have the player figure it out
}

export interface TestFeedback {
    testId: string;
    quality: "essential" | "redundant" | "misleading";
    feedback: string; // What judge compiler will say about this test
}

export interface Case {
    id: string;
    difficulty: Difficulty;
    tutorialText: string;
    descTutorialText?: string;
    title: string;
    functionCode: string; // Displayed in the case file function box, this is the function on trial
    description: string; // What the function should do
    evidenceSlots: number; // evidence card slots available
    evidencePool: UnitTest[]; // All the tests that the player can choose from
    correctVerdict: Verdict;
    testFeedback: TestFeedback[];
    missedEvidenceExplanation: string;
    closingStatement: string;
}
