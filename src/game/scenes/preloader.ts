import { Scene } from "phaser";

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

        this.load.audio("theme-music", ["audio/game-music.mp3"]);

        this.load.font("Google Sans Code", "fonts/Google-Sans-Code.ttf");
        this.load.image("gavel", "gavel.png");
        const courtImages = [
            "court_darkest",
            "court_darker",
            "court_darker_lights_bright",
            "court_default",
            "court_bright",
            "court_white",
            "court_other_2_lights_off",
            "court_mid_left_light_on",
            "court_dark_3_lights_on",
            "court_dark_back_lights_off",
            "court_dark_left_lights_off",
        ];
        for (const key of courtImages) {
            this.load.image(key, `court/${key}.jpg`);
        }
    }

    create() {
        // Explicitly trigger each web font download — browsers skip downloading
        // Google Fonts unless they're used in CSS text, which never happens in a
        // canvas game. document.fonts.load() forces the download and resolves when done.
        void Promise.all([
            document.fonts.load('400 1em "IM Fell English"'),
            document.fonts.load('700 1em "Playfair Display"'),
        ]).then(() => {
            this.scene.start("MainMenu");
            //this.scene.start("MainMenuPlain");
        });
    }
}
