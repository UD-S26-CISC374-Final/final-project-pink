export function playConfettiEffect(this: Phaser.Scene) {
    // code credit: https://phaser.io/sandbox/TvRaZoxK
    const texture = this.textures.createCanvas("particleTexture", 10, 10);
    if (!texture) return;

    const context = texture.getContext();
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, 10, 10);
    texture.refresh();

    this.add.particles(0, 0, "particleTexture", {
        emitZone: {
            type: "random",
            source: new Phaser.Geom.Rectangle(0, 0, this.scale.width, 1),
        } as Phaser.Types.GameObjects.Particles.EmitZoneData,

        speedY: { min: 200, max: 300 },
        speedX: { min: -100, max: 100 },
        accelerationY: { min: 50, max: 100 },
        lifespan: { min: 2000, max: 3000 },

        scaleX: {
            onUpdate: (_particle, _key, t) => {
                return Math.sin(t * Math.PI * 10);
            },
        },

        rotate: { min: -180, max: 180 },
        frequency: 50,
        quantity: 2,
        tint: [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff],
    });
}
