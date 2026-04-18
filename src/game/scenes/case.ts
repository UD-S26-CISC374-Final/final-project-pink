import { Scene } from "phaser";
import { typewriterEffect } from "../utils/typeWriterAnimation";
import tutorialCases from "../data/tutorial-cases.json";
import createTextButton from "../utils/createTextButton";

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

    // ! For some reason, switching to the MainMenu scene isn't working properly

    private async goBack() {
        this.textObject.setText("");
        this.programDescTextReference.destroy();
        this.caseFileCodeSnippet = this.add
            .image(512, 450, "tutorial-code-1")
            .setDisplaySize(920, 600)
            .setScale(0.26)
            .setDepth(10);

        this.add
            .sprite(512, 450, "case-file-open-program", 0)
            .setDisplaySize(920, 600);

        if (this.currentTab !== "code") this.currentTab = "code";

        await this.addAnimatedTypingText(this.nextTutorialText);
    }

    private drawTabs() {
        const greenTab = this.add
            .rectangle(870, 190, 148, 80, 0x00ff00, 0.8)
            .setOrigin(0.5)
            .setDepth(100)
            .setAlpha(0.09)
            .setInteractive();

        greenTab.on("pointerdown", () => {
            if (this.typingInProgress) return;

            alert("You clicked the green tab!");
        });

        const pinkTab = this.add
            .rectangle(700, 190, 148, 80, 0xff00ff, 0.8)
            .setOrigin(0.5)
            .setDepth(100)
            .setAlpha(0.09)
            .setInteractive();

        pinkTab.on("pointerdown", async () => {
            if (this.typingInProgress) return;
            this.caseFileCodeSnippet.destroy();
            this.currentTab = "explanation";
            this.textObject.setText("");

            const fourthIntro =
                'cout << "Here is the program\'s statement of purpose, which gives a brief overview of what the program is supposed to do. This can help guide your analysis of the program and its test cases." << endl;';
            await this.addAnimatedTypingText(fourthIntro);

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
        });

        this.backButton = createTextButton
            .call(
                this,
                150,
                190,
                {
                    x: 0,
                    y: 0,
                    width: 100,
                    height: 40,
                    color: 0x000000,
                    alpha: 0.8,
                },
                {
                    text: "Go Back",
                    fontFamily: "Google Sans Code",
                    fontSize: 18,
                    color: "#ffffff",
                },
                true,
            )
            .setDepth(100);
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

    async addAnimatedTypingText(text: string) {
        this.typingInProgress = true;

        this.textObject = this.add.text(100, 30, "", {
            fontSize: "21px",
            color: "#01ff34",
            wordWrap: { width: 800 },
        });

        await typewriterEffect(null, this.textObject.setText(text), text, 1);
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
        // 1. first, we are going to introduce the user with the next tutorial's text
        await this.addAnimatedTypingText(this.nextTutorialText);

        // 2. Next, we are going to display the open case file sprite showing the program's code and adding the clickable tabs as well
        this.add
            .sprite(512, 450, "case-file-open-program", 0)
            .setDisplaySize(920, 600);
        this.drawTabs();

        // 3. Next, we will display the code snippet for the case file
        this.caseFileCodeSnippet = this.add
            .image(512, 450, "tutorial-code-1")
            .setDisplaySize(920, 600)
            .setScale(0.26)
            .setDepth(10);
    }
}
