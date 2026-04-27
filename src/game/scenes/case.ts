import { Scene } from "phaser";
import { typewriterEffect } from "../utils/typeWriterAnimation";
import tutorialCases from "../data/tutorial-cases.json";
import createTextButton from "../utils/createTextButton";

// TODO - will need to add guardrails around tutorial-related code to only have it work if this.tutorial is true
// TODO - for test case 2 (and any other cases that involve redundant test cases), figure out how to determine whether a test case is redundant or not because if the first test case is set to 'redundant' and the second test is set to 'good' but the player chose that over the second, it'll come off as them picking a redundant test.
// TODO - change it so that if you select a test case and then de-select, instead of the text animation playing again, it just shows the text again without the animation

export class Case extends Scene {
    constructor() {
        super("Case");
    }

    isTutorial: boolean = false;
    nextTutorialText: string;
    typingInProgress: boolean;
    textObject: Phaser.GameObjects.Text;
    currentTab: "code" | "explanation" | "test-cases";
    currentTutorialCaseIndex: number;
    currTutorialCaseDesc: string;
    caseFileCodeSnippet: Phaser.GameObjects.Image;
    programDescTextReference: Phaser.GameObjects.Text | undefined;
    backButton: Phaser.GameObjects.Container;
    caseFileTestCases: Phaser.GameObjects.Image[] = [];
    selectedTestCases: string[] = [];
    presentToJudgeButton: Phaser.GameObjects.Container | undefined;
    reminderMessageReference: Phaser.GameObjects.Text | undefined;
    letterMap: Record<number, string> = {
        0: "A",
        1: "B",
        2: "C",
    };
    showSkipMessageTip = true;
    levelDifficulty: "easy" | "medium" | "hard";

    thirdIntro =
        "These are the program's test cases. Use them as evidence. Some tests may be redundant, so choose the two that provide the strongest evidence by clicking on them.";

    private async goBack() {
        if (this.typingInProgress) return;

        if (this.caseFileTestCases.length)
            this.caseFileTestCases.forEach((testCase) => testCase.destroy());

        this.caseFileCodeSnippet = this.add
            .image(
                512,
                450,
                `tutorial-code-${this.currentTutorialCaseIndex ? this.currentTutorialCaseIndex : this.currentTutorialCaseIndex}`,
            )
            .setDisplaySize(920, 600)
            .setScale(0.26)
            .setDepth(10);

        this.add
            .sprite(512, 450, "case-file-open-program", 0)
            .setDisplaySize(920, 600);

        if (this.currentTab !== "code") {
            this.currentTab = "code";
            this.showBackButton();
        }

        this.addTabLabels();
        this.textObject.setText("");
        await this.addAnimatedTypingText(this.nextTutorialText);
    }

    private showBackButton() {
        this.backButton = createTextButton.call(
            this,
            150,
            190,
            {
                x: 0,
                y: 0,
                width: 110,
                height: 40,
                color: 0x000000,
                alpha: 1,
            },
            {
                text: this.currentTab === "code" ? "Main Menu" : "Go Back",
                fontFamily: "Google Sans Code",
                fontSize: 18,
                color: "#ffffff",
            },
            true,
        );

        this.add
            .rectangle(390, 190, 350, 40, 0x000000)
            .setOrigin(0.5)
            .setDepth(100);

        this.add
            .text(390, 190, "Tip: hit 'Enter' to skip text animation!", {
                fontFamily: "Google Sans Code",
                fontSize: 14,
                color: "#ffffff",
            })
            .setOrigin(0.5)
            .setDepth(101);

        this.backButton.on("pointerdown", async () => {
            if (this.currentTab === "code") {
                const confirmation = confirm(
                    "Are you sure you want to go back? Your progress in the tutorial will be lost.",
                );
                if (!confirmation) return;

                this.scene.stop("Tutorial");
                this.scene.start("MainMenu");
                return;
            }

            await this.goBack();
        });
    }

    private addTestCases(startY: number = 380, marginY: number = 15) {
        const testFeedback =
            tutorialCases[this.currentTutorialCaseIndex].testFeedback;
        const centerX = 512; // Your current horizontal center
        const columnWidth = 400; // How far apart the two columns should be
        const scale = 0.2;

        // Gemini provided the grid formatting logic below:
        testFeedback.forEach((_, i) => {
            // Determine column (0 or 1) and row (0, 1, 2...)
            const col = i % 2;
            const row = Math.floor(i / 2);

            // Calculate X: Offset left for col 0, right for col 1
            const xPos =
                col === 0 ?
                    centerX - columnWidth / 2
                :   centerX + columnWidth / 2;

            // Get texture to calculate height dynamically
            const texture = this.textures.get(
                `tutorial-${this.currentTutorialCaseIndex}-t${i + 1}`,
            );
            const source = texture.getSourceImage();
            const scaledHeight = source.height * scale;

            // Calculate Y: Start position + (height of image + margin) * row index
            const yPos = startY + row * (scaledHeight + marginY);

            const testCase = this.add
                .image(
                    xPos,
                    yPos,
                    `tutorial-${this.currentTutorialCaseIndex}-t${i + 1}`,
                )
                .setScale(scale)
                .setDepth(10)
                .setInteractive();

            this.caseFileTestCases.push(testCase);
        });

        this.clickableTestCases();
    }

    private clickableTestCases() {
        for (let i = 0; i < this.caseFileTestCases.length; i++) {
            const testCase = this.caseFileTestCases[i];

            testCase.on("pointerdown", async () => {
                if (this.typingInProgress) return;
                const letter: string = this.letterMap[i];
                const isSelected = this.selectedTestCases.includes(letter);

                // Prevent async spam
                if (isSelected) {
                    // REMOVE
                    this.selectedTestCases = this.selectedTestCases.filter(
                        (test) => test !== letter,
                    );
                    testCase.setAlpha(1);

                    // Only remove button if no longer valid
                    if (
                        this.selectedTestCases.length < 2 &&
                        this.presentToJudgeButton
                    ) {
                        this.presentToJudgeButton.destroy();
                        this.presentToJudgeButton = undefined;
                        this.showSkipMessageTip = true;

                        this.textObject.setText("");
                        await this.addAnimatedTypingText(this.thirdIntro, 19); // TODO - remove 1
                    }
                } else {
                    // ADD
                    if (this.selectedTestCases.length >= 2) {
                        this.textObject.setText("");

                        await this.addAnimatedTypingText(
                            'cout << "Remember: You can only select 2 test cases as evidence. Please deselect one..." << endl;',
                            22,
                            20,
                        );

                        this.reminderMessageReference = this.textObject;
                        return;
                    }

                    this.selectedTestCases.push(letter);
                    testCase.setAlpha(0.5);
                }

                if (this.selectedTestCases.length === 2) {
                    this.presentToJudgeButton = createTextButton
                        .call(
                            this,
                            400,
                            190,
                            {
                                x: 0,
                                y: 0,
                                width: 380,
                                height: 40,
                                color: 0x000000,
                                alpha: 1,
                            },
                            {
                                text: "Present Evidence to Judge Compiler",
                                fontFamily: "Google Sans Code",
                                fontSize: 18,
                                color: "#ffffff",
                            },
                            true,
                        )
                        .setDepth(102);
                }

                this.presentToJudgeButton?.on("pointerdown", () => {
                    this.scene.stop("Tutorial");
                    this.scene.start("Verdict", {
                        selectedTestCasesIndices: this.selectedTestCases,
                        tutorialCaseIndex: this.currentTutorialCaseIndex,
                        isTutorial: this.isTutorial,
                        difficulty: this.levelDifficulty,
                    });
                });
            });
        }
    }

    private playTimer() {
        let timerText = this.add.text(820, 250, "10:00", {
            fontSize: "35px",
            color: "#ee0808",
        });

        let timeLeft = 600; // 10 minutes in seconds is 600
        const timerEvent = this.time.addEvent({
            delay: 1000,
            callback: () => {
                timerText.destroy();

                timeLeft--;
                const minutes = Math.floor(timeLeft / 60)
                    .toString()
                    .padStart(2, "0");
                const seconds = (timeLeft % 60).toString().padStart(2, "0");

                timerText = this.add.text(820, 250, `${minutes}:${seconds}`, {
                    fontSize: "35px",
                    color: "#ee0808",
                });

                if (timeLeft <= 0) {
                    timerEvent.remove();
                    this.scene.stop("Tutorial");
                    this.scene.start("Verdict", {
                        selectedTestCasesIndices: [],
                        tutorialCaseIndex: this.currentTutorialCaseIndex,
                        isTutorial: this.isTutorial,
                        difficulty: this.levelDifficulty,
                    });
                }
            },
            loop: true,
        });
    }

    private addTabLabels() {
        this.add.text(810, 170, "Evidence", {
            fontSize: "25px",
            color: "#064b11",
        });

        this.add.text(650, 170, "Purpose", {
            fontSize: "25px",
            color: "#92088d",
        });
    }

    private drawTabs() {
        const greenTab = this.add
            .rectangle(870, 190, 148, 80, 0x00ff00, 0.8)
            .setOrigin(0.5)
            .setDepth(100)
            .setAlpha(0.09)
            .setInteractive();

        this.addTabLabels();

        if (
            this.levelDifficulty === "medium" ||
            this.levelDifficulty === "hard"
        ) {
            this.playTimer();
        }

        greenTab.on("pointerdown", async () => {
            if (this.typingInProgress) return;
            if (this.currentTab === "test-cases") return;

            this.caseFileTestCases = [];
            this.selectedTestCases = [];

            this.textObject.setText("");
            this.currentTab = "test-cases";
            this.backButton.destroy();
            this.caseFileCodeSnippet.destroy();

            if (this.programDescTextReference)
                this.programDescTextReference.destroy();

            const thirdIntro =
                "cout << \"These are the program's test cases. Use them as evidence. Some tests may be redundant, so choose the two that provide the strongest evidence by clicking on them. When you're ready, press the 'Present Evidence to Judge Compiler' button.\" << endl;";

            this.addTestCases(350);
            await this.addAnimatedTypingText(thirdIntro, 18);
            this.showBackButton();
        });

        const pinkTab = this.add
            .rectangle(700, 190, 148, 80, 0xff00ff, 0.8)
            .setOrigin(0.5)
            .setDepth(100)
            .setAlpha(0.09)
            .setInteractive();

        this.addTabLabels();

        pinkTab.on("pointerdown", async () => {
            if (this.typingInProgress) return;
            if (this.currentTab === "explanation") return;
            if (this.presentToJudgeButton) this.presentToJudgeButton.destroy();

            this.caseFileCodeSnippet.destroy();
            this.currentTab = "explanation";
            this.backButton.destroy();
            this.caseFileTestCases.forEach((testCase) => testCase.destroy());
            this.textObject.setText("");

            this.programDescTextReference = this.add
                .text(512, 350, this.currTutorialCaseDesc, {
                    fontFamily: "Google Sans Code",
                    fontSize: 23,
                    color: "#ffffff",
                    wordWrap: {
                        width: 600,
                        useAdvancedWrap: true,
                    },
                })
                .setOrigin(0.5);

            const fourthIntro =
                'cout << "Here is the program\'s statement of purpose, which gives a brief overview of what the program is supposed to do. This can help guide your analysis of the program and its test cases." << endl;';
            await this.addAnimatedTypingText(fourthIntro);

            this.showBackButton();
        });
    }

    async addAnimatedTypingText(
        text: string,
        fontSize: number = 21,
        speed?: number,
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
            this,
        );
        this.typingInProgress = false;
    }

    init(data: {
        isTutorial: boolean;
        nextTutorialText: string;
        difficulty: "easy" | "medium" | "hard";
        currentTutorialCaseIndex: number;
    }) {
        this.cameras.main.setBackgroundColor("#2d2d2d");
        this.add.rectangle(512, 80, 1024, 120, 0x000000, 0.8).setOrigin(0.5);
        this.isTutorial = data.isTutorial;
        this.nextTutorialText = data.nextTutorialText;
        this.currentTutorialCaseIndex = data.currentTutorialCaseIndex;
        this.currTutorialCaseDesc =
            tutorialCases[this.currentTutorialCaseIndex].description;
        this.selectedTestCases = [];
        this.currentTab = "code";
        this.levelDifficulty = data.difficulty;
    }

    async create() {
        // 1. First, we are going to display the open case file sprite showing the program's code and adding the clickable tabs as well
        this.add
            .sprite(512, 450, "case-file-open-program", 0)
            .setDisplaySize(920, 600);
        this.drawTabs();

        // 2. Next, we will display the code snippet for the case file
        this.caseFileCodeSnippet = this.add
            .image(512, 450, `tutorial-code-${this.currentTutorialCaseIndex}`)
            .setDisplaySize(920, 600)
            .setScale(0.26)
            .setDepth(10);

        // 3. Next, we are going to introduce the user with the next tutorial's text
        this.showBackButton();

        await this.addAnimatedTypingText(this.nextTutorialText);
    }
}
