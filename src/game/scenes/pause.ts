import { Scene } from "phaser";
import createTextButton from "../utils/createTextButton";
import { typewriterEffect } from "../utils/typeWriterAnimation";
import tutorialCases from "../data/tutorial-cases.json";

export class Pause extends Scene {
    isTutorial: boolean;
    nextTutorialText: string;
    difficulty: "easy" | "medium" | "hard";
    currentTutorialCaseIndex: number;
    textObject: Phaser.GameObjects.Text;
    typingInProgress: boolean = false;
    judge: Phaser.GameObjects.Sprite | undefined;
    saveProgressButton: Phaser.GameObjects.Container;

    constructor() {
        super("Pause");
    }

    private playJudgeSpeakingAnimation() {
        this.judge = this.add
            .sprite(
                this.cameras.main.width,
                this.cameras.main.height,
                "judge-compiler-sprite",
                0,
            )
            .setOrigin(1, 1)
            .setScale(3);

        this.anims.create({
            key: "happy-speaking",
            frames: this.anims.generateFrameNumbers("judge-compiler-sprite", {
                frames: [0, 1, 2],
            }),
            frameRate: 3,
            repeat: -1,
        });

        this.judge.play("happy-speaking");
    }

    async addAnimatedTypingText(
        text: string,
        fontSize: number = 21,
        speed: number = 30,
    ) {
        this.typingInProgress = true;

        this.textObject = this.add.text(100, 30, "", {
            fontSize: `${fontSize}px`,
            color: "#01ff34",
            wordWrap: { width: 800 },
        });

        await typewriterEffect(
            null,
            this.textObject.setText(text),
            text,
            speed,
        ); 

        this.typingInProgress = false;

        if (this.judge) {
            this.judge.anims.pause();
            this.judge.setFrame(0);
        }
    }

    async init(data: {
        isTutorial: boolean;
        nextTutorialText: string;
        difficulty: "easy" | "medium" | "hard";
        currentTutorialCaseIndex: number;
    }) {
        this.cameras.main.setBackgroundColor("#2d2d2d");
        this.add.rectangle(512, 80, 1024, 120, 0x000000, 0.8).setOrigin(0.5);
        this.isTutorial = data.isTutorial;
        this.nextTutorialText = data.nextTutorialText;
        this.difficulty = data.difficulty;
        this.currentTutorialCaseIndex = data.currentTutorialCaseIndex + 1;

        this.playJudgeSpeakingAnimation();
        await this.addAnimatedTypingText(this.nextTutorialText, 20);
    }

    private showMainMenuButton() {
        createTextButton
            .call(
                this,
                850,
                240,
                {
                    x: 0,
                    y: 0,
                    width: 160,
                    height: 40,
                    color: 0x000000,
                    alpha: 1,
                },
                {
                    text: "Main Menu",
                    fontFamily: "Google Sans Code",
                    fontSize: 18,
                    color: "#ffffff",
                },
                true,
            )
            .on("pointerdown", () => {
                if (this.typingInProgress) return;

                const confirmation = confirm(
                    "Are you sure you want to return to the main menu? Make sure to save your progress before exiting!",
                );

                if (!confirmation) return;

                this.scene.stop("Pause");
                this.scene.start("MainMenu");
            });
    }

    create() {
        this.add
            .text(512, 384, "Courtroom In Recess!", {
                fontFamily: "Google Sans Code",
                fontSize: 40,
                color: "#ffffff",
            })
            .setOrigin(0.5);

        const continueButton = createTextButton.call(
            this,
            850,
            190,
            {
                x: 0,
                y: 0,
                width: 160,
                height: 40,
                color: 0x000000,
                alpha: 1,
            },
            {
                text: "Next Case",
                fontFamily: "Google Sans Code",
                fontSize: 18,
                color: "#ffffff",
            },
            true,
        );

        this.saveProgressButton = createTextButton.call(
            this,
            850,
            240,
            {
                x: 0,
                y: 0,
                width: 160,
                height: 40,
                color: 0x000000,
                alpha: 1,
            },
            {
                text: "Save Progress",
                fontFamily: "Google Sans Code",
                fontSize: 18,
                color: "#ffffff",
            },
            true,
        );

        this.saveProgressButton.on("pointerdown", async () => {
            if (this.typingInProgress) return;

            localStorage.setItem(
                "savedProgress",
                JSON.stringify({
                    currentTutorialCaseIndex: this.currentTutorialCaseIndex,
                    difficulty: this.difficulty,
                }),
            );

            this.textObject.setText("");

            this.saveProgressButton.destroy();
            this.showMainMenuButton();

            await this.addAnimatedTypingText(
                'cout << "Progress saved! Next time you come back, you\'ll continue from where you left off." << endl;',
                20,
            );
        });

        continueButton.on("pointerdown", () => {
            this.scene.start("Case", {
                isTutorial: this.isTutorial,
                nextTutorialText: tutorialCases[this.currentTutorialCaseIndex]
                    .tutorialText as string,
                difficulty: this.difficulty,
                currentTutorialCaseIndex: this.currentTutorialCaseIndex,
            });
        });
    }
}
