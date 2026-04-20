import { Scene } from "phaser";
import { typewriterEffect } from "../utils/typeWriterAnimation";
import createTextButton from "../utils/createTextButton";

export class Tutorial extends Scene {
    judge: Phaser.GameObjects.Sprite;
    index: number = 0;
    typingInProgress: boolean = false;

    constructor() {
        super("Tutorial");
    }

    init() {
        this.cameras.main.setBackgroundColor("#2d2d2d");
    }

    playGiveCaseFileAnimation() {
        this.anims.create({
            key: "give-case-file",
            frames: this.anims.generateFrameNumbers(
                "judge-compiler-case-sprite",
                {
                    frames: [0, 1, 2],
                },
            ),
            frameRate: 3,
            repeat: -1,
        });

        this.judge.destroy();

        this.judge = this.add
            .sprite(
                0,
                this.cameras.main.height,
                "judge-compiler-case-sprite",
                0,
            )
            .setOrigin(0, 1)
            .setScale(3);

        this.judge.play("give-case-file");
    }

    async create() {
        this.add.rectangle(512, 130, 1024, 205, 0x000000, 0.8).setOrigin(0.5);

        const textObject = this.add
            .text(512, 130, "", {
                fontFamily: "Google Sans Code",
                fontSize: 25,
                color: "#01ff34",
                wordWrap: { width: 950, useAdvancedWrap: true },
            })
            .setOrigin(0.5);

        this.anims.create({
            key: "talk",
            frames: this.anims.generateFrameNumbers("judge-compiler-sprite", {
                frames: [0, 1, 2],
            }),
            frameRate: 3,
            repeat: -1,
        });

        this.judge = this.add
            .sprite(0, this.cameras.main.height, "judge-compiler-sprite", 0)
            .setOrigin(0, 1)
            .setScale(3);

        this.judge.play("talk");

        const firstIntro =
            "cout << \"Welcome to the tutorial! I'm The Honorable Judge Compiler, and I'll be your guide as you learn the basics of being a lawyer at the Syntax Criminal Court! To start, let's familiarize ourselves with the interface you'll be using to dissect each case.\" << endl;";

        await typewriterEffect(
            this.judge,
            textObject.setText(firstIntro),
            firstIntro,
            1,
        ); // TODO - remove 1

        const buttonContainer = createTextButton.call(
            this,
            512,
            300,
            {
                x: 0,
                y: 0,
                width: 200,
                height: 50,
                color: 0x000000,
                alpha: 0.8,
            },
            {
                text: "Next",
                fontFamily: "Google Sans Code",
                fontSize: 20,
                color: "#01ff34",
            },
            true,
        );

        buttonContainer.on("pointerdown", async () => {
            if (this.typingInProgress) return;
            this.judge.setTexture("judge-compiler-case-sprite");
            this.playGiveCaseFileAnimation();
            buttonContainer.destroy();
            const caseFileButton = this.add
                .rectangle(340, 575, 90, 127, 0x000000, 0)
                .setOrigin(0.5)
                .setInteractive();

            const secondIntro =
                'cout << "This is a case file. It contains all the information about a case. Each case file contains the program, the purpose it claims to serve, and a series of test cases that either prove or disprove its innocence. It\'s up to you to determine that based on the presented evidence. Click on the case file to read your first case!" << endl;';

            await typewriterEffect(
                this.judge,
                textObject.setText(secondIntro),
                secondIntro,
                1,
            ); // TODO - remove 1

            const thirdIntro =
                'cout << "Great! Each file will have a program for you to examine, like shown below. If you\'re unsure what a program is trying to do, click on the pink tab to read its statement of purpose. To see the set of test cases, click on the green tab!" << endl;';

            caseFileButton.on("pointerdown", () => {
                if (this.typingInProgress) return;
                this.judge.destroy();
                this.changeScene(true, thirdIntro, "easy", 0);
            });
        });
    }

    changeScene(
        isTutorial: boolean = true,
        nextTutorialText: string,
        difficulty: "easy" | "medium" | "hard" = "easy",
        currentTutorialCaseIndex: number = 0,
    ) {
        this.scene.launch("Case", {
            isTutorial,
            nextTutorialText,
            difficulty,
            currentTutorialCaseIndex,
        });
    }
}
