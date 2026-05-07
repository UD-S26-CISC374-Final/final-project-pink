import type { Case, TestFeedback, UnitTest } from "../data/types";
import tutorialCasesJSON from "../data/tutorial-cases.json";
import easyCasesJSON from "../data/easy-cases.json";
import mediumCasesJSON from "../data/medium-cases.json";
import hardCasesJSON from "../data/hard-cases.json";

const easyCases = easyCasesJSON as Case[];
const mediumCases = mediumCasesJSON as Case[];
const hardCases = hardCasesJSON as Case[];
const tutorialCases = tutorialCasesJSON as Case[];

export default function getCaseData(
    isTutorial: boolean,
    levelDifficulty: "easy" | "medium" | "hard",
    currTutorialCaseIndex: number,
): {
    feedback: UnitTest[];
    case: string;
    currCaseData: TestFeedback[];
} {
    if (isTutorial) {
        return {
            feedback: tutorialCases[currTutorialCaseIndex]?.evidencePool || [],
            case: tutorialCases[currTutorialCaseIndex]?.functionCode,
            currCaseData: tutorialCases[currTutorialCaseIndex].testFeedback,
        };
    }

    if (levelDifficulty === "easy") {
        return {
            feedback: easyCases[currTutorialCaseIndex]?.evidencePool || [],
            case: easyCases[currTutorialCaseIndex]?.functionCode,
            currCaseData: easyCases[currTutorialCaseIndex].testFeedback,
        };
    }

    if (levelDifficulty === "medium") {
        return {
            feedback: mediumCases[currTutorialCaseIndex]?.evidencePool || [],
            case: mediumCases[currTutorialCaseIndex]?.functionCode,
            currCaseData: mediumCases[currTutorialCaseIndex].testFeedback,
        };
    }

    return {
        feedback: hardCases[currTutorialCaseIndex]?.evidencePool || [],
        case: hardCases[currTutorialCaseIndex]?.functionCode,
        currCaseData: hardCases[currTutorialCaseIndex].testFeedback,
    };
}
