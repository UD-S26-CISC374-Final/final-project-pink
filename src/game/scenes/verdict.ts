import { Scene } from "phaser";
import tutorialCases from "../data/tutorial-cases.json";
import type { Case } from "../data/types";
import { typewriterEffect } from "../utils/typeWriterAnimation";
import { playConfettiEffect } from "../utils/playConfettiEffect";
import createTextButton from "../utils/createTextButton";
import CaseManager from "../case-manager";
import { codeToHtml } from "shiki/bundle/web";

export class Verdict extends Scene {
    constructor() {
        super("Verdict");
    }

    currTutorialCaseIndex: number;
    selectedTestCases: string[] = [];
    answerMapping: Record<string, number> = {
        A: 0,
        B: 1,
        C: 2,
        D: 3,
    };
    isTutorial: boolean = false;
    textObject: Phaser.GameObjects.Text | undefined;
    typingInProgress: boolean = false;
    totalEvidenceCases: number;
    currReviewedEvidence: string[] = [];
    judge: Phaser.GameObjects.Sprite;
    showVerdictText = false;
    currentDifficulty: "easy" | "medium" | "hard" = "easy";

    init(data: {
        selectedTestCasesIndices: string[];
        tutorialCaseIndex: number;
        isTutorial: boolean;
        difficulty: "easy" | "medium" | "hard";
    }) {
        this.cameras.main.setBackgroundColor("#2d2d2d");
        this.add.rectangle(512, 80, 1024, 120, 0x000000, 0.8).setOrigin(0.5);

        const { selectedTestCasesIndices, tutorialCaseIndex } = data;
        this.selectedTestCases = selectedTestCasesIndices;
        this.currTutorialCaseIndex = tutorialCaseIndex;
        this.isTutorial = data.isTutorial;
        this.currentDifficulty = data.difficulty;
        this.currTutorialCaseIndex = data.tutorialCaseIndex;
        this.totalEvidenceCases =
            tutorialCases[this.currTutorialCaseIndex].testFeedback.length;
        this.currReviewedEvidence = [];
    }

    async addAnimatedTypingText(
        text: string,
        fontSize: number = 21,
        speed: number = 30,
        instant?: boolean,
    ) {
        if (!this.scene.isActive()) return;

        this.typingInProgress = true;

        if (!this.sys.isActive()) {
            this.typingInProgress = false;
            return;
        }

        if (!this.textObject || !this.textObject.active) {
            this.textObject = this.add.text(100, 30, "", {
                fontSize: `${fontSize}px`,
                color: "#01ff34",
                wordWrap: { width: 800 },
            });
        } else {
            this.textObject.destroy();

            this.textObject = this.add.text(100, 30, "", {
                fontSize: `${fontSize}px`,
                color: "#01ff34",
                wordWrap: { width: 800 },
            });
        }

        if (instant) {
            if (this.textObject.active) {
                this.textObject.setText(text);
            }
            this.typingInProgress = false;
            return;
        }

        try {
            await typewriterEffect(null, this.textObject, text, speed, this);
        } catch (e) {
            console.warn("Typewriter effect interrupted:", e);
        }

        this.typingInProgress = false;
    }

    private showNextCaseButton() {
        const revealButton = createTextButton.call(
            this,
            850,
            190,
            { x: 0, y: 0, width: 160, height: 40, color: 0x000000, alpha: 1 },
            {
                text: "Reveal Verdict",
                fontFamily: "Google Sans Code",
                fontSize: 18,
                color: "#ffffff",
            },
            true,
        );

        revealButton.on("pointerdown", async () => {
            if (this.typingInProgress) return;

            revealButton.destroy();

            const currentCase = tutorialCases[this.currTutorialCaseIndex];
            const verdict = currentCase.correctVerdict; // "guilty" or "not guilty"

            this.textObject?.setText("");
            this.playJudgeAnimation(verdict === "not guilty" ? "happy" : "sad");

            await this.addAnimatedTypingText(
                "Great work—you've reviewed all the evidence! With that said, I declare this program to be...",
                20,
                30,
            );

            this.typingInProgress = true;

            this.time.delayedCall(800, async () => {
                const isInnocent = verdict === "not guilty";
                const stampKey = isInnocent ? "innocent" : "guilty";

                console.log("VERDICT RAW:", verdict);
                console.log("IS INNOCENT:", isInnocent);

                if (isInnocent) {
                    playConfettiEffect.call(this);
                }

                const stamp = this.add
                    .sprite(830, 290, stampKey)
                    .setOrigin(0.5)
                    .setScale(0);
                this.tweens.add({
                    targets: stamp,
                    scale: 3.5,
                    angle: 13,
                    duration: 500,
                    ease: "Bounce.easeOut",
                });

                this.typingInProgress = false;

                // 3. Play the closing statement
                await this.addAnimatedTypingText(
                    currentCase.closingStatement,
                    20,
                    30,
                );

                // 4. Finally, create the "Next Case" button after the sequence is done
                this.createNewNextButton();
            });
        });
    }

    private createNewNextButton() {
        const isLastCase =
            this.currTutorialCaseIndex >= tutorialCases.length - 1;

        const nextButton = createTextButton.call(
            this,
            850,
            190,
            { x: 0, y: 0, width: 160, height: 40, color: 0x000000, alpha: 1 },
            {
                text: isLastCase ? "Go to Summary" : "Next Case",
                fontFamily: "Google Sans Code",
                fontSize: 18,
                color: "#ffffff",
            },
            true,
        );

        nextButton.on("pointerdown", () => {
            const manager = CaseManager.getInstance();
            const currentCase = tutorialCases[this.currTutorialCaseIndex];

            // Sync manager state
            while (manager.getCurrentCaseIndex() < this.currTutorialCaseIndex) {
                manager.advanceCase();
            }

            manager.selectedEvidenceIds = [...this.selectedTestCases];
            manager.submitVerdict(
                currentCase.correctVerdict as "guilty" | "not guilty",
            );

            this.scene.stop("Verdict");

            if (isLastCase) {
                manager.markTutorialCompleted();
                this.scene.start("Summary");
            } else {
                manager.advanceCase();
                const nextCase = tutorialCases[this.currTutorialCaseIndex + 1];

                this.scene.start("Case", {
                    isTutorial: this.isTutorial,
                    nextTutorialText: nextCase.tutorialText,
                    difficulty: nextCase.difficulty,
                    currentTutorialCaseIndex: this.currTutorialCaseIndex + 1,
                });
            }
        });
    }

    private computeTestQuality(
        idx: number,
        testFeedback: Array<{ logicBranch: string; misleading?: boolean }>,
        selectedLetters: string[],
        letters: string[],
        requiredBranches: string[],
    ): "essential" | "redundant" | "misleading" | "missed" | "neutral" {
        const fb = testFeedback[idx];
        const wasSelected = selectedLetters.includes(letters[idx]);

        if (fb.misleading) return wasSelected ? "misleading" : "neutral";

        const branchCoveredByOther = testFeedback.some(
            (f, j) =>
                j !== idx &&
                f.logicBranch === fb.logicBranch &&
                selectedLetters.includes(letters[j]),
        );

        if (wasSelected)
            return branchCoveredByOther ? "redundant" : "essential";

        return (
                requiredBranches.includes(fb.logicBranch) &&
                    !branchCoveredByOther
            ) ?
                "missed"
            :   "neutral";
    }

    async showTestCaseReasonings(mood: "happy" | "sad") {
        const currentCase = tutorialCases[this.currTutorialCaseIndex];
        const tutorialTestFeedback = currentCase.testFeedback as Array<{
            logicBranch: string;
            misleading?: boolean;
            feedback: string;
            testId: string;
            label: string;
        }>;
        const requiredBranches = (currentCase as Case).requiredBranches ?? [];
        const LETTERS = ["A", "B", "C", "D"];

        const container = document.createElement("div");
        Object.assign(container.style, {
            width: `1024px`,
            height: `768px`,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start", // Align to the left (or 'center' if preferred)
            paddingTop: "220px",
            paddingLeft: "60px", // Give some breathing room from the edge
            pointerEvents: "none",
        });

        // 1. Changed from Grid to Flex Column for vertical stacking
        const stackDiv = document.createElement("div");
        Object.assign(stackDiv.style, {
            display: "flex",
            flexDirection: "column",
            gap: "24px", // Vertical spacing between cards
            width: "600px", // Fixed width for the stack
            pointerEvents: "auto",
        });

        for (let i = 0; i < tutorialTestFeedback.length; i++) {
            const feedbackObj = tutorialTestFeedback[i];
            const letter = LETTERS[i];
            const wasSelected = this.selectedTestCases.includes(letter);
            const quality = this.computeTestQuality(
                i,
                tutorialTestFeedback,
                this.selectedTestCases,
                LETTERS,
                requiredBranches,
            );

            let borderColor = "#444444";
            let badgeText = "";
            let badgeColor = "#666666";

            if (wasSelected) {
                if (quality === "essential") {
                    borderColor = "#01ff34";
                    badgeText = "+5 pts";
                    badgeColor = "#01ff34";
                } else if (quality === "misleading") {
                    borderColor = "#ff4444";
                    badgeText = "-5 pts";
                    badgeColor = "#ff4444";
                } else {
                    borderColor = "#ffcc00";
                    badgeText = "0 pts";
                    badgeColor = "#ffcc00";
                }
            } else if (quality === "missed") {
                borderColor = "#ff8800";
                badgeText = "missed";
                badgeColor = "#ff8800";
            }

            const card = document.createElement("div");
            Object.assign(card.style, {
                backgroundColor: "#0d1117",
                borderRadius: "8px",
                padding: "25px 15px 25px 15px",
                border: `2px solid ${borderColor}`,
                position: "relative",
                cursor: "pointer",
                transition: "transform 0.1s, opacity 0.2s",
                opacity: "0.9",
                width: "100%", // Take up full width of stackDiv
                boxSizing: "border-box",
            });

            const codeHTML = await codeToHtml(
                feedbackObj.label || `test_case_${letter}()`,
                {
                    lang: "python",
                    theme: "github-dark",
                },
            );
            card.innerHTML = codeHTML;

            const label = document.createElement("div");
            label.innerText = wasSelected ? `${letter} SELECTED` : letter;
            Object.assign(label.style, {
                position: "absolute",
                top: "-12px",
                left: "10px",
                fontSize: "10px",
                backgroundColor: "#0a0a0a",
                color: wasSelected ? "#ffffff" : "#888888",
                padding: "2px 6px",
                fontFamily: "'Google Sans Code', monospace",
            });

            if (badgeText) {
                const badge = document.createElement("div");
                badge.innerText = badgeText;
                Object.assign(badge.style, {
                    position: "absolute",
                    bottom: "-12px",
                    right: "10px",
                    fontSize: "10px",
                    backgroundColor: "#0a0a0a",
                    color: badgeColor,
                    padding: "2px 6px",
                    fontFamily: "'Google Sans Code', monospace",
                    border: `1px solid ${badgeColor}`,
                });
                card.appendChild(badge);
            }

            card.appendChild(label);

            const pre = card.querySelector("pre");
            if (pre) {
                pre.style.margin = "0";
                pre.style.backgroundColor = "transparent";
                pre.style.fontSize = "14px";
                pre.style.fontFamily = "'Fira Code', monospace";
            }

            // 2. Wrap async logic to satisfy ESLint
            card.addEventListener("click", () => {
                const runSelection = async () => {
                    if (this.typingInProgress) return;

                    card.style.opacity = "0.5";
                    const alreadyReviewed =
                        this.currReviewedEvidence.includes(letter);

                    this.playJudgeAnimation(mood);

                    await this.addAnimatedTypingText(
                        feedbackObj.feedback,
                        21,
                        30,
                        alreadyReviewed,
                    );

                    this.judge.anims.pause();
                    this.judge.setFrame(mood === "happy" ? 0 : 1);

                    if (!alreadyReviewed) {
                        this.currReviewedEvidence.push(letter);
                        if (
                            this.currReviewedEvidence.length ===
                            this.totalEvidenceCases
                        ) {
                            this.showVerdictText = true;
                            this.showNextCaseButton();
                        }
                    }
                };
                runSelection().catch(console.error);
            });

            stackDiv.appendChild(card);
        }

        container.appendChild(stackDiv);
        this.add.dom(0, 0, container).setOrigin(0, 0);
    }

    private playJudgeAnimation(mood: "happy" | "sad") {
        if (mood === "happy") {
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
                frames: this.anims.generateFrameNumbers(
                    "judge-compiler-sprite",
                    {
                        frames: [0, 1, 2],
                    },
                ),
                frameRate: 3,
                repeat: -1,
            });

            this.judge.play("happy-speaking");
        } else {
            this.judge = this.add
                .sprite(
                    this.cameras.main.width,
                    this.cameras.main.height,
                    "judge-compiler-speaking-sad",
                    0,
                )
                .setOrigin(1, 1)
                .setScale(3);

            this.anims.create({
                key: "sad-speaking",
                frames: this.anims.generateFrameNumbers(
                    "judge-compiler-speaking-sad",
                    {
                        frames: [0, 1, 2],
                    },
                ),
                frameRate: 3,
                repeat: -1,
            });

            this.judge.play("sad-speaking");
        }
    }

    async showJudgeAnimation(mood: "happy" | "sad") {
        if (mood === "happy") {
            this.playJudgeAnimation("happy");

            await this.showTestCaseReasonings("happy");

            await this.addAnimatedTypingText(
                "Well done selecting the best test cases! This is the verdict screen. Here, I explain which tests were meaningful, which were misleading or redundant, and how your evidence influenced the final verdict. Click each case to read my explanation. It's important you do so before moving on.",
                20,
                25,
            );

            this.judge.anims.pause();
            this.judge.setFrame(0);
        } else {
            this.playJudgeAnimation("sad");

            await this.showTestCaseReasonings("sad");

            await this.addAnimatedTypingText(
                tutorialCases[this.currTutorialCaseIndex]
                    .missedEvidenceExplanation,
                18,
            );
            this.judge.anims.pause();
            this.judge.setFrame(1);
        }
    }

    private async checkUserSelections() {
        const currentTestCase = tutorialCases[this.currTutorialCaseIndex];
        const letters = ["A", "B", "C", "D"];
        const testFeedback = currentTestCase.testFeedback as Array<{
            logicBranch: string;
            misleading?: boolean;
        }>;
        const requiredBranches =
            (currentTestCase as Case).requiredBranches ?? [];

        const coveredBranches = new Set<string>();
        for (let i = 0; i < testFeedback.length; i++) {
            const fb = testFeedback[i];
            if (!fb.misleading && this.selectedTestCases.includes(letters[i])) {
                coveredBranches.add(fb.logicBranch);
            }
        }

        const allCovered = requiredBranches.every((b) =>
            coveredBranches.has(b),
        );
        await this.showJudgeAnimation(allCovered ? "happy" : "sad");
    }

    async create() {
        if (!this.textures.exists("confettiParticle")) {
            const texture = this.textures.createCanvas(
                "confettiParticle",
                10,
                10,
            );

            const ctx = texture?.getContext();
            if (ctx) {
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, 10, 10);
            }

            texture?.refresh();
        }

        await this.checkUserSelections();
    }
}