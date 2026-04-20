import { Scene } from "phaser";
import tutorialCases from "../data/tutorial-cases.json";
import { typewriterEffect } from "../utils/typeWriterAnimation";
import { playConfettiEffect } from "../utils/playConfettiEffect";
import createTextButton from "../utils/createTextButton";

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
    currReviewedEvidence: string[] = [];
    judge: Phaser.GameObjects.Sprite;
    showVerdictText = false;

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
            alert("NEXT CASE!");
        });
    }

    showTestCaseReasonings(mood: "happy" | "sad") {
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
                            'cout << "Great work, you\'ve reviewed all the evidence! Hopefully my explanations were clear enough for you to start getting the hang of determining good test cases over poorer ones. With that being said, I order this program to be..." << endl;',
                            20,
                        );

                        if (
                            tutorialCases[this.currTutorialCaseIndex]
                                .correctVerdict === "not guilty"
                        ) {
                            this.playJudgeAnimation("happy");

                            this.typingInProgress = true;

                            this.time.delayedCall(2000, async () => {
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

                                this.typingInProgress = false;
                                await this.addAnimatedTypingText(
                                    'cout << "INNOCENT!" << endl;',
                                    40,
                                );

                                this.showNextCaseButton();
                            });

                            this.judge.anims.pause();
                            this.judge.setFrame(0);
                        } else {
                            this.playJudgeAnimation("sad");
                            this.typingInProgress = true;

                            this.time.delayedCall(2000, async () => {
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

                                this.typingInProgress = false;
                                await this.addAnimatedTypingText(
                                    'cout << "GUILTY!" << endl;',
                                    40,
                                );

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
