import { Scene } from "phaser";
import { typewriterEffect } from "../utils/typeWriterAnimation";
import tutorialCases from "../data/tutorial-cases.json";
import createTextButton from "../utils/createTextButton";

// TODO - will need to add guardrails around tutorail-related code to only have it work if this.tutorial is true
// ! BUG - for some reason the text is incorrect if you hit 'go back' from the green tab

export class Case extends Scene {
    constructor() {
        super("Case");
    }

    isTutorial: boolean = false;
    nextTutorialText: string;
    typingInProgress: boolean = false;
    textObject: Phaser.GameObjects.Text;
    currentTab: "code" | "explanation" | "test-cases";
    currTutorialCaseIndex = 0;
    currTutorialCaseDesc =
        tutorialCases[this.currTutorialCaseIndex].description;
    caseFileCodeSnippet: Phaser.GameObjects.Image;
    programDescTextReference: Phaser.GameObjects.Text;
    backButton: Phaser.GameObjects.Container;
    caseFileTestCases: Phaser.GameObjects.Image[] = [];
    selectedTestCases: string[] = [];
    presentToJudgeButton: Phaser.GameObjects.Container | undefined;
    reminderMessageReference: Phaser.GameObjects.Text;
    letterMap: Record<number, string> = {
        0: "A",
        1: "B",
        2: "C",
    };
    thirdIntro =
        "cout << \"These are the program's test cases. Use them as evidence. If a test shows the function gives the wrong result, it's guilty. If the tests support it, it's innocent. Some tests may be redundant, so choose the two that provide the strongest evidence by clicking on them.\" << endl;";

    private async goBack() {
        if (this.typingInProgress) return;

        if (this.caseFileTestCases.length)
            this.caseFileTestCases.forEach((testCase) => testCase.destroy());

        this.caseFileCodeSnippet = this.add
            .image(512, 450, "tutorial-code-1")
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
                width: 100,
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

    private addTestCases(currentY: number = 350, margin: number = 5) {
        for (
            let i = 1;
            i <= tutorialCases[this.currTutorialCaseIndex].evidencePool.length;
            i++
        ) {
            const texture = this.textures.get(`tutorial-test-${i}`);
            const source = texture.getSourceImage();

            const scale = 0.2;
            const scaledHeight = source.height * scale;

            const testCase = this.add
                .image(512, currentY, `tutorial-test-${i}`)
                .setScale(scale)
                .setDepth(10)
                .setInteractive();

            this.caseFileTestCases.push(testCase);

            // move down for next image
            currentY += scaledHeight + margin;
        }

        this.clickableTestCases();
    }

    private clickableTestCases() {
        for (let i = 0; i < this.caseFileTestCases.length; i++) {
            const testCase = this.caseFileTestCases[i];

            testCase.on("pointerdown", async () => {
                if (this.typingInProgress) return;

                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const letter: string = this.letterMap[i];
                if (this.selectedTestCases.includes(letter)) {
                    this.selectedTestCases = this.selectedTestCases.filter(
                        (test) => test !== letter,
                    );
                    testCase.setAlpha(1);

                    if (this.presentToJudgeButton) {
                        this.presentToJudgeButton.destroy();
                        this.presentToJudgeButton = undefined;
                        this.textObject.setText("");

                        await this.addAnimatedTypingText(this.thirdIntro, 19);
                    }
                } else {
                    if (this.selectedTestCases.length < 2) {
                        this.selectedTestCases.push(letter);
                        testCase.setAlpha(0.5);
                    } else {
                        this.textObject.setText("");
                        await this.addAnimatedTypingText(
                            'cout << "Remember: You can only select up to 2 test cases as evidence. Please deselect one of your currently selected test cases to choose a different one. Fair warning that switching tabs will reset your selections!" << endl;',
                            22,
                        );
                        this.reminderMessageReference = this.textObject;
                    }
                }

                if (
                    this.selectedTestCases.length === 2 &&
                    !this.presentToJudgeButton
                ) {
                    this.presentToJudgeButton = createTextButton.call(
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
                    );
                }
            });
        }
    }

    private drawTabs() {
        const greenTab = this.add
            .rectangle(870, 190, 148, 80, 0x00ff00, 0.8)
            .setOrigin(0.5)
            .setDepth(100)
            .setAlpha(0.09)
            .setInteractive();

        greenTab.on("pointerdown", async () => {
            if (this.typingInProgress) return;
            if (this.currentTab === "test-cases") return;
            this.caseFileTestCases = [];

            this.textObject.setText("");
            this.currentTab = "test-cases";
            this.backButton.destroy();
            this.caseFileCodeSnippet.destroy();

            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (this.programDescTextReference)
                this.programDescTextReference.destroy();

            const thirdIntro =
                "cout << \"These are the program's test cases. Use them as evidence. If a test shows the function gives the wrong result, it's guilty. If the tests support it, it's innocent. Some tests may be redundant, so choose the two that provide the strongest evidence by clicking on them. When you're ready, press the 'Present Evidence to Judge Compiler' button.\" << endl;";

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

        pinkTab.on("pointerdown", async () => {
            if (this.typingInProgress) return;
            if (this.currentTab === "explanation") return;
            if (this.selectedTestCases.length) this.selectedTestCases = [];
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

    async addAnimatedTypingText(text: string, fontSize: number = 21) {
        this.typingInProgress = true;

        this.textObject = this.add.text(100, 30, "", {
            fontSize: `${fontSize}px`,
            color: "#01ff34",
            wordWrap: { width: 800 },
        });

        await typewriterEffect(null, this.textObject.setText(text), text, 1); // TODO - remove 1
        this.typingInProgress = false;
    }

    init(data: {
        isTutorial: boolean;
        nextTutorialText: string;
        judge: Phaser.GameObjects.Sprite;
    }) {
        this.cameras.main.setBackgroundColor("#2d2d2d");
        this.add.rectangle(512, 80, 1024, 120, 0x000000, 0.8).setOrigin(0.5);
        this.currentTab = "code";
        this.isTutorial = data.isTutorial;
        this.nextTutorialText = data.nextTutorialText;
    }

    async create() {
        // 1. First, we are going to display the open case file sprite showing the program's code and adding the clickable tabs as well
        this.add
            .sprite(512, 450, "case-file-open-program", 0)
            .setDisplaySize(920, 600);
        this.drawTabs();

        // 2. Next, we will display the code snippet for the case file
        this.caseFileCodeSnippet = this.add
            .image(512, 450, "tutorial-code-1")
            .setDisplaySize(920, 600)
            .setScale(0.26)
            .setDepth(10);

        // 3. Next, we are going to introduce the user with the next tutorial's text
        this.showBackButton();
        await this.addAnimatedTypingText(this.nextTutorialText);
    }
}
