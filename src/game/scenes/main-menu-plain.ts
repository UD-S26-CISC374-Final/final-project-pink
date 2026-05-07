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
const COURT_BROWN = 0x2d1a0a;

export class MainMenuPlain extends Scene implements ChangeableScene {
    title: GameObjects.Text;
    gamemode: "Level1" | "Tutorial";

    constructor() {
        super("MainMenuPlain");
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
        this.add.rectangle(512, 384, 1024, 768, COURT_BROWN).setDepth(0);

        this.drawGavel();

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
            this.gamemode = "Tutorial";
            this.changeScene();
        });

        this.drawButton("TUTORIAL", 612, () => {
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
}
