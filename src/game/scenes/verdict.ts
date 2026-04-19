import { Scene } from "phaser";
import tutorialCases from "../data/tutorial-cases.json";
import { typewriterEffect } from "../utils/typeWriterAnimation";

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
    isTutorial: boolean = false;
    textObject: Phaser.GameObjects.Text;
    typingInProgress: boolean = false;
    totalEvidenceCases =
        tutorialCases[this.currTutorialCaseIndex].testFeedback.length;
    currReviewedEvidenceCount = 0;
    judge: Phaser.GameObjects.Sprite;

    init(data: {
        selectedTestCasesIndices: string[];
        tutorialCaseIndex: number;
        isTutorial: boolean;
        addAnimatedTypingText: (
            text: string,
            fontSize?: number,
        ) => Promise<void>;
    }) {
        this.cameras.main.setBackgroundColor("#2d2d2d");
        this.add.rectangle(512, 80, 1024, 120, 0x000000, 0.8).setOrigin(0.5);

        const { selectedTestCasesIndices, tutorialCaseIndex } = data;
        this.selectedTestCases = selectedTestCasesIndices;
        this.currTutorialCaseIndex = tutorialCaseIndex;
        this.isTutorial = data.isTutorial;
    }

    async addAnimatedTypingText(
        text: string,
        fontSize: number = 21,
        speed: number = 30,
    ) {
        this.typingInProgress = true;

        this.textObject = this.add.text(100, 30, "", {
            fontSize: `${fontSize}px`,
            color: "#01ff34",
            wordWrap: { width: 800 },
        });

        await typewriterEffect(
            null,
            this.textObject.setText(text),
            text,
            speed,
        ); // TODO - replace 1 with speed
        this.typingInProgress = false;
    }

    showTestCaseReasonings() {
        const tutorialTestFeedback =
            tutorialCases[this.currTutorialCaseIndex].testFeedback;

        for (let i = 0; i < tutorialTestFeedback.length; i++) {
            const feedbackObj = tutorialTestFeedback[i];
            const yPosition = 200 + i * 120;
            const testCaseImage = this.add
                .image(40, yPosition, `tutorial-test-${i + 1}`)
                .setOrigin(0, 0)
                .setScale(0.2)
                .setInteractive();

            testCaseImage.on("pointerdown", async () => {
                if (this.typingInProgress) return;
                testCaseImage.setAlpha(0.6);
                this.textObject.setText("");
                await this.addAnimatedTypingText(feedbackObj.feedback); // TODO - replace 1 with speed
                this.currReviewedEvidenceCount++;
                testCaseImage.setAlpha(1);

                // play talking animation
            });
        }
    }

    playJudgeAnimation(mood: "happy" | "sad") {
        if (mood === "happy") {
            this.judge = this.add
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

            this.judge.play("happy-speaking");
        } else {
            this.judge = this.add
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

            this.judge.play("sad-speaking");
        }
    }

    async showJudgeAnimation(mood: "happy" | "sad") {
        if (mood === "happy") {
            this.playJudgeAnimation("happy");

            this.showTestCaseReasonings();

            await this.addAnimatedTypingText(
                'cout << "Well done selecting the best test cases! This is the verdict screen. Here, I explain which tests were meaningful, which were misleading or redundant, and how your evidence influenced the final verdict. Click each case to read my explanation. It\'s important you do so before moving on." << endl;',
                20,
                25,
            );

            this.judge.anims.pause();
            this.judge.setFrame(0);
        } else {
            this.playJudgeAnimation("sad");

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

            this.judge.play("sad-speaking");
            this.showTestCaseReasonings();

            await this.addAnimatedTypingText(
                "cout << \"Even though your selected test cases weren't the best fit, that's okay. The more you review cases, the better you'll get at identifying meaningful evidence. Here, I explain which tests were useful, which were misleading or redundant, and how your choices influenced the final verdict. Click each case to read my explanation. It's important you do so before moving on.\" << endl;",
                18,
            );
            this.judge.anims.pause();
            this.judge.setFrame(1);
        }
    }

    private async checkUserSelections() {
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
            await this.showJudgeAnimation("sad");
        } else {
            await this.showJudgeAnimation("happy");
        }
    }

    async create() {
        await this.checkUserSelections();
    }

    update() {}

    changeScene() {}
}
