import { GameObjects, Scene } from "phaser";
import tutorialCases from "../data/tutorial-cases.json";

export class Tutorial extends Scene {
    title: GameObjects.Text;

    constructor() {
        super("Tutorial");
    }

    create() {
        const bg = this.add.image(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            "template",
        );

        console.log(tutorialCases);

        this.title = this.add
            .text(
                22,
                16,
                "Welcome to the tutorial! This is where you'll learn the basics of getting the hang at being a lawyer at the Syntax Criminal Court! To start, let's familiarize \nourselves with the interface you'll be using to disect each case. Starting off, each case will follow this UI:",
                {
                    fontFamily: "Times New Roman",
                    fontSize: 16,
                    color: "#101ee4",
                    align: "left",
                    lineSpacing: 5,
                },
            )
            .setDepth(100);

        // this.title = this.add
        //     .text(920, 20, "Case 1 of 10", {
        //         fontFamily: "Times New Roman",
        //         fontSize: 16,
        //         fontStyle: "bold",
        //         color: "#e41033",
        //         align: "left",
        //     })
        //     .setDepth(100);

        this.add.rectangle(373, 292, 700, 452, 0x000000);
        this.add.rectangle(868, 322, 266, 510, 0x000000);
        //                  x,   y,   w,   h,  color

        // Force the image to match your game dimensions
        bg.setDisplaySize(this.scale.width, this.scale.height);
    }

    update() {}

    changeScene() {
        this.scene.start("GameOver");
    }
}
