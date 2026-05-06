import { Scene } from "phaser";
import tutorialCases from "../data/tutorial-cases.json";

export class Preloader extends Scene {
    constructor() {
        super("Preloader");
    }

    init() {
        //  We loaded this image in our Boot Scene, so we can display it here

        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on("progress", (progress: number) => {
            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + 460 * progress;
        });
    }

    preload() {
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath("assets");
        this.load.image("judge-compiler", "judge_compiler_happy.png");
        this.load.spritesheet(
            "judge-compiler-sprite",
            "sprites/judge_compiler_speaking.png",
            { frameWidth: 128, frameHeight: 128 },
        );
        this.load.spritesheet(
            "judge-compiler-case-sprite",
            "sprites/judge_compiler_case.png",
            { frameWidth: 128, frameHeight: 128 },
        );

        this.load.spritesheet(
            "case-file-open-program",
            "sprites/case-file-open-program.png",
            {
                frameWidth: 32,
                frameHeight: 32,
            },
        );

        this.load.spritesheet(
            "judge-compiler-speaking-sad",
            "sprites/judge_compiler_speaking_sad.png",
            {
                frameWidth: 128,
                frameHeight: 128,
            },
        );

        this.load.spritesheet("innocent", "sprites/innocent.png", {
            frameWidth: 128,
            frameHeight: 32,
        });

        this.load.spritesheet("guilty", "sprites/guilty.png", {
            frameWidth: 128,
            frameHeight: 32,
        });

        let i = 0;
        while (i < tutorialCases.length) {
            this.load.image(
                `tutorial-code-${i}`,
                `tutorial-cases-code/tutorial-${i}.png`,
            );

            for (let j = 1; j <= tutorialCases[i].testFeedback.length; j++) {
                this.load.image(
                    `tutorial-${i}-t${j}`,
                    `tutorial-cases-code/test-cases/tutorial-${i}-t${j}.png`,
                );
            }
            i++;
        }

        this.load.font("Google Sans Code", "fonts/Google-Sans-Code.ttf");
    }

    create() {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start("MainMenu");
    }
}
