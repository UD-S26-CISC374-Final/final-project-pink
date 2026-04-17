import { Scene } from "phaser";
import tutorialCases from "../data/tutorial-cases.json";

export class Tutorial extends Scene {
    judge: Phaser.GameObjects.Sprite;

    constructor() {
        super("Tutorial");
    }

    create() {
        this.cameras.main.setBackgroundColor("#2d2d2d");

        this.anims.create({
            key: "talk",
            frames: this.anims.generateFrameNumbers("judge-compiler-sprite", {
                frames: [0, 1, 2],
            }),
            frameRate: 3,
            repeat: -1,
        });

        this.judge = this.add
            .sprite(0, this.cameras.main.height, "judge-compiler-sprite", 0)
            .setOrigin(0, 1)
            .setScale(3);

        this.judge.play("talk", true);
    }

    update() {}

    changeScene() {
        this.scene.start("GameOver");
    }
}

// import { GameObjects, Scene } from "phaser";
// import tutorialCases from "../data/tutorial-cases.json";

// export class Tutorial extends Scene {
//     introTutorialText: GameObjects.Text;
//     codeDesc: GameObjects.Text;
//     descTutorialText: GameObjects.Text;
//     selectedTestCases: string[] = [];
//     selectedTestCasesDisplay: GameObjects.Text;

//     constructor() {
//         super("Tutorial");
//     }

//     displaySelectedTestCases() {
//         this.selectedTestCasesDisplay.destroy();
//         this.selectedTestCasesDisplay = this.add
//             .text(
//                 755,
//                 400,
//                 `Selected Test Cases: ${this.selectedTestCases.join(", ")}`,
//                 {
//                     fontFamily: "Times New Roman",
//                     fontSize: 18,
//                     color: "red",
//                     align: "left",
//                 },
//             )
//             .setDepth(100);
//     }

//     create() {
//         const bg = this.add.image(
//             this.cameras.main.centerX,
//             this.cameras.main.centerY,
//             "template",
//         );

//         this.introTutorialText = this.add
//             .text(
//                 22,
//                 14,
//                 "Welcome to the tutorial! This is where you'll learn the basics of getting the hang at being a lawyer at the Syntax Criminal Court! To \nstart, let's familiarize ourselves with the interface you'll be using to disect each case. Starting off, each case will follow this UI:",
//                 {
//                     fontFamily: "Times New Roman",
//                     fontSize: 18,
//                     color: "#101ee4",
//                     align: "left",
//                     lineSpacing: 5,
//                 },
//             )
//             .setDepth(100);

//         this.add.rectangle(373, 292, 700, 452, 0x000000);
//         this.add.rectangle(868, 322, 266, 510, 0x000000);

//         const tutorialTest1 = this.add
//             .image(210, 640, "tutorial-test-1")
//             .setScale(0.19)
//             .setInteractive();

//         tutorialTest1.on("pointerdown", () => {
//             if (this.selectedTestCases.length !== 2) {
//                 if (!this.selectedTestCases.includes("A")) {
//                     this.selectedTestCases.push("A");
//                 } else {
//                     this.selectedTestCases = this.selectedTestCases.filter(
//                         (test) => test !== "A",
//                     );
//                 }
//             }
//             this.displaySelectedTestCases();
//         });

//         const tutorialTest2 = this.add
//             .image(210, 725, "tutorial-test-2")
//             .setScale(0.19)
//             .setInteractive();

//         tutorialTest2.on("pointerdown", () => {
//             if (this.selectedTestCases.length !== 2) {
//                 if (!this.selectedTestCases.includes("B")) {
//                     this.selectedTestCases.push("B");
//                 } else {
//                     this.selectedTestCases = this.selectedTestCases.filter(
//                         (test) => test !== "B",
//                     );
//                 }
//             }
//             this.displaySelectedTestCases();
//         });

//         const tutorialTest3 = this.add
//             .image(590, 690, "tutorial-test-3")
//             .setScale(0.19)
//             .setInteractive();

//         tutorialTest3.on("pointerdown", () => {
//             if (this.selectedTestCases.length !== 2) {
//                 if (!this.selectedTestCases.includes("C")) {
//                     this.selectedTestCases.push("C");
//                 } else {
//                     this.selectedTestCases = this.selectedTestCases.filter(
//                         (test) => test !== "C",
//                     );
//                 }
//             }
//             this.displaySelectedTestCases();
//         });

//         this.add
//             .image(373, 292, "tutorial-code-1")
//             .setScale(0.3)
//             .setInteractive();

//         this.codeDesc = this.add
//             .text(
//                 755,
//                 100,
//                 "This function claims to \nreturn the non-negative \nabsolute value of any \nnumber.",
//                 {
//                     fontFamily: "Times New Roman",
//                     fontSize: 23,
//                     color: "#ffffff",
//                     align: "left",
//                     lineSpacing: 5,
//                 },
//             )
//             .setDepth(100);

//         this.descTutorialText = this.add
//             .text(
//                 22,
//                 526,
//                 "The given function above claims to follow the specifications on the right. Select the two \ntest cases that best interrogate this claim. Will they confirm the function's innocence or \nexpose its guilt?",
//                 {
//                     fontFamily: "Times New Roman",
//                     fontSize: 18,
//                     color: "#101ee4",
//                     align: "left",
//                     lineSpacing: 5,
//                 },
//             )
//             .setDepth(100);

//         // Force the image to match your game dimensions
//         bg.setDisplaySize(this.scale.width, this.scale.height);
//     }

//     update() {}

//     changeScene() {
//         this.scene.start("GameOver");
//     }
// }
