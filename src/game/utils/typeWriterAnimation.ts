export function typewriterEffect(
    judge: Phaser.GameObjects.Sprite | null,
    target: Phaser.GameObjects.Text,
    message: string,
    speedInMS: number = 50,
) {
    // credit for code: https://joel.net/creating-a-typewriter-effect-in-phaserjs-v3
    // code altered from the original, but overall logic and structure is the same

    const invisibleMessage = message.replace(/[^ ]/g, " ");
    target.setText("");

    let visibleText = "";

    return new Promise<void>((resolve) => {
        const timer = target.scene.time.addEvent({
            delay: speedInMS,
            loop: true,
            callback: () => {
                if (visibleText.length >= message.length) {
                    timer.destroy();
                    if (judge) {
                        judge.anims.pause();
                        judge.setFrame(0);
                    }
                    resolve();
                    return;
                }

                visibleText += message[visibleText.length];
                const invisibleText = invisibleMessage.substring(
                    visibleText.length,
                );

                target.setText(visibleText + invisibleText);
            },
        });
    });
}
