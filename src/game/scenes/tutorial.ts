import { GameObjects, Scene } from "phaser";
import tutorialCases from "../data/tutorial-cases.json";

export class Tutorial extends Scene {
    introTutorialText: GameObjects.Text;
    codeDesc: GameObjects.Text;
    descTutorialText: GameObjects.Text;

    constructor() {
        super("Tutorial");
    }

    create() {
        const bg = this.add.image(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            "template",
        );

        this.introTutorialText = this.add
            .text(
                22,
                14,
                "Welcome to the tutorial! This is where you'll learn the basics of getting the hang at being a lawyer at the Syntax Criminal Court! To \nstart, let's familiarize ourselves with the interface you'll be using to disect each case. Starting off, each case will follow this UI:",
                {
                    fontFamily: "Times New Roman",
                    fontSize: 18,
                    color: "#101ee4",
                    align: "left",
                    lineSpacing: 5,
                },
            )
            .setDepth(100);

        this.add.rectangle(373, 292, 700, 452, 0x000000);
        this.add.rectangle(868, 322, 266, 510, 0x000000);
        this.add.rectangle(120, 688, 179, 155, 0x000000);
        this.add.rectangle(310, 688, 179, 155, 0x000000);
        this.add.rectangle(502, 688, 179, 155, 0x000000);
        this.add.rectangle(692, 688, 179, 155, 0x000000);

        this.add.image(373, 292, "tutorial-code-1").setScale(0.3);

        this.codeDesc = this.add
            .text(
                755,
                100,
                "This function claims to \nreturn the non-negative \nabsolute value of any \nnumber.",
                {
                    fontFamily: "Times New Roman",
                    fontSize: 23,
                    color: "#ffffff",
                    align: "left",
                    lineSpacing: 5,
                },
            )
            .setDepth(100);

        this.descTutorialText = this.add
            .text(
                22,
                530,
                "The given function above claims to follow the specifications on the right. Counsel, select \nthe two test cases that best interrogate this claim. Will they confirm the function's innocence \nor expose its guilt?",
                {
                    fontFamily: "Times New Roman",
                    fontSize: 19,
                    color: "#101ee4",
                    align: "left",
                    lineSpacing: 5,
                },
            )
            .setDepth(100);

        // Force the image to match your game dimensions
        bg.setDisplaySize(this.scale.width, this.scale.height);
    }

    update() {}

    changeScene() {
        this.scene.start("GameOver");
    }
}
