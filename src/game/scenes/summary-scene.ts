import { Scene } from "phaser";
import CaseManager from "../case-manager";

const FONT = "Google Sans Code";
const DPR = window.devicePixelRatio || 1;
const PANEL_W = 660;
const SCREEN_W = 1024;
const SCREEN_H = 768;
const DEFAULT_BUBBLE = "Select a case to\nreview the evidence.";

// Right panel center x (used for sprite + bubble)
const RIGHT_CX = PANEL_W + (SCREEN_W - PANEL_W) / 2; // 842

export class SummaryScene extends Scene {
    private bubbleBg!: Phaser.GameObjects.Graphics;
    private bubbleText!: Phaser.GameObjects.Text;
    private stamp!: Phaser.GameObjects.Image;

    constructor() {
        super("Summary");
    }

    preload() {
        this.load.setPath("assets");
        this.load.image("judge_compiler", "judge_compiler.PNG");
        this.load.image("stamp_guilty", "guilty.png");
        this.load.image("stamp_not_guilty", "not_guilty.png");
    }

    // ── Speech bubble ──────────────────────────────────────────────────────────

    private updateSpeechBubble(rawText: string) {
        this.bubbleText.setText(rawText);
        this.redrawBubble();
    }

    private redrawBubble() {
        const bounds = this.bubbleText.getBounds();
        const pad = 14;
        const bw = Math.max(180, bounds.width + pad * 2);
        const bh = bounds.height + pad * 2;

        // Position: upper-center of right panel, never crossing the panel divider
        const bx = Math.max(PANEL_W + 10 + bw / 2, RIGHT_CX);
        const by = SCREEN_H - 330 - bh / 2;

        this.bubbleBg.clear();

        // Shadow
        this.bubbleBg.fillStyle(0x000000, 0.25);
        this.bubbleBg.fillRoundedRect(bx - bw / 2 + 3, by - bh / 2 + 3, bw, bh, 10);

        // Bubble body
        this.bubbleBg.fillStyle(0xf0f0f0, 0.97);
        this.bubbleBg.fillRoundedRect(bx - bw / 2, by - bh / 2, bw, bh, 10);

        // Bubble outline
        this.bubbleBg.lineStyle(1.5, 0x888888, 0.6);
        this.bubbleBg.strokeRoundedRect(bx - bw / 2, by - bh / 2, bw, bh, 10);

        // Tail pointing down toward sprite
        const tx = bx;
        const ty = by + bh / 2;
        this.bubbleBg.fillStyle(0xf0f0f0, 0.97);
        this.bubbleBg.fillTriangle(tx - 10, ty, tx + 10, ty, tx, ty + 18);

        // Reposition text to bubble center
        this.bubbleText.setPosition(bx, by);
    }

    // ── Panel HTML/CSS ─────────────────────────────────────────────────────────

    private buildPanel(manager: CaseManager): string {
        const total = manager.getTotalScore();
        const max = manager.getMaxPossibleScore();
        const correct = manager.getCorrectVerdictCount();
        const results = manager.getCaseResults();
        const totalCases = results.length;
        const caseWord = totalCases === 1 ? "case" : "cases";

        const rowsHTML = results
            .map((result) => {
                const caseData = manager.getCaseById(result.caseId);
                const title = caseData?.title ?? result.caseId;
                const isGuilty = result.playerVerdict === "guilty";
                const verdictBadge = isGuilty
                    ? `<img src="assets/guilty_no_frame.png" class="verdict-img">`
                    : `<img src="assets/not_guilty_no_frame_green.png" class="verdict-img">`;
                const ptsSign = result.pointsEarned >= 0 ? "+" : "";
                const ptsColor = result.pointsEarned > 0 ? "#E8A000" : "#ff4444";
                const rowClass = result.pointsEarned > 0 ? "case-row row-positive" : "case-row";

                let expandedHTML = "";
                if (caseData) {
                    const LETTER_IDX: Record<string, number | undefined> = { A: 0, B: 1, C: 2, D: 3 };

                    const submittedCards = result.selectedEvidenceIds
                        .map((letter) => {
                            const i = LETTER_IDX[letter];
                            if (i === undefined) return "";
                            const test = caseData.evidencePool?.[i];
                            const fb = caseData.testFeedback[i];
                            const cls = fb.quality === "essential" ? "card-good" : "card-bad";
                            const label = test?.label ?? letter;
                            return `<div class="ev-card ${cls}"><code>${label}</code><p>${fb.feedback}</p></div>`;
                        })
                        .join("");

                    const selectedIndices = new Set(result.selectedEvidenceIds.map((l) => LETTER_IDX[l]));
                    const missedCards = caseData.testFeedback
                        .map((fb, i) => ({ fb, i, test: caseData.evidencePool?.[i] }))
                        .filter(({ i, fb }) => !selectedIndices.has(i) && fb.quality === "essential")
                        .map(({ fb, test }) => {
                            const label = test?.label ?? "—";
                            return `<div class="ev-card card-missed"><code>${label}</code><p>${fb.feedback}</p></div>`;
                        })
                        .join("");

                    expandedHTML = `<div class="exp">
                        <div class="key">
                            <span class="ki ki-good">Good Evidence</span>
                            <span class="ki ki-bad">Redundant / Misleading</span>
                            <span class="ki ki-missed">Not Submitted</span>
                        </div>
                        <div class="cards">${submittedCards}${missedCards}</div>
                    </div>`;
                }

                const closingEncoded = encodeURIComponent(caseData?.closingStatement ?? "");

                return `<div class="${rowClass}" data-case-id="${result.caseId}" data-verdict="${result.playerVerdict}" data-closing="${closingEncoded}">
                    <div class="row-hdr">
                        <span class="ctitle">${title}</span>
                        <div class="rright">
                            ${verdictBadge}
                            <span style="color:${ptsColor};font-size:13px;${result.pointsEarned > 0 ? "text-shadow:0 0 8px rgba(232,160,0,.7);font-weight:bold" : ""}">${ptsSign}${result.pointsEarned}&nbsp;pts</span>
                            <span class="chev">▼</span>
                        </div>
                    </div>
                    ${expandedHTML}
                </div>`;
            })
            .join("");

        const css = `
<style>
*{box-sizing:border-box;margin:0;padding:0}
/* Panel spans full screen width; only the lower section is clipped to left 660px */
.panel{width:${SCREEN_W}px;height:${SCREEN_H}px;background:transparent;display:flex;flex-direction:column;font-family:'Google Sans Code',monospace;color:#fff;overflow:hidden}
.hdr{background:#0f0f0f;padding:18px 32px 14px;border-bottom:1px solid #2a2a2a;flex-shrink:0}
.htitle{font-size:30px;color:#01ff34;text-align:center;letter-spacing:4px;text-shadow:0 0 14px rgba(1,255,52,.4)}
.hsub{font-size:12px;color:#666;text-align:center;margin-top:5px}
.metrics{display:flex;gap:0;background:#141414;border-bottom:1px solid #2a2a2a;flex-shrink:0}
.metric{flex:1;padding:20px 32px;text-align:center;border-right:1px solid #2a2a2a}
.metric:last-child{border-right:none}
.mlbl{font-size:11px;color:#666;letter-spacing:3px}
.mval{font-size:48px;color:#01ff34;line-height:1.1;margin:8px 0 5px;font-weight:bold}
.msub{font-size:12px;color:#444}
/* Lower section: only 660px wide so Judge Compiler is visible on the right */
.lower{width:${PANEL_W}px;flex:1;background:#1a1a1a;display:flex;flex-direction:column;overflow:hidden;border-right:1px solid #2a2a2a}
.llbl{font-size:10px;color:#666;letter-spacing:2px;text-align:center;padding:10px 20px 8px;flex-shrink:0}
.clist{flex:1;overflow-y:auto;padding:0 20px;scrollbar-width:thin;scrollbar-color:#3a3a3a #1a1a1a}
.clist::-webkit-scrollbar{width:5px}
.clist::-webkit-scrollbar-track{background:#1a1a1a}
.clist::-webkit-scrollbar-thumb{background:#3a3a3a;border-radius:3px}
.case-row{margin-bottom:5px;border-radius:5px;border:1px solid #2c2c2c;cursor:pointer;background:rgba(0,0,0,.4);opacity:0;transform:translateX(-24px);transition:opacity .25s ease,transform .25s ease}
.case-row.visible{opacity:1;transform:translateX(0)}
.case-row.row-positive{border-color:#7a5c00;box-shadow:0 0 10px rgba(232,160,0,.25),inset 0 0 24px rgba(232,160,0,.07)}
.case-row.expanded{border-color:#484848}
.row-hdr{display:flex;align-items:center;justify-content:space-between;padding:12px 14px}
.row-hdr:hover{background:rgba(255,255,255,.04)}
.ctitle{font-size:14px;color:#e0e0e0;flex:1}
.rright{display:flex;align-items:center;gap:12px}
.verdict-img{height:28px;width:auto;object-fit:contain;display:block;filter:drop-shadow(0 1px 3px rgba(0,0,0,.5))}
.chev{font-size:11px;color:#777;transition:transform .2s;display:inline-block}
.case-row.expanded .chev{transform:rotate(180deg)}
.exp{display:none;padding:10px 14px 14px;border-top:1px solid #2c2c2c}
.case-row.expanded .exp{display:block}
.key{display:flex;gap:14px;margin-bottom:10px;flex-wrap:wrap}
.ki{font-size:10px;color:#888;display:flex;align-items:center;gap:5px}
.ki::before{content:'';display:inline-block;width:10px;height:10px;border-radius:2px;flex-shrink:0}
.ki-good::before{background:#01ff34}
.ki-bad::before{background:#ff4444}
.ki-missed::before{background:#ffaa00}
.cards{display:flex;flex-direction:column;gap:5px}
.ev-card{border-radius:4px;padding:8px 10px;border:2px solid}
.card-good{border-color:#01ff34;background:rgba(1,255,52,.07)}
.card-bad{border-color:#ff4444;background:rgba(255,68,68,.07)}
.card-missed{border-color:#ffaa00;background:rgba(255,170,0,.07)}
code{display:block;font-family:'Google Sans Code',monospace;font-size:12px;color:#bbb;margin:2px 0}
.ev-card p{font-size:11px;color:#888;margin-top:3px;line-height:1.4}
.btn-area{padding:14px 20px;flex-shrink:0}
.mbtn{width:100%;padding:11px;background:rgba(0,0,0,.9);border:1px solid #01ff34;color:#01ff34;font-family:'Google Sans Code',monospace;font-size:14px;cursor:pointer;border-radius:4px;letter-spacing:1px;transition:background .15s}
.mbtn:hover{background:rgba(0,40,0,.9)}
</style>`;

        return `${css}
<div class="panel">
  <div class="hdr">
    <div class="htitle">COURT ADJOURNED</div>
    <div class="hsub">${totalCases}&nbsp;${caseWord} heard today</div>
  </div>
  <div class="metrics">
    <div class="metric">
      <div class="mlbl">SCORE</div>
      <div class="mval">${total}</div>
      <div class="msub">out of ${max} possible</div>
    </div>
    <div class="metric">
      <div class="mlbl">VERDICTS</div>
      <div class="mval">${correct}&nbsp;/&nbsp;${totalCases}</div>
      <div class="msub">correct</div>
    </div>
  </div>
  <div class="lower">
    <div class="llbl">CASE BREAKDOWN</div>
    <div class="clist" id="case-list">${rowsHTML}</div>
    <div class="btn-area"><button class="mbtn" id="menu-btn">Return to Main Menu</button></div>
  </div>
</div>`;
    }

    // ── Stamp animation ────────────────────────────────────────────────────────

    private slamStamp(key: string) {
        this.stamp.setTexture(key);
        const targetScale = Math.min(200 / this.stamp.width, 1);
        this.tweens.killTweensOf(this.stamp);

        this.stamp.setAlpha(1).setScale(targetScale * 3).setRotation(-0.35);

        this.tweens.add({
            targets: this.stamp,
            scale: targetScale,
            rotation: -0.12,
            duration: 180,
            ease: "Back.Out",
            onComplete: () => {
                this.time.delayedCall(650, () => {
                    this.tweens.add({
                        targets: this.stamp,
                        alpha: 0,
                        scale: targetScale * 0.85,
                        duration: 220,
                        ease: "Sine.In",
                    });
                });
            },
        });
    }

    private playIntroSequence(rowEls: HTMLElement[]) {
        const PER_CASE = 1500;

        rowEls.forEach((rowEl, i) => {
            this.time.delayedCall(i * PER_CASE + 150, () => {
                rowEl.classList.add("visible");
            });

            const verdict = rowEl.dataset.verdict;
            if (verdict === "guilty" || verdict === "not guilty") {
                const key = verdict === "guilty" ? "stamp_guilty" : "stamp_not_guilty";
                this.time.delayedCall(i * PER_CASE + 550, () => {
                    this.slamStamp(key);
                });
            }
        });
    }

    // ── Scene lifecycle ────────────────────────────────────────────────────────

    create() {
        const manager = CaseManager.getInstance();

        // DEV PREVIEW: seed fake results if scene opened directly
        if (manager.getCaseResults().length === 0) {
            manager.loadTutorial();
            manager.toggleEvidence("A");
            manager.toggleEvidence("B");
            manager.submitVerdict("not guilty");
            manager.advanceCase();
            manager.toggleEvidence("A");
            manager.toggleEvidence("C");
            manager.submitVerdict("guilty");
        }

        this.cameras.main.setBackgroundColor("#1a1a1a");

        // ── DOM panel ──
        const panelDiv = document.createElement("div");
        panelDiv.innerHTML = this.buildPanel(manager);
        this.add.dom(SCREEN_W / 2, SCREEN_H / 2, panelDiv);

        // Attach click handlers after DOM is in place
        const caseList = panelDiv.querySelector<HTMLElement>("#case-list");

        if (caseList) {
            caseList.querySelectorAll(".case-row").forEach((row) => {
                const rowEl = row as HTMLElement;
                rowEl.querySelector(".row-hdr")?.addEventListener("click", () => {
                    const closing = decodeURIComponent(rowEl.dataset.closing ?? "");
                    const wasExpanded = rowEl.classList.contains("expanded");

                    // Collapse all rows
                    caseList.querySelectorAll(".case-row.expanded").forEach((el) => el.classList.remove("expanded"));

                    if (!wasExpanded) {
                        rowEl.classList.add("expanded");
                        this.updateSpeechBubble(closing || DEFAULT_BUBBLE);
                    } else {
                        this.updateSpeechBubble(DEFAULT_BUBBLE);
                    }
                });
            });
        }

        panelDiv.querySelector("#menu-btn")?.addEventListener("click", () => {
            this.scene.start("MainMenu");
        });

        // ── Stamp (starts hidden, slam animation on intro) ──
        this.stamp = this.add.image(RIGHT_CX, SCREEN_H / 2 - 60, "stamp_guilty").setAlpha(0);

        // ── Intro sequence: reveal rows one by one ──
        const rowEls = Array.from(panelDiv.querySelectorAll<HTMLElement>(".case-row"));
        this.playIntroSequence(rowEls);

        // ── Judge Compiler sprite ──
        const sprite = this.add.image(RIGHT_CX + 10, SCREEN_H - 20, "judge_compiler");
        const maxW = 230;
        if (sprite.width > maxW) sprite.setScale(maxW / sprite.width);
        sprite.setOrigin(0.5, 1);

        // ── Speech bubble (drawn by Graphics + Text) ──
        this.bubbleBg = this.add.graphics();

        this.bubbleText = this.add
            .text(0, 0, "", {
                fontFamily: FONT,
                fontSize: 13,
                color: "#1a1a1a",
                wordWrap: { width: 190 },
                align: "center",
                resolution: DPR,
            })
            .setOrigin(0.5);

        this.updateSpeechBubble(DEFAULT_BUBBLE);
    }
}
