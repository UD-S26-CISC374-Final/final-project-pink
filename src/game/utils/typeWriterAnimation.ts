export async function typewriterEffect(
    judge: Phaser.GameObjects.Sprite,
    typingInProgress: boolean,
    target: Phaser.GameObjects.Text,
    speedInMS: number = 50,
) {
    // credit for code: https://joel.net/creating-a-typewriter-effect-in-phaserjs-v3
    const message = target.text;
    const invisibleMessage = message.replace(/[^ ]/g, " ");
    target.text = "";
    let visibleText = "";

    return new Promise<void>((resolve) => {
        typingInProgress = true;
        const timer = target.scene.time.addEvent({
            delay: speedInMS,
            loop: true,
            callback: () => {
                if (target.text === message) {
                    timer.destroy();
                    judge.anims.pause();
                    judge.setFrame(0);
                    typingInProgress = false;
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
