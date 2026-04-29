export function typewriterEffect(
    judge: Phaser.GameObjects.Sprite | null,
    target: Phaser.GameObjects.Text,
    message: string,
    speedInMS: number = 30,
    scene: Phaser.Scene,
) {
    // credit for code: https://joel.net/creating-a-typewriter-effect-in-phaserjs-v3
    // code altered from the original, but overall logic and structure is the same

    const invisibleMessage = message.replace(/[^ ]/g, " ");
    target.setText("");
    let isSkipping = false;
    let isSpeedingUp = false;

    let visibleText = "";

    const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Enter") isSkipping = true;
        if (event.key === " ") isSpeedingUp = true;
    };
    const onKeyUp = (event: KeyboardEvent) => {
        if (event.key === " ") isSpeedingUp = false;
    };
    const onPointerDown = () => {
        isSpeedingUp = true;
    };
    const onPointerUp = () => {
        isSpeedingUp = false;
    };

    if (scene.input.keyboard) {
        scene.input.keyboard.on("keydown", onKeyDown);
        scene.input.keyboard.on("keyup", onKeyUp);
    }
    scene.input.on("pointerdown", onPointerDown);
    scene.input.on("pointerup", onPointerUp);

    const cleanup = () => {
        if (scene.input.keyboard) {
            scene.input.keyboard.off("keydown", onKeyDown);
            scene.input.keyboard.off("keyup", onKeyUp);
        }
        scene.input.off("pointerdown", onPointerDown);
        scene.input.off("pointerup", onPointerUp);
    };

    return new Promise<void>((resolve) => {
        const timer = target.scene.time.addEvent({
            delay: speedInMS,
            loop: true,
            callback: () => {
                if (visibleText.length >= message.length) {
                    timer.destroy();
                    cleanup();
                    if (judge) {
                        judge.anims.pause();
                        judge.setFrame(0);
                    }
                    resolve();
                    return;
                }
                if (isSkipping) {
                    target.setText(message);
                    timer.destroy();
                    cleanup();
                    if (judge) {
                        judge.anims.pause();
                        judge.setFrame(0);
                    }
                    resolve();
                    return;
                }

                // advance 4 chars per tick while held, 1 otherwise
                const charsToAdd = isSpeedingUp ? 4 : 1;
                for (
                    let i = 0;
                    i < charsToAdd && visibleText.length < message.length;
                    i++
                ) {
                    visibleText += message[visibleText.length];
                }
                const invisibleText = invisibleMessage.substring(
                    visibleText.length,
                );

                target.setText(visibleText + invisibleText);
            },
        });
    });
}
