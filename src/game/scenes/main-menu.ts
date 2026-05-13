import { GameObjects, Scene } from "phaser";

import { EventBus } from "../event-bus";
import type { ChangeableScene } from "../reactable-scene";
import CaseManager from "../case-manager";

// Swap to "IM Fell English" to preview the other option
//const TITLE_FONT = "Playfair Display";
const TITLE_FONT = "IM Fell English";

const GOLD = "#D4A843";
const DARK_GOLD = "#8B6914";
const CREAM = "#F5F0E8";
const PANEL_BG = 0x1a1008;

export class MainMenu extends Scene implements ChangeableScene {
    title: GameObjects.Text;
    gamemode: "Level" | "Tutorial";
    clickSound: Phaser.Sound.BaseSound;

    constructor() {
        super("MainMenu");
    }

    private setupBackground() {
        this.add
            .image(512, 384, "court_darker")
            .setDisplaySize(1024, 768)
            .setDepth(0);

        const flickerKeys = [
            "court_darker_lights_bright",
            "court_dark_back_lights_off",
            "court_dark_left_lights_off",
            "court_dark_3_lights_on",
            "court_other_2_lights_off",
        ];

        const flickerImgs = flickerKeys.map((key) =>
            this.add
                .image(512, 384, key)
                .setDisplaySize(1024, 768)
                .setDepth(1)
                .setAlpha(0),
        );

        const scheduleFlicker = () => {
            const delay =
                Math.random() < 0.25 ?
                    Phaser.Math.Between(80, 350)
                :   Phaser.Math.Between(500, 7000);

            this.time.delayedCall(delay, () => {
                const steps = Phaser.Math.Between(3, 18);
                const sequence: Array<Phaser.GameObjects.Image | null> = [
                    flickerImgs[Phaser.Math.Between(0, flickerImgs.length - 1)],
                ];
                for (let i = 1; i < steps; i++) {
                    sequence.push(
                        Math.random() < 0.4 ?
                            null
                        :   flickerImgs[
                                Phaser.Math.Between(0, flickerImgs.length - 1)
                            ],
                    );
                }

                let t = 0;
                for (let i = 0; i < sequence.length; i++) {
                    t += Phaser.Math.Between(20, 220);
                    const img = sequence[i];
                    const prev = i > 0 ? sequence[i - 1] : null;
                    this.time.delayedCall(t, () => {
                        if (prev && prev !== img) prev.setAlpha(0);
                        if (img) img.setAlpha(1);
                    });
                }

                this.time.delayedCall(t + 50, () => {
                    flickerImgs.forEach((f) => f.setAlpha(0));
                    scheduleFlicker();
                });
            });
        };

        this.time.delayedCall(Phaser.Math.Between(500, 1500), scheduleFlicker);
    }

    private drawJudge() {
        if (!this.textures.exists("judge-compiler-head")) return;
        const img = this.add.image(512, 386, "judge-compiler-head").setDepth(2);
        img.setDisplaySize(220, 150);
    }

    private drawGavel() {
        if (!this.textures.exists("gavel")) return;
        const img = this.add.image(512, 128, "gavel").setDepth(3);
        img.setScale(110 / img.height);
    }

    private drawButton(label: string, y: number, onClick: () => void) {
        const width = 260;
        const height = 52;
        const x = 512;

        const panel = this.add
            .rectangle(x, y, width, height, PANEL_BG)
            .setStrokeStyle(2, 0xd4a843)
            .setDepth(2);

        const text = this.add
            .text(x, y, label, {
                fontFamily: TITLE_FONT,
                fontSize: 22,
                color: GOLD,
            })
            .setOrigin(0.5)
            .setDepth(3);

        panel.setInteractive().on("pointerover", () => {
            panel.setFillStyle(0x2e1f06);
            text.setColor(CREAM);
        });

        panel.on("pointerout", () => {
            panel.setFillStyle(PANEL_BG);
            text.setColor(GOLD);
        });

        panel.on("pointerdown", () => {
            onClick();
        });
    }

    create() {
        this.setupBackground();
        this.drawJudge();
        this.drawGavel();

        this.clickSound = this.sound.add("button-click", {
            volume: 1.5,
        });

        const music = this.sound.add("theme-music", {
            volume: 0.1,
            loop: true,
        });

        // Start playing
        music.play();

        this.title = this.add
            .text(512, 200, "CASE BY CASE", {
                fontFamily: TITLE_FONT,
                fontSize: 92,
                color: GOLD,
                stroke: DARK_GOLD,
                strokeThickness: 7,
                align: "center",
                shadow: {
                    offsetX: 4,
                    offsetY: 4,
                    color: "#000000",
                    blur: 14,
                    fill: true,
                },
            })
            .setOrigin(0.5)
            .setDepth(2);

        this.add
            .text(512, 268, "A Court of Code and Consequence", {
                fontFamily: TITLE_FONT,
                fontSize: 20,
                color: CREAM,
                align: "center",
                shadow: {
                    offsetX: 2,
                    offsetY: 2,
                    color: "#000000",
                    blur: 8,
                    fill: true,
                },
            })
            .setOrigin(0.5)
            .setDepth(2);

        this.drawButton("START", 540, () => {
            CaseManager.getInstance().loadTutorial();
            this.gamemode = "Level";
            this.clickSound.play();

            this.cameras.main.once("camerafadeoutcomplete", () => {
                this.changeScene();
                music.stop();
            });
            this.cameras.main.fadeOut(1000, 0, 0, 0);
        });

        this.drawButton("TUTORIAL", 612, () => {
            CaseManager.getInstance().loadTutorial();
            this.gamemode = "Tutorial";
            this.clickSound.play();
            this.cameras.main.once("camerafadeoutcomplete", () => {
                this.changeScene();
                music.stop();
            });
            this.cameras.main.fadeOut(1000, 0, 0, 0);
        });

        EventBus.emit("current-scene-ready", this);
    }

    changeScene() {
        if (this.gamemode === "Tutorial") {
            this.scene.start("Tutorial");
        } else {
            const savedProgressData = localStorage.getItem(
                "savedProgressMainGame",
            );

            const saved =
                savedProgressData ?
                    (JSON.parse(savedProgressData) as {
                        currentCaseIndex?: number;
                        difficulty?: "easy" | "medium" | "hard";
                    })
                :   {};

            const { currentCaseIndex = 0, difficulty = "easy" } = saved as {
                currentCaseIndex?: number;
                difficulty?: "easy" | "medium" | "hard";
            };

            this.scene.start("Case", {
                isTutorial: false,
                nextTutorialText: "",
                difficulty,
                currentTutorialCaseIndex: currentCaseIndex,
            });
        }
    }
}
