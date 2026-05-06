import { GameObjects, Scene } from "phaser";

import { EventBus } from "../event-bus";
import type { ChangeableScene } from "../reactable-scene";
import CaseManager from "../case-manager";

const GOLD = "#D4A843";
const DARK_GOLD = "#8B6914";
const CREAM = "#F5F0E8";
const DARK_BG = 0x0d0d1a;
const PANEL_BG = 0x1a1008;

export class MainMenu extends Scene implements ChangeableScene {
    background: GameObjects.Rectangle;
    title: GameObjects.Text;
    gamemode: "Level1" | "Tutorial";

    constructor() {
        super("MainMenu");
    }

    private drawButton(label: string, y: number, onClick: () => void) {
        const width = 260;
        const height = 52;
        const x = 512;

        const panel = this.add
            .rectangle(x, y, width, height, PANEL_BG)
            .setStrokeStyle(2, 0xd4a843);

        const text = this.add
            .text(x, y, label, {
                fontFamily: "Cinzel",
                fontSize: 22,
                fontStyle: "bold",
                color: GOLD,
            })
            .setOrigin(0.5);

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
        // Solid dark background — replace rectangle with an image key once available
        this.background = this.add
            .rectangle(512, 384, 1024, 768, DARK_BG)
            .setDepth(0);

        // Decorative horizontal rules
        this.add.rectangle(512, 310, 500, 2, 0xd4a843).setDepth(1);
        this.add.rectangle(512, 360, 500, 2, 0xd4a843).setDepth(1);

        this.title = this.add
            .text(512, 220, "CASE BY CASE", {
                fontFamily: "Cinzel",
                fontSize: 72,
                fontStyle: "900",
                color: GOLD,
                stroke: DARK_GOLD,
                strokeThickness: 6,
                align: "center",
                shadow: {
                    offsetX: 3,
                    offsetY: 3,
                    color: "#000000",
                    blur: 8,
                    fill: true,
                },
            })
            .setOrigin(0.5)
            .setDepth(2);

        this.add
            .text(512, 335, "A Court of Code and Consequence", {
                fontFamily: "Cinzel",
                fontSize: 18,
                color: CREAM,
                align: "center",
            })
            .setOrigin(0.5)
            .setDepth(2);

        this.drawButtons();

        EventBus.emit("current-scene-ready", this);
    }

    private drawButtons() {
        this.drawButton("START", 430, () => {
            CaseManager.getInstance().loadTutorial();
            this.gamemode = "Tutorial";
            this.changeScene();
        });
        this.drawButton("TUTORIAL", 500, () => {
            CaseManager.getInstance().loadTutorial();
            this.gamemode = "Tutorial";
            this.changeScene();
        });
    }

    changeScene() {
        if (this.gamemode === "Tutorial") {
            this.scene.start("Tutorial");
        } else {
            this.scene.start("Level1");
        }
    }
}
