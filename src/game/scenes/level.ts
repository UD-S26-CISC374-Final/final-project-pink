import { Scene } from "phaser";
import type { ChangeableScene } from "../reactable-scene";

export class Level extends Scene implements ChangeableScene {
    constructor() {
        super("Level");
    }

    create() {
        this.changeScene();
    }

    changeScene() {
        this.scene.start("Case", {
            isTutorial: false,
            nextTutorialText: "",
            difficulty: "easy",
            currentTutorialCaseIndex: 0,
        });
    }
}
