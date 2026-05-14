import createTextButton from "./createTextButton";
import tutorialCases from "../data/tutorial-cases.json";
import type { UnitTest } from "../data/types";
import getCaseData from "./getCaseData";

let tutorialCaseIndexGlobal = 0;
let isTutorialGlobal = false;
let presentToJudgeButtonGlobal: Phaser.GameObjects.Container | undefined;
let clickSoundGlobal: Phaser.Sound.BaseSound;

const EVIDENCE_LETTERS = ["A", "B", "C", "D"];

/**
 * Turns:
 * assert(find_first_even([2, 4, 6]), 2)
 *
 * into:
 * {
 *   call: "find_first_even([2, 4, 6])",
 *   expected: "2"
 * }
 */
function splitLabel(label: string) {
    const inner = label.replace(/^assert\(/, "").replace(/\)$/, "");

    let depth = 0;
    let splitIndex = -1;

    for (let i = inner.length - 1; i >= 0; i--) {
        const char = inner[i];

        if (char === ")" || char === "]" || char === "}") depth++;
        else if (char === "(" || char === "[" || char === "{") depth--;

        if (char === "," && depth === 0) {
            splitIndex = i;
            break;
        }
    }

    if (splitIndex === -1) {
        return {
            call: inner,
            expected: "",
        };
    }

    return {
        call: inner.slice(0, splitIndex).trim(),
        expected: inner.slice(splitIndex + 1).trim(),
    };
}

function showPresentToJudgeButton(
    testCases: string[],
    currentScene: Phaser.Scene,
) {
    const letters = testCases
        .map((testCase) => {
            const pool = getCaseData(
                isTutorialGlobal,
                tutorialCaseIndexGlobal,
            ).evidencePool;

            const numIdx = pool.findIndex((tc) => {
                const { call, expected } = splitLabel(tc.label);
                return `${call}|${expected}` === testCase;
            });

            return numIdx >= 0 ? EVIDENCE_LETTERS[numIdx] : null;
        })
        .filter((l): l is string => l !== null);

    presentToJudgeButtonGlobal = createTextButton
        .call(
            currentScene,
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
                text: "Present Evidence to Judge Compiler",
                fontFamily: "Google Sans Code",
                fontSize: 18,
                color: "#ffffff",
            },
            true,
        )
        .setDepth(102);

    presentToJudgeButtonGlobal.on("pointerdown", () => {
        clickSoundGlobal.play();
        currentScene.scene.stop("Tutorial");
        currentScene.scene.start("Verdict", {
            selectedTestCasesIndices: letters,
            tutorialCaseIndex: tutorialCaseIndexGlobal,
            isTutorial: isTutorialGlobal,
            difficulty: "hard",
        });
    });
}

function trackTestCases(scene: Phaser.Scene) {
    const constructedTestCases: string[] = [];
    const constructedTestCasesContainer = document.querySelector(
        "#test-cases-container",
    );

    if (!constructedTestCasesContainer) return;

    let completedCount = 0;

    constructedTestCasesContainer
        .querySelectorAll("[id^='test-case']")
        .forEach((testCaseDiv) => {
            const zones = testCaseDiv.querySelectorAll("[id*='zone']");

            const zone1Text = zones[0].textContent.trim();
            const zone2Text = zones[1].textContent.trim();

            if (zone1Text && zone2Text) {
                completedCount++;
                constructedTestCases.push(`${zone1Text}|${zone2Text}`);
            }

            presentToJudgeButtonGlobal?.destroy();
        });

    if (completedCount === constructedTestCasesContainer.children.length) {
        showPresentToJudgeButton(constructedTestCases, scene);
    }
}

function getPool() {
    const caseData = getCaseData(isTutorialGlobal, tutorialCaseIndexGlobal);

    const testCasePool = caseData.evidencePool.flatMap((tc: UnitTest) => {
        const { call, expected } = splitLabel(tc.label);
        return [call, expected];
    });

    const randomizedPool: string[] = [];
    let current = 0;
    const numPieces = testCasePool.length;

    while (current !== numPieces) {
        const randomIndex = Math.floor(Math.random() * numPieces);

        if (!randomizedPool[randomIndex]) {
            randomizedPool[randomIndex] = testCasePool[current];
            current++;
        }
    }

    return randomizedPool;
}

export default function showDraggableTestCases(
    scene: Phaser.Scene,
    tutorialCaseIndex: number,
    isTutorial: boolean,
    container: HTMLDivElement,
    clickDragSound: Phaser.Sound.BaseSound,
    clickSound: Phaser.Sound.BaseSound,
    dropSound: Phaser.Sound.BaseSound,
) {
    tutorialCaseIndexGlobal = tutorialCaseIndex;
    isTutorialGlobal = isTutorial;
    clickSoundGlobal = clickSound;

    const testCasesContainer = document.createElement("div");
    testCasesContainer.id = "test-cases-container";

    Object.assign(testCasesContainer.style, {
        width: "100%",
        height: "30%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: "12px",
        fontFamily: "Google Sans Code",
        color: "#ffffff",
        position: "absolute",
        bottom: "0",
        fontSize: "20px",
    });

    container.appendChild(testCasesContainer);

    const createDropZone = (id: string) => {
        const zone = document.createElement("div");
        zone.id = id;

        Object.assign(zone.style, {
            minWidth: "180px",
            height: "42px",
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            border: "2px solid #30363d",
            borderRadius: "6px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 10px",
        });

        return zone;
    };

    const createTestCase = () => {
        const row = document.createElement("div");
        row.id = `test-case-${testCasesContainer.children.length + 1}`;

        Object.assign(row.style, {
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginLeft: "20px",
            width: "fit-content",
            padding: "5px",
        });

        const open = document.createElement("span");
        open.textContent = "assert(";

        const comma = document.createElement("span");
        comma.textContent = ",";

        const close = document.createElement("span");
        close.textContent = ")";

        const zone1 = createDropZone(
            `case${testCasesContainer.children.length + 1}-zone1`,
        );
        const zone2 = createDropZone(
            `case${testCasesContainer.children.length + 1}-zone2`,
        );

        row.appendChild(open);
        row.appendChild(zone1);
        row.appendChild(comma);
        row.appendChild(zone2);
        row.appendChild(close);

        return { row, zone1, zone2 };
    };

    const testCases: Array<{ zone1: HTMLDivElement; zone2: HTMLDivElement }> =
        [];

    for (let i = 0; i < 2; i++) {
        const tc = createTestCase();
        testCasesContainer.appendChild(tc.row);
        testCases.push({ zone1: tc.zone1, zone2: tc.zone2 });
    }

    const draggableDivsContainer = document.createElement("div");

    Object.assign(draggableDivsContainer.style, {
        width: "90%",
        height: "45%",
        display: "flex",
        flexWrap: "wrap",
        gap: "12px",
        padding: "20px",
        backgroundColor: "rgba(255, 255, 255, 0.03)",
        borderRadius: "12px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        overflowY: "auto",
        alignItems: "flex-start",
        margin: "0 auto",
    });

    container.appendChild(draggableDivsContainer);

    const testCasePool = getPool();

    for (const piece of testCasePool) {
        const draggableDiv = document.createElement("div");

        Object.assign(draggableDiv.style, {
            backgroundColor: "#1f2428",
            color: "#e1e4e8",
            display: "inline-flex",
            justifyContent: "center",
            alignItems: "center",
            fontFamily: "'Fira Code', 'Google Sans Code', monospace",
            fontSize: "15px",
            cursor: "grab",
            position: "relative",
            padding: "8px 14px",
            borderRadius: "6px",
            border: "1px solid #444c56",
            boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
            whiteSpace: "nowrap",
            userSelect: "none",
        });

        draggableDiv.textContent = piece;

        draggableDiv.addEventListener("mousedown", (e: MouseEvent) => {
            e.preventDefault();

            clickDragSound.play();

            const containerRect = container.getBoundingClientRect();
            const rect = draggableDiv.getBoundingClientRect();

            const offsetX = e.clientX - rect.left;
            const offsetY = e.clientY - rect.top;

            draggableDiv.style.position = "absolute";
            draggableDiv.style.zIndex = "9999";

            const onMouseMove = (e: MouseEvent) => {
                draggableDiv.style.left = `${e.clientX - containerRect.left - offsetX}px`;
                draggableDiv.style.top = `${e.clientY - containerRect.top - offsetY}px`;
            };

            const onMouseUp = () => {
                document.removeEventListener("mousemove", onMouseMove);
                document.removeEventListener("mouseup", onMouseUp);

                const dragRect = draggableDiv.getBoundingClientRect();
                const dragCenterX = dragRect.left + dragRect.width / 2;
                const dragCenterY = dragRect.top + dragRect.height / 2;

                let dropped = false;

                for (const tc of testCases) {
                    for (const zone of [tc.zone1, tc.zone2]) {
                        const dropRect = zone.getBoundingClientRect();

                        const isOver =
                            dragCenterX > dropRect.left &&
                            dragCenterX < dropRect.right &&
                            dragCenterY > dropRect.top &&
                            dragCenterY < dropRect.bottom;

                        if (isOver && zone.children.length === 0) {
                            zone.appendChild(draggableDiv);

                            Object.assign(draggableDiv.style, {
                                position: "static",
                                left: "",
                                top: "",
                                zIndex: "",
                            });

                            dropSound.play();
                            dropped = true;
                            trackTestCases(scene);
                            break;
                        }
                    }

                    if (dropped) break;
                }

                if (!dropped) {
                    draggableDivsContainer.appendChild(draggableDiv);

                    Object.assign(draggableDiv.style, {
                        position: "relative",
                        left: "0px",
                        top: "0px",
                        zIndex: "",
                    });

                    presentToJudgeButtonGlobal?.destroy();
                }
            };

            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseup", onMouseUp);
        });

        draggableDivsContainer.appendChild(draggableDiv);
    }
}
