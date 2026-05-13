import type { Case, TestFeedback, UnitTest } from "../data/types";
import tutorialCasesJSON from "../data/tutorial-cases.json";
import easyCasesJSON from "../data/easy-cases.json";
import mediumCasesJSON from "../data/medium-cases.json";
import hardCasesJSON from "../data/hard-cases.json";

const easyCases = easyCasesJSON as Case[];
const mediumCases = mediumCasesJSON as Case[];
const hardCases = hardCasesJSON as Case[];
const tutorialCases = tutorialCasesJSON as Case[];

function getRandomFiveCases(
    difficultyLevel: "easy" | "medium" | "hard",
): Case[] {
    const randomized: Case[] = [];
    let current = 0;
    const numRounds = 5;
    while (current !== numRounds) {
        const randomIndex = Math.floor(Math.random() * numRounds);
        if (!randomized[randomIndex]) {
            if (difficultyLevel === "easy") {
                randomized[randomIndex] = easyCases[current];
                current++;
            } else if (difficultyLevel === "medium") {
                randomized[randomIndex] = mediumCases[current];
                current++;
            } else {
                randomized[randomIndex] = hardCases[current];
                current++;
            }
        }
    }

    return randomized;
}

export default function getCaseData(
    isTutorial: boolean,
    currentCaseIndex: number,
): {
    feedback: UnitTest[];
    case: string;
    currCaseData: TestFeedback[];
    description: string;
    evidencePool: UnitTest[];
} {
    if (isTutorial) {
        return {
            feedback: tutorialCases[currentCaseIndex]?.evidencePool || [],
            case: tutorialCases[currentCaseIndex]?.functionCode,
            currCaseData: tutorialCases[currentCaseIndex].testFeedback,
            description: tutorialCases[currentCaseIndex].description,
            evidencePool: tutorialCases[currentCaseIndex]?.evidencePool || [],
        };
    } else {
        const endAmountOfCases = 15;
        let current = 0;
        const difficultyLevels = ["easy", "medium", "hard"];
        const difficultyCount = 3; // the number of difficulty levels
        let currentDifficulty = 0;
        const randomizedCasesArr: Case[] = [];
        const savedRandomizedCases = localStorage.getItem("randomizedCases");
        if (!savedRandomizedCases) {
            while (
                current !== endAmountOfCases &&
                currentDifficulty !== difficultyCount
            ) {
                const randomFiveCases: Case[] = getRandomFiveCases(
                    difficultyLevels[currentDifficulty] as
                        | "easy"
                        | "medium"
                        | "hard",
                );

                randomizedCasesArr.push(...randomFiveCases);
                currentDifficulty++;
                current += 5;
            }

            localStorage.setItem(
                "randomizedCases",
                JSON.stringify(randomizedCasesArr),
            );

            return {
                feedback:
                    randomizedCasesArr[currentCaseIndex]?.evidencePool || [],
                case: randomizedCasesArr[currentCaseIndex]?.functionCode,
                currCaseData: randomizedCasesArr[currentCaseIndex].testFeedback,
                description: randomizedCasesArr[currentCaseIndex].description,
                evidencePool:
                    randomizedCasesArr[currentCaseIndex]?.evidencePool || [],
            };
        } else {
            const parsedRandomizedCases: Case[] = JSON.parse(
                savedRandomizedCases,
            ) as Case[];
            return {
                feedback:
                    parsedRandomizedCases[currentCaseIndex]?.evidencePool || [],
                case: parsedRandomizedCases[currentCaseIndex]?.functionCode,
                currCaseData:
                    parsedRandomizedCases[currentCaseIndex].testFeedback,
                description:
                    parsedRandomizedCases[currentCaseIndex].description,
                evidencePool:
                    parsedRandomizedCases[currentCaseIndex]?.evidencePool || [],
            };
        }
    }
}
