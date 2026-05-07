import { Scene } from "phaser";
import type { Case as ICase } from "../data/types";
import { typewriterEffect } from "../utils/typeWriterAnimation";
import tutorialCasesJSON from "../data/tutorial-cases.json";
import createTextButton from "../utils/createTextButton";
import showDraggableTestCases from "../utils/dragging-logic";
import easyCasesJSON from "../data/easy-cases.json";
import mediumCasesJSON from "../data/medium-cases.json";
import hardCasesJSON from "../data/hard-cases.json";
import { codeToHtml } from "shiki";

const easyCases = easyCasesJSON as ICase[];
const mediumCases = mediumCasesJSON as ICase[];
const hardCases = hardCasesJSON as ICase[];
const tutorialCases = tutorialCasesJSON as ICase[];

// TODO - will need to add guardrails around tutorial-related code to only have it work if this.tutorial is true
// TODO - for test case 2 (and any other cases that involve redundant test cases), figure out how to determine whether a test case is redundant or not because if the first test case is set to 'redundant' and the second test is set to 'good' but the player chose that over the second, it'll come off as them picking a redundant test.
// TODO - change it so that if you select a test case and then de-select, instead of the text animation playing again, it just shows the text again without the animation

export class Case extends Scene {
    constructor() {
        super("Case");
    }

    isTutorial: boolean = false;
    nextTutorialText: string;
    typingInProgress: boolean;
    textObject: Phaser.GameObjects.Text;
    currentTab: "code" | "explanation" | "test-cases";
    currentTutorialCaseIndex: number;
    currTutorialCaseDesc: string;
    caseFileCodeSnippet: Phaser.GameObjects.Image;
    programDescTextReference: Phaser.GameObjects.Text | undefined;
    backButton: Phaser.GameObjects.Container;
    caseFileTestCases: Phaser.GameObjects.Image[] = [];
    selectedTestCases: string[] = [];
    presentToJudgeButton: Phaser.GameObjects.Container | undefined;
    reminderMessageReference: Phaser.GameObjects.Text | undefined;
    letterMap: Record<number, string> = {
        0: "A",
        1: "B",
        2: "C",
    };
    showSkipMessageTip = true;
    dragDom: Phaser.GameObjects.DOMElement | undefined;
    caseDom: Phaser.GameObjects.DOMElement | undefined;
    evidenceDom: Phaser.GameObjects.DOMElement | undefined;
    levelDifficulty: "easy" | "medium" | "hard";
    tabDialogueShown: Set<"code" | "explanation" | "test-cases"> = new Set();
    evidenceReady: boolean = false;
    SCREEN_W = 860;
    SCREEN_H = 520;

    thirdIntro =
        "These are the program's test cases. Use them as evidence. Some tests may be redundant, so choose the two that provide the strongest evidence by clicking on them.";

    private async goBack() {
        if (this.typingInProgress) return;
        if (this.dragDom) this.dragDom.destroy();

        if (this.caseFileTestCases.length)
            this.caseFileTestCases.forEach((testCase) => testCase.destroy());

        if (this.presentToJudgeButton) {
            this.presentToJudgeButton.destroy();
            this.presentToJudgeButton = undefined;
        }
        this.evidenceReady = false;

        await this.generateStyledCodeSnippet();

        this.add
            .sprite(512, 450, "case-file-open-program", 0)
            .setDisplaySize(920, 600);

        if (this.currentTab !== "code") {
            this.currentTab = "code";
            this.showBackButton();
        }

        this.addTabLabels();
        this.textObject.setText("");
        const codeAlreadyShown = this.tabDialogueShown.has("code");
        await this.addAnimatedTypingText(
            this.nextTutorialText,
            21,
            undefined,
            codeAlreadyShown,
        );
    }

    async generateStyledCodeSnippet() {
        const container: HTMLDivElement = document.createElement("div");
        container.id = "question-area";
        const { case: caseData } = this.getCaseData();

        const codeContainer = document.createElement("div");

        Object.assign(codeContainer.style, {
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontFamily: "'Google Sans Code', 'Fira Code', monospace",
            fontSize: "20px",
            backgroundColor: "#0d1117",
            borderRadius: "8px",
            border: "1px solid #30363d",
            boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
            width: "fit-content",
            maxWidth: "90%",
            maxHeight: "90%",
            overflow: "auto",
        });

        // 2. Generate the HTML from Shiki
        const codeHTML = await codeToHtml(caseData, {
            lang: "python",
            theme: "github-dark",
        });

        // 3. Inject and Clean Up
        codeContainer.innerHTML = codeHTML;

        // 4. Target the Shiki-generated <pre> to ensure it feels "integrated"
        const preTag = codeContainer.querySelector("pre");
        if (preTag) {
            preTag.style.margin = "0";
            preTag.style.padding = "18px";
            preTag.style.lineHeight = "1.6";
            preTag.style.backgroundColor = "transparent";
        }

        // 5. Add to Phaser's DOM parent
        container.appendChild(codeContainer);

        Object.assign(container.style, {
            position: "relative",
            width: `${this.SCREEN_W}px`,
            height: `${this.SCREEN_H}px`,
            marginTop: "205px",
            marginLeft: "78px",
            overflow: "hidden",
        });

        this.caseDom = this.add.dom(0, 0, container).setOrigin(0, 0);
    }

    private showBackButton() {
        this.backButton = createTextButton.call(
            this,
            150,
            190,
            {
                x: 0,
                y: 0,
                width: 110,
                height: 40,
                color: 0x000000,
                alpha: 1,
            },
            {
                text: this.currentTab === "code" ? "Main Menu" : "Go Back",
                fontFamily: "Google Sans Code",
                fontSize: 18,
                color: "#ffffff",
            },
            true,
        );

        this.add
            .text(
                95,
                165,
                "Tip: hold space or press enter to skip text animation",
                {
                    fontFamily: "Google Sans Code",
                    fontSize: 12,
                    color: "#000000",
                },
            )
            .setOrigin(0, 1)
            .setDepth(101);

        this.backButton.on("pointerdown", async () => {
            if (this.currentTab === "code") {
                const confirmation = confirm(
                    "Are you sure you want to go back? Your progress in the tutorial will be lost.",
                );
                if (!confirmation) return;

                this.scene.stop("Tutorial");
                this.scene.start("MainMenu");
                return;
            }

            await this.goBack();
        });
    }

    private getCaseData(): {
        feedback: {
            testId: string;
            quality: string;
            feedback: string;
        }[];
        case: string;
    } {
        if (this.isTutorial) {
            return {
                feedback:
                    tutorialCases[this.currentTutorialCaseIndex]?.testFeedback,
                case: tutorialCases[this.currentTutorialCaseIndex]
                    ?.functionCode,
            };
        }

        if (this.levelDifficulty === "easy") {
            return {
                feedback:
                    easyCases[this.currentTutorialCaseIndex]?.testFeedback,
                case: easyCases[this.currentTutorialCaseIndex]?.functionCode,
            };
        }

        if (this.levelDifficulty === "medium") {
            return {
                feedback:
                    mediumCases[this.currentTutorialCaseIndex]?.testFeedback,
                case: mediumCases[this.currentTutorialCaseIndex]?.functionCode,
            };
        }

        return {
            feedback: hardCases[this.currentTutorialCaseIndex]?.testFeedback,
            case: hardCases[this.currentTutorialCaseIndex]?.functionCode,
        };
    }

    private addTestCases(startY: number = 380, marginY: number = 15) {
        const { feedback: testFeedback } = this.getCaseData();
        const centerX = 512; // Your current horizontal center
        const columnWidth = 400; // How far apart the two columns should be
        const scale = 0.2;

        // Gemini provided the grid formatting logic below:
        testFeedback.forEach((_, i) => {
            // Determine column (0 or 1) and row (0, 1, 2...)
            const col = i % 2;
            const row = Math.floor(i / 2);

            // Calculate X: Offset left for col 0, right for col 1
            const xPos =
                col === 0 ?
                    centerX - columnWidth / 2
                :   centerX + columnWidth / 2;

            // Get texture to calculate height dynamically
            const texture = this.textures.get(
                `tutorial-${this.currentTutorialCaseIndex}-t${i + 1}`,
            );
            const source = texture.getSourceImage();
            const scaledHeight = source.height * scale;

            // Calculate Y: Start position + (height of image + margin) * row index
            const yPos = startY + row * (scaledHeight + marginY);

            const testCase = this.add
                .image(
                    xPos,
                    yPos,
                    `tutorial-${this.currentTutorialCaseIndex}-t${i + 1}`,
                )
                .setScale(scale)
                .setDepth(10)
                .setInteractive();

            this.caseFileTestCases.push(testCase);
        });

        this.clickableTestCases();
    }

    private createEvidenceButton() {
        if (this.presentToJudgeButton) this.presentToJudgeButton.destroy();
        this.evidenceReady = false;
        this.presentToJudgeButton = createTextButton
            .call(
                this,
                400,
                190,
                {
                    x: 0,
                    y: 0,
                    width: 380,
                    height: 40,
                    color: 0x000000,
                    alpha: 1,
                },
                {
                    text: "Select the TWO best test cases",
                    fontFamily: "Google Sans Code",
                    fontSize: 18,
                    color: "#ffffff",
                },
                true,
            )
            .setDepth(102);

        this.presentToJudgeButton.on("pointerdown", () => {
            if (!this.evidenceReady) return;
            this.scene.stop("Tutorial");
            this.scene.start("Verdict", {
                selectedTestCasesIndices: this.selectedTestCases,
                tutorialCaseIndex: this.currentTutorialCaseIndex,
                isTutorial: this.isTutorial,
                difficulty: this.levelDifficulty,
            });
        });
    }

    private clickableTestCases() {
        for (let i = 0; i < this.caseFileTestCases.length; i++) {
            const testCase = this.caseFileTestCases[i];

            testCase.on("pointerdown", async () => {
                if (this.typingInProgress) return;
                const letter: string = this.letterMap[i];
                const isSelected = this.selectedTestCases.includes(letter);

                if (isSelected) {
                    this.selectedTestCases = this.selectedTestCases.filter(
                        (test) => test !== letter,
                    );
                    testCase.setAlpha(1);

                    if (
                        this.selectedTestCases.length < 2 &&
                        this.presentToJudgeButton
                    ) {
                        this.evidenceReady = false;
                        (
                            this.presentToJudgeButton
                                .list[1] as Phaser.GameObjects.Text
                        ).setText("Select the TWO best test cases");
                    }
                } else {
                    if (this.selectedTestCases.length >= 2) {
                        this.textObject.setText("");

                        await this.addAnimatedTypingText(
                            "Remember: You can only select 2 test cases as evidence. Please deselect one...",
                            22,
                            20,
                            true,
                        );

                        this.reminderMessageReference = this.textObject;
                        return;
                    }

                    this.selectedTestCases.push(letter);
                    testCase.setAlpha(0.5);
                }

                if (
                    this.selectedTestCases.length === 2 &&
                    this.presentToJudgeButton
                ) {
                    this.evidenceReady = true;
                    (
                        this.presentToJudgeButton
                            .list[1] as Phaser.GameObjects.Text
                    )
                        .setText("Present Evidence to Judge Compiler")
                        .setColor("#ffffff");
                }
            });
        }
    }

    private playTimer() {
        let timerText = this.add.text(820, 250, "10:00", {
            fontSize: "35px",
            color: "#ee0808",
        });

        let timeLeft = 600; // 10 minutes in seconds is 600
        const timerEvent = this.time.addEvent({
            delay: 1000,
            callback: () => {
                timerText.destroy();

                timeLeft--;
                const minutes = Math.floor(timeLeft / 60)
                    .toString()
                    .padStart(2, "0");
                const seconds = (timeLeft % 60).toString().padStart(2, "0");

                timerText = this.add.text(820, 250, `${minutes}:${seconds}`, {
                    fontSize: "35px",
                    color: "#ee0808",
                });

                if (timeLeft <= 0) {
                    timerEvent.remove();
                    this.scene.stop("Tutorial");
                    this.scene.start("Verdict", {
                        selectedTestCasesIndices: [],
                        tutorialCaseIndex: this.currentTutorialCaseIndex,
                        isTutorial: this.isTutorial,
                        difficulty: this.levelDifficulty,
                    });
                }
            },
            loop: true,
        });
    }

    private addTabLabels() {
        this.add.text(810, 170, "Evidence", {
            fontSize: "25px",
            color: "#064b11",
        });

        this.add.text(650, 170, "Purpose", {
            fontSize: "25px",
            color: "#92088d",
        });
    }

    private drawTabs() {
        const greenTab = this.add
            .rectangle(870, 190, 148, 80, 0x00ff00, 0.8)
            .setOrigin(0.5)
            .setDepth(100)
            .setAlpha(0.09)
            .setInteractive();

        this.addTabLabels();

        if (
            this.levelDifficulty === "medium" ||
            this.levelDifficulty === "hard"
        ) {
            this.playTimer();
        }

        greenTab.on("pointerdown", async () => {
            if (this.typingInProgress) return;
            if (this.currentTab === "test-cases") return;

            this.caseFileTestCases = [];
            this.selectedTestCases = [];

            this.textObject.setText("");
            this.currentTab = "test-cases";
            this.backButton.destroy();
            this.caseDom?.destroy();

            if (this.programDescTextReference)
                this.programDescTextReference.destroy();

            const thirdIntro =
                (
                    this.levelDifficulty === "easy" ||
                    this.levelDifficulty === "medium"
                ) ?
                    "These are the program's test cases. Use them as evidence. Some tests may be redundant, so choose the two that provide the strongest evidence by clicking on them. When you're ready, press the 'Present Evidence to Judge Compiler' button."
                :   "Now that you've got a good idea on how unit tests are structured, your job is to now to construct 2 test cases as evidence that either prove or disprove the program's innocence. When you're ready, press the 'Present Evidence to Judge Compiler' button.";

            if (this.levelDifficulty !== "hard") this.addTestCases(350);
            if (this.levelDifficulty === "hard") {
                const container: HTMLDivElement = document.createElement("div");
                container.id = "draggable-area";

                Object.assign(container.style, {
                    position: "relative",
                    width: `${this.SCREEN_W}px`,
                    height: `${this.SCREEN_H}px`,
                    marginTop: "205px",
                    marginLeft: "78px",
                    overflow: "hidden",
                });

                showDraggableTestCases(
                    this,
                    this.currentTutorialCaseIndex,
                    this.isTutorial,
                    container,
                );

                this.dragDom = this.add.dom(0, 0, container).setOrigin(0, 0);
            }

            const testCasesAlreadyShown =
                this.tabDialogueShown.has("test-cases");
            this.tabDialogueShown.add("test-cases");
            await this.addAnimatedTypingText(
                thirdIntro,
                18,
                undefined,
                testCasesAlreadyShown,
            );
            this.showBackButton();
            this.createEvidenceButton();
        });

        const pinkTab = this.add
            .rectangle(700, 190, 148, 80, 0xff00ff, 0.8)
            .setOrigin(0.5)
            .setDepth(100)
            .setAlpha(0.09)
            .setInteractive();

        this.addTabLabels();

        pinkTab.on("pointerdown", async () => {
            if (this.typingInProgress) return;
            if (this.currentTab === "explanation") return;
            if (this.presentToJudgeButton) this.presentToJudgeButton.destroy();
            if (this.dragDom) this.dragDom.destroy();

            this.caseDom?.destroy();
            this.currentTab = "explanation";
            this.backButton.destroy();
            this.caseFileTestCases.forEach((testCase) => testCase.destroy());
            this.textObject.setText("");

            this.programDescTextReference = this.add
                .text(512, 350, this.currTutorialCaseDesc, {
                    fontFamily: "Google Sans Code",
                    fontSize: 23,
                    color: "#ffffff",
                    wordWrap: {
                        width: 600,
                        useAdvancedWrap: true,
                    },
                })
                .setOrigin(0.5);

            const fourthIntro =
                "Here is the program's statement of purpose, which gives a brief overview of what the program is supposed to do. This can help guide your analysis of the program and its test cases.";
            const explanationAlreadyShown =
                this.tabDialogueShown.has("explanation");
            this.tabDialogueShown.add("explanation");
            await this.addAnimatedTypingText(
                fourthIntro,
                21,
                undefined,
                explanationAlreadyShown,
            );

            this.showBackButton();
        });
    }

    async addAnimatedTypingText(
        text: string,
        fontSize: number = 21,
        speed?: number,
        instant?: boolean,
    ) {
        this.typingInProgress = true;

        this.textObject = this.add.text(100, 30, "", {
            fontSize: `${fontSize}px`,
            color: "#01ff34",
            wordWrap: { width: 800 },
        });

        if (instant) {
            this.textObject.setText(text);
            this.typingInProgress = false;
            return;
        }

        await typewriterEffect(
            null,
            this.textObject.setText(text),
            text,
            speed,
            this,
        );
        this.typingInProgress = false;
    }

    init(data: {
        isTutorial: boolean;
        nextTutorialText: string;
        difficulty: "easy" | "medium" | "hard";
        currentTutorialCaseIndex: number;
    }) {
        this.cameras.main.setBackgroundColor("#2d2d2d");
        this.add.rectangle(512, 80, 1024, 120, 0x000000, 0.8).setOrigin(0.5);
        this.isTutorial = data.isTutorial;
        this.nextTutorialText = data.nextTutorialText;
        this.currentTutorialCaseIndex = data.currentTutorialCaseIndex;
        this.currTutorialCaseDesc =
            tutorialCases[this.currentTutorialCaseIndex].description;
        this.selectedTestCases = [];
        this.currentTab = "code";
        this.levelDifficulty = data.difficulty;
        this.tabDialogueShown = new Set();
        this.evidenceReady = false;
    }

    async create() {
        // 1. First, we are going to display the open case file sprite showing the program's code and adding the clickable tabs as well
        this.add
            .sprite(512, 450, "case-file-open-program", 0)
            .setDisplaySize(920, 600);
        this.drawTabs();

        // 2. Next, we'll create a Phaser DOM overlay to render the code snippet with syntax highlighting using PrismJS
        await this.generateStyledCodeSnippet();

        // 6. Next, we are going to introduce the user with the next tutorial's text
        this.showBackButton();

        await this.addAnimatedTypingText(this.nextTutorialText);
        this.tabDialogueShown.add("code");
    }
}
