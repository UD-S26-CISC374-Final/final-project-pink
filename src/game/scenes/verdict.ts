import { Scene } from "phaser";
import tutorialCases from "../data/tutorial-cases.json";

export class Verdict extends Scene {
    constructor() {
        super("Verdict");
    }

    currTutorialCaseIndex = 0;
    selectedTestCases: string[] = [];
    answerMapping: Record<string, number> = {
        A: 0,
        B: 1,
        C: 2,
        D: 3,
    };

    init(data: {
        selectedTestCasesIndices: string[];
        tutorialCaseIndex: number;
    }) {
        this.cameras.main.setBackgroundColor("#2d2d2d");

        const { selectedTestCasesIndices, tutorialCaseIndex } = data;
        this.selectedTestCases = selectedTestCasesIndices;
        this.currTutorialCaseIndex = tutorialCaseIndex;
    }

    showJudgeAnimation(mood: "happy" | "sad") {
        if (mood === "happy") {
            const judge = this.add
                .sprite(
                    this.cameras.main.width,
                    this.cameras.main.height,
                    "judge-compiler-sprite",
                    0,
                )
                .setOrigin(1, 1)
                .setScale(3);

            this.anims.create({
                key: "happy-speaking",
                frames: this.anims.generateFrameNumbers(
                    "judge-compiler-sprite",
                    {
                        frames: [0, 1, 2],
                    },
                ),
                frameRate: 3,
                repeat: -1,
            });

            judge.play("happy-speaking");
        } else {
            const judge = this.add
                .sprite(
                    this.cameras.main.width,
                    this.cameras.main.height,
                    "judge-compiler-speaking-sad",
                    0,
                )
                .setOrigin(1, 1)
                .setScale(3);

            this.anims.create({
                key: "sad-speaking",
                frames: this.anims.generateFrameNumbers(
                    "judge-compiler-speaking-sad",
                    {
                        frames: [0, 1, 2],
                    },
                ),
                frameRate: 3,
                repeat: -1,
            });

            judge.play("sad-speaking");
        }
    }

    private checkUserSelections() {
        const currentTestCase = tutorialCases[this.currTutorialCaseIndex];
        let numCorrect = 0;
        let numEssential = 0;
        for (let i = 0; i < currentTestCase.testFeedback.length; i++) {
            if (currentTestCase.testFeedback[i].quality === "essential") {
                numEssential++;
                if (this.answerMapping[this.selectedTestCases[i]] === i)
                    numCorrect++;
            }
        }

        if (numCorrect < numEssential) {
            this.showJudgeAnimation("sad");
        } else {
            this.showJudgeAnimation("happy");
        }
    }

    create() {
        this.checkUserSelections();
    }

    update() {}

    changeScene() {}
}
