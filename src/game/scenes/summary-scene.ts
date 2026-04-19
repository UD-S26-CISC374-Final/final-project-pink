import { Scene } from "phaser";
import CaseManager from "../case-manager";

export class SummaryScene extends Scene {
    constructor() {
        super("Summary");
    }

    create() {
        const manager = CaseManager.getInstance();
        const { width, height } = this.cameras.main;

        this.cameras.main.setBackgroundColor("#2d2d2d");

        // Header bar
        this.add.rectangle(width / 2, 50, width, 100, 0x000000, 0.8).setOrigin(0.5);

        this.add
            .text(width / 2, 30, "COURT ADJOURNED", {
                fontFamily: "Courier New",
                fontSize: 36,
                color: "#01ff34",
                stroke: "#000000",
                strokeThickness: 4,
            })
            .setOrigin(0.5);

        this.add
            .text(width / 2, 68, `${manager.getTotalCases()} case(s) heard today`, {
                fontFamily: "Courier New",
                fontSize: 16,
                color: "#aaaaaa",
            })
            .setOrigin(0.5);

        // Return to menu button
        const btnBg = this.add
            .rectangle(width / 2, height - 50, 280, 44, 0x000000, 0.9)
            .setOrigin(0.5)
            .setInteractive();

        this.add
            .text(width / 2, height - 50, "Return to Main Menu", {
                fontFamily: "Courier New",
                fontSize: 18,
                color: "#01ff34",
            })
            .setOrigin(0.5);

        btnBg.on("pointerover", () => btnBg.setFillStyle(0x003300, 0.9));
        btnBg.on("pointerout", () => btnBg.setFillStyle(0x000000, 0.9));
        btnBg.on("pointerdown", () => this.scene.start("MainMenu"));
    }
}
