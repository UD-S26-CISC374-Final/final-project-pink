import createTextButton from "./createTextButton";
import tutorialCases from "../data/tutorial-cases.json";
import type { UnitTest } from "../data/types";

let tutorialCaseIndexGlobal = 0;
let isTutorialGlobal = false;
let presentToJudgeButtonGlobal: Phaser.GameObjects.Container | undefined =
    undefined;

const EVIDENCE_LETTERS = ["A", "B", "C", "D"];

function showPresentToJudgeButton(
    testCases: string[],
    currentScene: Phaser.Scene,
) {
    const letters = testCases
        .map((testCase) => {
            const pool = tutorialCases[tutorialCaseIndexGlobal].evidencePool;
            const numIdx = pool.map((tc) => tc.label).indexOf(testCase);

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
            let filledBlankCount = 0;

            testCaseDiv.querySelectorAll("div").forEach((zone) => {
                const zoneText = zone.querySelector("div")?.textContent;
                if (zoneText) filledBlankCount++;
            });

            if (filledBlankCount === 2) {
                completedCount++;
                constructedTestCases.push(
                    testCaseDiv.textContent.replace(",", ", "),
                );
            }

            presentToJudgeButtonGlobal?.destroy();
        });

    if (completedCount === constructedTestCasesContainer.children.length) {
        console.log("All test cases complete");
        showPresentToJudgeButton(constructedTestCases, scene);
    }
}

function getPool() {
    if (isTutorialGlobal) {
        const testCase = tutorialCases[tutorialCaseIndexGlobal];
        const testCasePool = testCase.evidencePool.flatMap((tc: UnitTest) => {
            return tc.label
                .replace(/^assert\((.*)\)$/, "$1")
                .split(",")
                .map((part) => part.trim());
        });

        // randomize them so that the correct ones aren't always in the same spot
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

    return [];
}

export default function showDraggableTestCases(
    scene: Phaser.Scene,
    tutorialCaseIndex: number,
    isTutorial: boolean,
    container: HTMLDivElement,
) {
    tutorialCaseIndexGlobal = tutorialCaseIndex;
    isTutorialGlobal = isTutorial;

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
            minWidth: "100px",
            height: "40px",
            border: "2px dashed #00ff00",
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

    container.appendChild(testCasesContainer);

    const draggableDivsContainer = document.createElement("div");
    Object.assign(draggableDivsContainer.style, {
        width: "85%",
        height: "50%",
        display: "flex",
        flexWrap: "wrap",
        gap: "10px",
        padding: "10px",
        overflowY: "auto",
        alignItems: "flex-start",
    });

    container.appendChild(draggableDivsContainer);

    const testCasePool = getPool();
    console.log("Test case pool in showDraggableTestCases:", testCasePool);

    for (let i = 0; i < testCasePool.length; i++) {
        const draggableDiv = document.createElement("div");

        Object.assign(draggableDiv.style, {
            backgroundColor: "#ff00ff",
            color: "#ffffff",
            display: "inline-flex",
            justifyContent: "center",
            alignItems: "center",
            fontFamily: "Google Sans Code",
            fontSize: "14px",
            cursor: "grab",
            position: "relative",
            padding: "6px 10px",
            borderRadius: "6px",
            whiteSpace: "nowrap",
            userSelect: "none",
        });

        draggableDiv.textContent = testCasePool[i];

        draggableDiv.addEventListener("mousedown", (e: MouseEvent) => {
            e.preventDefault();

            const containerRect = container.getBoundingClientRect();
            const rect = draggableDiv.getBoundingClientRect();

            const offsetX = e.clientX - rect.left;
            const offsetY = e.clientY - rect.top;

            draggableDiv.style.position = "absolute";
            draggableDiv.style.zIndex = "9999";

            const onMouseMove = (e: MouseEvent) => {
                const x = e.clientX - containerRect.left - offsetX;
                const y = e.clientY - containerRect.top - offsetY;

                draggableDiv.style.left = `${x}px`;
                draggableDiv.style.top = `${y}px`;
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

                        if (isOver) {
                            zone.appendChild(draggableDiv);

                            Object.assign(draggableDiv.style, {
                                position: "static",
                                left: "",
                                top: "",
                                zIndex: "",
                                cursor: "grab",
                            });

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
// Had help from ChatGPT to implement this dragging logic
