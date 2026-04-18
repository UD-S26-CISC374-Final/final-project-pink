interface Rectangle {
    x: number;
    y: number;
    width: number;
    height: number;
    color: number;
    alpha: number;
}

interface TextButtonConfig {
    text: string;
    fontFamily: string;
    fontSize: number;
    color: string;
    wordWrapWidth?: number;
}

export default function createTextButton(
    this: Phaser.Scene,
    containerX: number,
    containerY: number,
    rectangleData: Rectangle,
    buttonData: TextButtonConfig,
    enableTween: boolean,
): Phaser.GameObjects.Container {
    const { text, fontFamily, fontSize, color } = buttonData;
    const { width, height, color: rectColor, alpha } = rectangleData;

    const buttonContainer = this.add
        .container(containerX, containerY)
        .setAlpha(0);

    const buttonBackground = this.add
        .rectangle(0, 0, width, height, rectColor, alpha)
        .setOrigin(0.5);

    const buttonText = this.add
        .text(0, 0, text, {
            fontFamily,
            fontSize,
            color,
            wordWrap:
                buttonData.wordWrapWidth ?
                    { width: buttonData.wordWrapWidth, useAdvancedWrap: true }
                :   undefined,
        })
        .setOrigin(0.5);

    buttonContainer.add([buttonBackground, buttonText]);

    buttonContainer.setSize(buttonText.width, buttonText.height);
    buttonContainer.setInteractive();

    if (enableTween) {
        this.tweens.add({
            targets: buttonContainer,
            alpha: 1,
            duration: 1000,
            ease: "Power2",
        });
    }

    return buttonContainer;
}
