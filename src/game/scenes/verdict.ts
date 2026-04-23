import { Scene } from "phaser";
import tutorialCases from "../data/tutorial-cases.json";
import { typewriterEffect } from "../utils/typeWriterAnimation";
import { playConfettiEffect } from "../utils/playConfettiEffect";
import createTextButton from "../utils/createTextButton";
import CaseManager from "../case-manager";

export class Verdict extends Scene {
    constructor() {
        super("Verdict");
    }

    currTutorialCaseIndex: number;
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
    totalEvidenceCases: number;
    currReviewedEvidence: string[] = [];
    judge: Phaser.GameObjects.Sprite;
    showVerdictText = false;
    currentDifficulty: "easy" | "medium" | "hard" = "easy";

    init(data: {
        selectedTestCasesIndices: string[];
        tutorialCaseIndex: number;
        isTutorial: boolean;
        difficulty: "easy" | "medium" | "hard";
    }) {
        this.cameras.main.setBackgroundColor("#2d2d2d");
        this.add.rectangle(512, 80, 1024, 120, 0x000000, 0.8).setOrigin(0.5);

        const { selectedTestCasesIndices, tutorialCaseIndex } = data;
        this.selectedTestCases = selectedTestCasesIndices;
        this.currTutorialCaseIndex = tutorialCaseIndex;
        this.isTutorial = data.isTutorial;
        this.currentDifficulty = data.difficulty;
        this.currTutorialCaseIndex = data.tutorialCaseIndex;
        this.totalEvidenceCases =
            tutorialCases[this.currTutorialCaseIndex].testFeedback.length;
        this.currReviewedEvidence = [];
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

    private showNextCaseButton() {
        const nextCaseButton = createTextButton.call(
            this,
            850,
            190,
            {
                x: 0,
                y: 0,
                width: 160,
                height: 40,
                color: 0x000000,
                alpha: 1,
            },
            {
                text: "Next Case",
                fontFamily: "Google Sans Code",
                fontSize: 18,
                color: "#ffffff",
            },
            true,
        );

        nextCaseButton.on("pointerdown", () => {
            // Record this case's result in CaseManager using the letter system
            const manager = CaseManager.getInstance();
            const currentCase = tutorialCases[this.currTutorialCaseIndex];
            while (manager.getCurrentCaseIndex() < this.currTutorialCaseIndex) {
                manager.advanceCase();
            }
            manager.selectedEvidenceIds = [...this.selectedTestCases];
            manager.submitVerdict(currentCase.correctVerdict as "guilty" | "not guilty");

            this.scene.stop("Verdict");

            // Last case → go to Summary
            if (this.currTutorialCaseIndex >= tutorialCases.length - 1) {
                manager.markTutorialCompleted();
                this.scene.start("Summary");
                return;
            }

            manager.advanceCase();

            const nextDifficulty =
                tutorialCases[this.currTutorialCaseIndex + 1].difficulty;
            if (
                nextDifficulty === "medium" ||
                this.currentDifficulty === "hard"
            ) {
                this.scene.start("Pause", {
                    isTutorial: this.isTutorial,
                    nextTutorialText:
                        "cout << \"Things are going to start a little more challenging now! Before we proceed, would you like to take a recess and come back later? If so, hit the 'Save Progress' button. Otherwise, hit the 'Next Case' button to proceed.\" << endl;",
                    difficulty: nextDifficulty,
                    currentTutorialCaseIndex: this.currTutorialCaseIndex,
                });
                return;
            } else {
                this.scene.start("Case", {
                    isTutorial: this.isTutorial,
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    nextTutorialText: tutorialCases[
                        this.currTutorialCaseIndex + 1
                    ].tutorialText,
                    difficulty: this.currentDifficulty,
                    currentTutorialCaseIndex: this.currTutorialCaseIndex + 1,
                });
            }
        });
    }

    showTestCaseReasonings(mood: "happy" | "sad") {
        const tutorialTestFeedback =
            tutorialCases[this.currTutorialCaseIndex].testFeedback;

        for (let i = 0; i < tutorialTestFeedback.length; i++) {
            const feedbackObj = tutorialTestFeedback[i];
            const yPosition = 200 + i * 120;
            const testCaseImage = this.add
                .image(
                    40,
                    yPosition,
                    `tutorial-${this.currTutorialCaseIndex}-t${i + 1}`,
                )
                .setOrigin(0, 0)
                .setScale(0.2)
                .setInteractive();

            testCaseImage.on("pointerdown", async () => {
                if (this.typingInProgress) return;

                testCaseImage.setAlpha(0.6);
                this.textObject.setText("");

                if (mood === "happy") {
                    this.playJudgeAnimation("happy");
                } else {
                    this.playJudgeAnimation("sad");
                }

                await this.addAnimatedTypingText(feedbackObj.feedback);

                if (mood === "happy") {
                    this.judge.anims.pause();
                    this.judge.setFrame(0);
                } else {
                    this.judge.anims.pause();
                    this.judge.setFrame(1);
                }
                testCaseImage.setAlpha(1);

                const letter = Object.keys(this.answerMapping).find(
                    (key) => this.answerMapping[key] === i,
                ) as string;

                if (this.currReviewedEvidence.includes(letter)) return;
                this.currReviewedEvidence.push(letter);

                if (
                    this.currReviewedEvidence.length === this.totalEvidenceCases
                ) {
                    const revealVerdictButton = createTextButton.call(
                        this,
                        850,
                        190,
                        {
                            x: 0,
                            y: 0,
                            width: 160,
                            height: 40,
                            color: 0x000000,
                            alpha: 1,
                        },
                        {
                            text: "Reveal Verdict",
                            fontFamily: "Google Sans Code",
                            fontSize: 18,
                            color: "#ffffff",
                        },
                        true,
                    );

                    this.judge.anims.pause();
                    this.judge.setFrame(0);

                    revealVerdictButton.on("pointerdown", async () => {
                        if (this.typingInProgress) return;

                        revealVerdictButton.destroy();

                        this.textObject.setText("");
                        this.playJudgeAnimation("happy");

                        await this.addAnimatedTypingText(
                            'cout << "Great work—you\'ve reviewed all the evidence! I hope my explanations helped you better understand how to distinguish strong test cases from weaker ones. With that said, I declare this program to be..." << endl;',
                            20,
                        );

                        if (
                            tutorialCases[this.currTutorialCaseIndex]
                                .correctVerdict === "not guilty"
                        ) {
                            this.playJudgeAnimation("happy");

                            this.typingInProgress = true;

                            this.time.delayedCall(1000, async () => {
                                this.textObject.setText("");

                                playConfettiEffect.call(this);

                                this.tweens.add({
                                    targets: this.add
                                        .sprite(830, 290, "innocent")
                                        .setOrigin(0.5),
                                    scale: 3.5,
                                    duration: 500,
                                    ease: "Bounce.easeOut",
                                    angle: 13,
                                });

                                this.playJudgeAnimation("happy");

                                this.typingInProgress = false;
                                await this.addAnimatedTypingText(
                                    tutorialCases[this.currTutorialCaseIndex]
                                        .closingStatement,
                                );
                                this.judge.anims.pause();
                                this.judge.setFrame(0);

                                this.showNextCaseButton();
                            });

                            this.judge.anims.pause();
                            this.judge.setFrame(0);
                        } else {
                            this.playJudgeAnimation("sad");
                            this.typingInProgress = true;

                            this.time.delayedCall(1000, async () => {
                                this.textObject.setText("");

                                this.tweens.add({
                                    targets: this.add
                                        .sprite(830, 290, "guilty")
                                        .setOrigin(0.5),
                                    scale: 3.5,
                                    duration: 500,
                                    ease: "Bounce.easeOut",
                                    angle: 13,
                                });

                                this.playJudgeAnimation("sad");

                                this.typingInProgress = false;
                                await this.addAnimatedTypingText(
                                    tutorialCases[this.currTutorialCaseIndex]
                                        .closingStatement,
                                );

                                this.judge.anims.pause();
                                this.judge.setFrame(1);
                                this.showNextCaseButton();
                            });

                            this.judge.anims.pause();
                            this.judge.setFrame(1);
                        }
                    });
                }
            });
        }
    }

    private playJudgeAnimation(mood: "happy" | "sad") {
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

            this.showTestCaseReasonings("happy");

            await this.addAnimatedTypingText(
                'cout << "Well done selecting the best test cases! This is the verdict screen. Here, I explain which tests were meaningful, which were misleading or redundant, and how your evidence influenced the final verdict. Click each case to read my explanation. It\'s important you do so before moving on." << endl;',
                20,
                25,
            );

            this.judge.anims.pause();
            this.judge.setFrame(0);
        } else {
            this.playJudgeAnimation("sad");

            this.showTestCaseReasonings("sad");

            await this.addAnimatedTypingText(
                tutorialCases[this.currTutorialCaseIndex]
                    .missedEvidenceExplanation,
                18,
                1,
            ); // TODO - remove 1
            this.judge.anims.pause();
            this.judge.setFrame(1);
        }
    }

    private async checkUserSelections() {
        const currentTestCase = tutorialCases[this.currTutorialCaseIndex];
        let numCorrect = 0;
        let numEssential = 0;
        const letters = ["A", "B", "C", "D"];
        for (let i = 0; i < currentTestCase.testFeedback.length; i++) {
            if (currentTestCase.testFeedback[i].quality === "essential") {
                numEssential++;
                // if (this.answerMapping[this.selectedTestCases[i]] === i)
                // if (this.answerMapping[letters[i]] === i)
                if (this.selectedTestCases.includes(letters[i])) numCorrect++;
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
}
