import { Scene } from "phaser";
import tutorialCases from "../data/tutorial-cases.json";

export class Tutorial extends Scene {
    judge: Phaser.GameObjects.Sprite;
    index: number = 0;
    typingInProgress: boolean = false;

    constructor() {
        super("Tutorial");
    }

    private playGiveCaseFileAnimation() {
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

    private typewriterEffect(
        target: Phaser.GameObjects.Text,
        speedInMS: number = 50,
    ) {
        // credit for code: https://joel.net/creating-a-typewriter-effect-in-phaserjs-v3
        const message = target.text;
        const invisibleMessage = message.replace(/[^ ]/g, " ");
        target.text = "";
        let visibleText = "";

        return new Promise<void>((resolve) => {
            this.typingInProgress = true;
            const timer = target.scene.time.addEvent({
                delay: speedInMS,
                loop: true,
                callback: () => {
                    if (target.text === message) {
                        timer.destroy();
                        this.judge.anims.pause();
                        this.judge.setFrame(0);
                        this.typingInProgress = false;
                        resolve();
                        return;
                    }

                    visibleText += message[visibleText.length];
                    const invisibleText = invisibleMessage.substring(
                        visibleText.length,
                    );
                    target.setText(visibleText + invisibleText);
                },
            });
        });
    }

    async create() {
        this.cameras.main.setBackgroundColor("#2d2d2d");

        this.add.rectangle(512, 130, 1024, 205, 0x000000, 0.8).setOrigin(0.5);

        const textObject = this.add
            .text(512, 130, "", {
                fontFamily: "Google Sans Code",
                fontSize: 25,
                color: "#01ff34",
                wordWrap: { width: 950, useAdvancedWrap: true },
            })
            .setOrigin(0.5);

        const tutorialText = [
            "cout << \"Welcome to the tutorial! I'm The Honorable Judge Compiler, and I'll be your guide as you learn the basics of being a lawyer at the Syntax Criminal Court! To start, let's familiarize ourselves with the interface you'll be using to dissect each case.\" << endl;",
            'cout << "This is a case file. It contains all the information about a case. Each case file contains the program, the purpose it claims to serve, and a series of test cases that either prove or disprove its innocence. It\'s up to you to determine that based on the presented evidence. Click on the case file to read your first case!" << endl;',
        ];

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

        await this.typewriterEffect(textObject.setText(tutorialText[0]));

        const buttonContainer = this.add.container(512, 300).setAlpha(0);

        const buttonBackground = this.add
            .rectangle(0, 0, 200, 50, 0x000000, 0.8)
            .setOrigin(0.5);

        const buttonText = this.add
            .text(0, 0, "Next", {
                fontFamily: "Google Sans Code",
                fontSize: 20,
                color: "#01ff34",
            })
            .setOrigin(0.5);

        buttonContainer.add([buttonBackground, buttonText]);

        buttonContainer.setSize(buttonText.width, buttonText.height);
        buttonContainer.setInteractive();

        this.tweens.add({
            targets: buttonContainer,
            alpha: 1,
            duration: 1000,
            ease: "Power2",
        });

        buttonContainer.on("pointerdown", async () => {
            if (this.typingInProgress) return;
            this.judge.setTexture("judge-compiler-case-sprite");
            this.playGiveCaseFileAnimation();
            buttonContainer.destroy();
            const caseFileButton = this.add
                .rectangle(340, 575, 90, 127, 0x000000, 0)
                .setOrigin(0.5)
                .setInteractive();
            caseFileButton.on("pointerdown", async () => {
                if (this.typingInProgress) return;
                alert("PRESSED!");
            });
            await this.typewriterEffect(textObject.setText(tutorialText[1]));
        });
    }

    update() {}

    changeScene() {
        this.scene.start("GameOver");
    }
}
