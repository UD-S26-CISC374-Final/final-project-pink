import { Scene } from "phaser";
import CaseManager from "../case-manager";

// Loaded by hqureshi's preloader — falls back to monospace until that branch merges
const FONT = "Google Sans Code";
const DPR = window.devicePixelRatio || 1;

export class SummaryScene extends Scene {
    constructor() {
        super("Summary");
    }

    private drawScorePanel(manager: CaseManager, width: number) {
        const total = manager.getTotalScore();
        const max = manager.getMaxPossibleScore();
        const correct = manager.getCorrectVerdictCount();
        const totalCases = manager.getCaseResults().length;

        // Panel background
        this.add.rectangle(width / 2, 210, 900, 180, 0x000000, 0.7).setOrigin(0.5);

        // Score (left)
        this.add
            .text(256, 175, "SCORE", { fontFamily: FONT, fontSize: 14, color: "#aaaaaa", resolution: DPR })
            .setOrigin(0.5);
        this.add
            .text(256, 215, `${total}`, { fontFamily: FONT, fontSize: 52, color: "#01ff34", resolution: DPR })
            .setOrigin(0.5);
        this.add
            .text(256, 255, `out of ${max} possible`, { fontFamily: FONT, fontSize: 14, color: "#aaaaaa", resolution: DPR })
            .setOrigin(0.5);

        // Divider
        this.add.rectangle(512, 210, 2, 140, 0x444444).setOrigin(0.5);

        // Verdicts (right)
        this.add
            .text(768, 175, "VERDICTS", { fontFamily: FONT, fontSize: 14, color: "#aaaaaa", resolution: DPR })
            .setOrigin(0.5);
        this.add
            .text(768, 215, `${correct} / ${totalCases}`, { fontFamily: FONT, fontSize: 52, color: "#01ff34", resolution: DPR })
            .setOrigin(0.5);
        this.add
            .text(768, 255, "correct", { fontFamily: FONT, fontSize: 14, color: "#aaaaaa", resolution: DPR })
            .setOrigin(0.5);
    }

    private drawCaseBreakdown(manager: CaseManager, width: number, height: number) {
        const results = manager.getCaseResults();
        const rowHeight = 52;
        const labelY = 320;
        const listTop = 355;
        const listBottom = height - 80;
        const listHeight = listBottom - listTop;

        this.add
            .text(width / 2, labelY, "CASE BREAKDOWN", {
                fontFamily: FONT,
                fontSize: 13,
                color: "#aaaaaa",
                resolution: DPR,
            })
            .setOrigin(0.5);

        // Container holds all rows; its y shifts during scroll
        const container = this.add.container(0, listTop);

        results.forEach((result, i) => {
            const y = i * rowHeight + rowHeight / 2;
            const caseData = manager.getCaseById(result.caseId);
            const title = caseData?.title ?? result.caseId;
            const verdictColor = result.verdictCorrect ? "#01ff34" : "#ff4444";
            const verdictLabel = `${result.verdictCorrect ? "✓" : "✗"}  ${(result.playerVerdict as string).toUpperCase()}`;

            const rowAlpha = i % 2 === 0 ? 0.5 : 0.3;

            container.add([
                this.add.rectangle(width / 2, y, 900, rowHeight - 4, 0x000000, rowAlpha).setOrigin(0.5),
                this.add.text(80, y, title, { fontFamily: FONT, fontSize: 16, color: "#ffffff", resolution: DPR }).setOrigin(0, 0.5),
                this.add.text(width - 280, y, verdictLabel, { fontFamily: FONT, fontSize: 16, color: verdictColor, resolution: DPR }).setOrigin(0, 0.5),
                this.add.text(width - 90, y, `+${result.pointsEarned} pts`, { fontFamily: FONT, fontSize: 16, color: result.pointsEarned > 0 ? "#01ff34" : "#ff4444", resolution: DPR }).setOrigin(1, 0.5),
            ]);
        });

        // Clip rows to the list area
        const maskGraphics = this.add.graphics();
        maskGraphics.fillRect(0, listTop, width, listHeight);
        container.setMask(new Phaser.Display.Masks.GeometryMask(this, maskGraphics));

        // Scroll on mouse wheel
        const totalContentHeight = results.length * rowHeight;
        const maxScroll = Math.max(0, totalContentHeight - listHeight);

        this.input.on(
            Phaser.Input.Events.POINTER_WHEEL,
            (_p: Phaser.Input.Pointer, _go: Phaser.GameObjects.GameObject[], _dx: number, deltaY: number) => {
                container.y = Phaser.Math.Clamp(
                    container.y - deltaY * 0.5,
                    listTop - maxScroll,
                    listTop,
                );
            },
        );
    }

    create() {
        const manager = CaseManager.getInstance();

        // DEV PREVIEW: seed fake results so the layout is visible
        if (manager.getCaseResults().length === 0) {
            manager.loadCases("easy");
            manager.submitVerdict("guilty");
            manager.advanceCase();
            manager.submitVerdict("not guilty");
        }

        const { width, height } = this.cameras.main;

        this.cameras.main.setBackgroundColor("#2d2d2d");

        // Header bar
        this.add.rectangle(width / 2, 50, width, 100, 0x000000, 0.8).setOrigin(0.5);

        this.add
            .text(width / 2, 30, "COURT ADJOURNED", {
                fontFamily: FONT,
                fontSize: 36,
                color: "#01ff34",
                stroke: "#000000",
                strokeThickness: 4,
                resolution: DPR,
            })
            .setOrigin(0.5);

        const casesPlayed = manager.getCaseResults().length;
        const caseWord = casesPlayed === 1 ? "case" : "cases";

        this.add
            .text(width / 2, 68, `${casesPlayed} ${caseWord} heard today`, {
                fontFamily: FONT,
                fontSize: 16,
                color: "#aaaaaa",
                resolution: DPR,
            })
            .setOrigin(0.5);

        this.drawScorePanel(manager, width);
        this.drawCaseBreakdown(manager, width, height);

        // Return to menu button
        const btnBg = this.add
            .rectangle(width / 2, height - 50, 280, 44, 0x000000, 0.9)
            .setOrigin(0.5)
            .setInteractive();

        this.add
            .text(width / 2, height - 50, "Return to Main Menu", {
                fontFamily: FONT,
                fontSize: 18,
                color: "#01ff34",
                resolution: DPR,
            })
            .setOrigin(0.5);

        btnBg.on("pointerover", () => btnBg.setFillStyle(0x003300, 0.9));
        btnBg.on("pointerout", () => btnBg.setFillStyle(0x000000, 0.9));
        btnBg.on("pointerdown", () => this.scene.start("MainMenu"));
    }
}
