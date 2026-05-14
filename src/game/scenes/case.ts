import { Scene } from "phaser";
import { typewriterEffect } from "../utils/typeWriterAnimation";
import createTextButton from "../utils/createTextButton";
import showDraggableTestCases from "../utils/dragging-logic";
import { codeToHtml } from "shiki";
import getCaseData from "../utils/getCaseData";

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
        3: "D",
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
    clickSound: Phaser.Sound.BaseSound;
    clickDragSound: Phaser.Sound.BaseSound;
    backgroundMusic: Phaser.Sound.BaseSound | null;
    dropSound: Phaser.Sound.BaseSound;
    caseProgressText: Phaser.GameObjects.Text | undefined;
    thirdIntro =
        "These are the program's test cases. Use them as evidence. Some tests may be redundant, so choose the two that provide the strongest evidence by clicking on them.";

    private showCaseProgressText() {
        if (this.isTutorial || this.caseProgressText) return;

        let totalCases = 0;
        const savedCases = localStorage.getItem("randomizedCases");
        if (savedCases) {
            try {
                const parsed = JSON.parse(savedCases) as object[];
                if (Array.isArray(parsed)) totalCases = parsed.length;
            } catch {
                totalCases = 0;
            }
        }

        const currentCaseNumber = this.currentTutorialCaseIndex + 1;
        const displayTotal = totalCases > 0 ? totalCases : currentCaseNumber;

        this.caseProgressText = this.add
            .text(980, 80, `Case ${currentCaseNumber} / ${displayTotal}`, {
                fontFamily: "Google Sans Code",
                fontSize: 20,
                color: "#01ff34",
            })
            .setOrigin(1, 0.5)
            .setDepth(101);
    }

    private async goBack() {
        if (this.typingInProgress) return;
        if (this.dragDom) this.dragDom.destroy();
        if (this.evidenceDom) this.evidenceDom.destroy();

        getCaseData(this.isTutorial, this.currentTutorialCaseIndex);

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
        this.showCaseProgressText();
        this.textObject.setText("");
        const codeAlreadyShown = this.tabDialogueShown.has("code");
        await this.addAnimatedTypingText(
            this.nextTutorialText,
            21,
            undefined,
            codeAlreadyShown,
        );
    }

    async generateStyledCodeSnippet(
        caseData: string = getCaseData(
            this.isTutorial,
            this.currentTutorialCaseIndex,
        ).case,
    ) {
        const container: HTMLDivElement = document.createElement("div");
        container.id = "question-area";

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
            width: "95%",
            maxWidth: "95%",
            maxHeight: "90%",
            overflowY: "auto",
            overflowX: "hidden",
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
            preTag.style.whiteSpace = "pre-wrap";
            preTag.style.wordBreak = "break-word";
            preTag.style.overflowWrap = "anywhere";
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
            this.clickSound.play();

            if (this.currentTab === "code") {
                const confirmation = confirm(
                    "Are you sure you want to go back? Your progress in the tutorial will be lost.",
                );
                if (!confirmation) return;

                this.backgroundMusic?.stop();
                this.scene.stop("Tutorial");
                this.scene.start("MainMenu");
                return;
            }

            await this.goBack();
        });
    }

    private async addTestCases() {
        const { evidencePool: testFeedback } = getCaseData(
            this.isTutorial,
            this.currentTutorialCaseIndex,
        );

        const container = document.createElement("div");
        Object.assign(container.style, {
            position: "relative",
            width: `${this.SCREEN_W}px`,
            height: `${this.SCREEN_H}px`,
            marginTop: "300px",
            marginLeft: "78px",
            overflow: "visible",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            paddingTop: "90px",
            boxSizing: "border-box",
            pointerEvents: "none",
        });

        const gridDiv = document.createElement("div");
        Object.assign(gridDiv.style, {
            display: "grid",
            // Use 1fr 1fr but ensure they don't exceed container width
            gridTemplateColumns: "repeat(2, 1fr)",
            columnGap: "20px",
            rowGap: "20px",
            width: "95%", // Increased width to give more breathing room
            boxSizing: "border-box",
            margin: "0 auto",
            pointerEvents: "none",
        });

        const maxLabelLen = Math.max(
            ...testFeedback.map((t) => t.label.length),
        );
        const fontSize =
            maxLabelLen > 44 ? "12px"
            : maxLabelLen > 38 ? "13px"
            : "15px";

        for (const test of testFeedback) {
            const card = document.createElement("div");
            card.id = test.id;

            Object.assign(card.style, {
                backgroundColor: "#0d1117",
                borderRadius: "8px",
                padding: "12px 15px",
                display: "flex",
                alignItems: "center",
                border: "1px solid #333",
                minWidth: "0",
                overflow: "hidden",
                wordBreak: "break-all",
                pointerEvents: "auto",
            });

            const codeHTML = await codeToHtml(test.label, {
                lang: "python",
                theme: "github-dark",
            });

            card.innerHTML = codeHTML;

            const pre = card.querySelector("pre");
            if (pre) {
                pre.style.margin = "0";
                pre.style.backgroundColor = "transparent";
                pre.style.fontSize = fontSize;
                pre.style.fontFamily = "'Fira Code', monospace";
                pre.style.whiteSpace = "pre-wrap";
                pre.style.wordBreak = "break-all";
            }

            card.addEventListener("mouseenter", (e) => {
                this.game.canvas.dispatchEvent(
                    new MouseEvent("mousemove", {
                        clientX: e.clientX,
                        clientY: e.clientY,
                        bubbles: true,
                    }),
                );
            });

            gridDiv.appendChild(card);
        }

        container.appendChild(gridDiv);
        this.evidenceDom = this.add.dom(0, 0, container).setOrigin(0, 0);
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
                () => this.evidenceReady,
            )
            .setDepth(102);

        this.presentToJudgeButton.on("pointerdown", () => {
            if (!this.evidenceReady) return;
            this.clickSound.play();
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
        const { evidencePool: testFeedback } = getCaseData(
            this.isTutorial,
            this.currentTutorialCaseIndex,
        );

        testFeedback.forEach((test, i) => {
            const card = this.evidenceDom?.getChildByID(test.id) as HTMLElement;

            card.style.cursor = "pointer";

            card.addEventListener("click", () => {
                if (this.typingInProgress) return;

                this.clickSound.play();
                const letter: string = this.letterMap[i];
                const isSelected = this.selectedTestCases.includes(letter);

                const handleSelection = async () => {
                    if (isSelected) {
                        this.selectedTestCases = this.selectedTestCases.filter(
                            (t) => t !== letter,
                        );
                        card.style.opacity = "1";

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
                        card.style.opacity = "0.5";
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
                };

                handleSelection().catch((err) =>
                    console.error("Selection error:", err),
                );
            });
        });
    }

    private playTimer() {
        let timerText = this.add.text(820, 250, "06:00", {
            fontSize: "35px",
            color: "#ee0808",
        });

        let timeLeft = 360; // 6 minutes in seconds is 360
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
            this.clickSound.play();

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

            if (this.levelDifficulty !== "hard") await this.addTestCases();
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
                    this.clickDragSound,
                    this.clickSound,
                    this.dropSound,
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
            if (this.evidenceDom) this.evidenceDom.destroy();

            this.clickSound.play();
            this.caseDom?.destroy();
            this.currentTab = "explanation";
            this.backButton.destroy();
            this.caseFileTestCases.forEach((testCase) => testCase.destroy());
            this.textObject.setText("");

            this.programDescTextReference = this.add
                .text(
                    512,
                    350,
                    getCaseData(this.isTutorial, this.currentTutorialCaseIndex)
                        .description,
                    {
                        fontFamily: "Google Sans Code",
                        fontSize: 23,
                        color: "#ffffff",
                        wordWrap: {
                            width: 600,
                            useAdvancedWrap: true,
                        },
                    },
                )
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

        if (this.caseProgressText && text && text.trim().length > 0) {
            this.caseProgressText.destroy();
            this.caseProgressText = undefined;
        }

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
        this.showCaseProgressText();

        this.currTutorialCaseDesc = getCaseData(
            data.isTutorial,
            this.currentTutorialCaseIndex,
        ).description;
        this.selectedTestCases = [];
        this.currentTab = "code";
        this.levelDifficulty = data.difficulty;
        this.tabDialogueShown = new Set();
        this.evidenceReady = false;
    }

    async create() {
        this.clickSound = this.sound.add("button-click", {
            volume: 1,
        });

        this.clickDragSound = this.sound.add("click-drag", {
            volume: 1,
        });

        this.dropSound = this.sound.add("drop", {
            volume: 1,
        });

        let music = this.sound.get(
            "background-music",
        ) as Phaser.Sound.BaseSound | null;

        if (!music) {
            music = this.sound.add("background-music", {
                volume: 0.009,
                loop: true,
            });
        }

        if (!music.isPlaying) {
            music.play();
        }

        this.backgroundMusic = music;

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
