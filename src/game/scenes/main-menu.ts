import { GameObjects, Scene } from "phaser";

import { EventBus } from "../event-bus";
import type { ChangeableScene } from "../reactable-scene";
import CaseManager from "../case-manager";

export class MainMenu extends Scene implements ChangeableScene {
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;
    logoTween: Phaser.Tweens.Tween | null;
    gamemode: "Level1" | "Tutorial";

    constructor() {
        super("MainMenu");
    }

    private drawButtons(buttonText: string, y: number, onClick: () => void) {
        this.add
            .text(512, y, buttonText, {
                fontFamily: "Arial Black",
                fontSize: 24,
                color: "#ffffff",
                stroke: "#000000",
                strokeThickness: 4,
                backgroundColor: "#ff0000",
                padding: { x: 10, y: 5 },
            })
            .setOrigin(0.5)
            .setInteractive()
            .on("pointerdown", () => {
                onClick();
            });
    }

    create() {
        this.background = this.add.image(512, 384, "background");

        this.title = this.add
            .text(512, 260, "Case By Case", {
                fontFamily: "Arial Black",
                fontSize: 70,
                color: "#ffffff",
                stroke: "#000000",
                strokeThickness: 8,
                align: "center",
            })
            .setOrigin(0.5)
            .setDepth(100);

        this.drawButtons("Start", 400, () => {
            const caseManager = CaseManager.getInstance();
            if (caseManager.hasTutorialBeenCompleted()) {
                caseManager.loadRandomEasyCase();
                this.gamemode = "Level1";
            } else {
                caseManager.loadTutorial();
                this.gamemode = "Tutorial";
            }
            this.changeScene();
        });
        this.drawButtons("Tutorial", 460, () => {
            CaseManager.getInstance().loadTutorial();
            this.gamemode = "Tutorial";
            this.changeScene();
        });

        EventBus.emit("current-scene-ready", this);
    }

    changeScene() {
        if (this.gamemode === "Tutorial") {
            this.scene.start("Tutorial");
        } else {
            this.scene.start("Level1");
        }
    }

    moveSprite(callback: ({ x, y }: { x: number; y: number }) => void) {
        if (this.logoTween) {
            if (this.logoTween.isPlaying()) {
                this.logoTween.pause();
            } else {
                this.logoTween.play();
            }
        } else {
            this.logoTween = this.tweens.add({
                targets: this.logo,
                x: { value: 750, duration: 3000, ease: "Back.easeInOut" },
                y: { value: 80, duration: 1500, ease: "Sine.easeOut" },
                yoyo: true,
                repeat: -1,
                onUpdate: () => {
                    callback({
                        x: Math.floor(this.logo.x),
                        y: Math.floor(this.logo.y),
                    });
                },
            });
        }
    }
}
