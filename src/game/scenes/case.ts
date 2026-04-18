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
    showTestCases = false;
    showProgramPurpose = false;
    currTutorialCaseIndex = 0;
    currTutorialCaseDesc =
        tutorialCases[this.currTutorialCaseIndex].description;
    programDescTextReference: Phaser.GameObjects.Text;

    // TODO - clean up the sloppy code, make helper functions, there's a lot of duplicate code
    // TODO - have it so that when you click on the tab, instead of having to wait for the dialogue to finish, the user can click back immediately and it will stop the current dialogue and go back to the previous one

    init(data: {
        isTutorial: boolean;
        nextTutorialText: string;
        judge: Phaser.GameObjects.Sprite;
    }) {
        this.cameras.main.setBackgroundColor("#2d2d2d");
        this.add.rectangle(512, 80, 1024, 120, 0x000000, 0.8).setOrigin(0.5);

        this.isTutorial = data.isTutorial;
        this.nextTutorialText = data.nextTutorialText;
    }

    async create() {
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

        const caseFileCodeSnippet = this.add
            .image(512, 450, "tutorial-code-1")
            .setDisplaySize(920, 600)
            .setScale(0.4)
            .setDepth(10);

        pinkTab.on("pointerdown", async () => {
            if (this.typingInProgress) return;
            caseFileCodeSnippet.destroy();

            const fourthIntro =
                'cout << "Here is the program\'s statement of purpose, which gives a brief overview of what the program is supposed to do. This can help guide your analysis of the program and its test cases." << endl;';

            // this adds the current tutorial case's program description
            this.programDescTextReference = this.add
                .text(512, 350, this.currTutorialCaseDesc, {
                    fontFamily: "Google Sans Code",
                    fontSize: 23,
                    color: "#ffffff",
                    wordWrap: { width: 600, useAdvancedWrap: true },
                })
                .setOrigin(0.5);

            this.typingInProgress = true;
            await typewriterEffect(
                null,
                this.textObject.setText(fourthIntro),
                fourthIntro,
            );
            this.typingInProgress = false;

            const backButton = createTextButton
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

            backButton.on("pointerdown", async () => {
                if (this.typingInProgress) return;
                this.textObject.setText("");
                this.programDescTextReference.destroy();
                this.add
                    .image(512, 450, "tutorial-code-1")
                    .setDisplaySize(920, 600)
                    .setScale(0.4)
                    .setDepth(10);
                backButton.destroy();

                this.typingInProgress = true;
                await typewriterEffect(
                    null,
                    this.textObject.setText(this.nextTutorialText),
                    this.nextTutorialText,
                );
                this.typingInProgress = false;
            });
        });

        this.add
            .sprite(512, 450, "case-file-open-program", 0)
            .setDisplaySize(920, 600);

        this.textObject = this.add
            .text(512, 75, "", {
                fontFamily: "Google Sans Code",
                fontSize: 20,
                color: "#01ff34",
                wordWrap: { width: 950, useAdvancedWrap: true },
            })
            .setOrigin(0.5);

        this.typingInProgress = true;

        await typewriterEffect(
            null,
            this.textObject.setText(this.nextTutorialText),
            this.nextTutorialText,
            1,
        ); // TODO - remove 1

        this.typingInProgress = false;
    }
    update() {}
}
