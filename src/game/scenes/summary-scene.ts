import { Scene } from "phaser";
import CaseManager from "../case-manager";

const FONT = "Courier New";

export class SummaryScene extends Scene {
    constructor() {
        super("Summary");
    }

    private drawScorePanel(manager: CaseManager, width: number) {
        const total = manager.getTotalScore();
        const max = manager.getMaxPossibleScore();
        const correct = manager.getCorrectVerdictCount();
        const totalCases = manager.getTotalCases();

        // Panel background
        this.add.rectangle(width / 2, 210, 900, 180, 0x000000, 0.7).setOrigin(0.5);

        // Score (left)
        this.add
            .text(256, 175, "SCORE", { fontFamily: FONT, fontSize: 14, color: "#aaaaaa" })
            .setOrigin(0.5);
        this.add
            .text(256, 215, `${total}`, { fontFamily: FONT, fontSize: 52, color: "#01ff34" })
            .setOrigin(0.5);
        this.add
            .text(256, 255, `out of ${max} possible`, { fontFamily: FONT, fontSize: 14, color: "#aaaaaa" })
            .setOrigin(0.5);

        // Divider
        this.add.rectangle(512, 210, 2, 140, 0x444444).setOrigin(0.5);

        // Verdicts (right)
        this.add
            .text(768, 175, "VERDICTS", { fontFamily: FONT, fontSize: 14, color: "#aaaaaa" })
            .setOrigin(0.5);
        this.add
            .text(768, 215, `${correct} / ${totalCases}`, { fontFamily: FONT, fontSize: 52, color: "#01ff34" })
            .setOrigin(0.5);
        this.add
            .text(768, 255, "correct", { fontFamily: FONT, fontSize: 14, color: "#aaaaaa" })
            .setOrigin(0.5);
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
                fontFamily: FONT,
                fontSize: 16,
                color: "#aaaaaa",
            })
            .setOrigin(0.5);

        this.drawScorePanel(manager, width);

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
