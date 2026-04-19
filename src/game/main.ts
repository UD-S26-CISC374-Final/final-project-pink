import { Boot } from "./scenes/boot";
import { GameOver } from "./scenes/game-over";
import { Level1 as MainGame } from "./scenes/level1";
import { MainMenu } from "./scenes/main-menu";
import { AUTO, Game } from "phaser";
import { Preloader } from "./scenes/preloader";
import { Tutorial } from "./scenes/tutorial";
import { Case } from "./scenes/case";
import { Verdict } from "./scenes/verdict";

//  Find out more information about the Game Config at:
//  https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config: Phaser.Types.Core.GameConfig = {
    title: "Case By Case",
    version: "0.0.1",
    type: AUTO,
    parent: "game-container",
    backgroundColor: "#ffffff",
    scene: [
        Boot,
        Preloader,
        MainMenu,
        MainGame,
        GameOver,
        Tutorial,
        Case,
        Verdict,
    ],
    scale: {
        parent: "phaser-game",
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1024, // 1024
        height: 768, // 768
    },
    physics: {
        default: "arcade",
        arcade: {
            debug: false,
            gravity: { x: 0, y: 300 },
        },
    },
    input: {
        keyboard: true,
        mouse: true,
        touch: true,
        gamepad: false,
    },
    render: {
        pixelArt: true,
        antialias: true,
    },
};

const StartGame = (parent: string) => {
    return new Game({ ...config, parent });
};

export default StartGame;
