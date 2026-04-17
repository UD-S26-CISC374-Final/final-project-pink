import { Scene } from "phaser";
import tutorialCases from "../data/tutorial-cases.json";

export class Tutorial extends Scene {
    judge: Phaser.GameObjects.Sprite;

    constructor() {
        super("Tutorial");
    }

    create() {
        this.cameras.main.setBackgroundColor("#2d2d2d");

        const fullText =
            "cout << \"Welcome to the tutorial! I'm The Honorable Judge Compiler, and I'll be your guide as you learn the basics of being a lawyer at the Syntax Criminal Court! To start, let's familiarize ourselves with the interface you'll be using to dissect each case.\" << endl;";
        let currentText = "";
        let index = 0;

        this.add.rectangle(512, 130, 1024, 200, 0x000000, 0.8).setOrigin(0.5);

        const textObject = this.add
            .text(512, 130, "", {
                fontFamily: "Google Sans Code",
                fontSize: 25,
                color: "#01ff34",
                wordWrap: { width: 950, useAdvancedWrap: true },
            })
            .setOrigin(0.5);

        this.time.addEvent({
            delay: 50,
            repeat: fullText.length - 1,
            callback: () => {
                currentText += fullText[index];
                textObject.setText(currentText);
                index++;

                if (index === fullText.length) {
                    this.judge.anims.pause();
                    this.judge.setFrame(0);
                }
            },
        });

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
    }

    update() {}

    changeScene() {
        this.scene.start("GameOver");
    }
}
