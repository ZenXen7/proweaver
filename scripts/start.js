export default class GameStart extends Phaser.Scene {
    constructor() {
        super({ key: "gamestart" });
        this.hearts = 8;
    }

    preload() {
        this.load.bitmapFont("arcade", "assets/images/arcade.png", "assets/arcade.xml");
    }

    create() {
        this.width = this.sys.game.config.width;
        this.height = this.sys.game.config.height;
        this.center_width = this.width / 2;
        this.center_height = this.height / 2;

        // Modern gradient background
        this.cameras.main.setBackgroundColor(0x0a0a0f);

        // Create animated background elements
        this.createBackgroundEffects();

        // Modern title with gradient effect
        const titleText = this.add
            .bitmapText(
                this.center_width,
                this.center_height - 40,
                "arcade",
                "ELEMENTAL DUO",
                35
            )
            .setOrigin(0.5)
            .setTint(0xff6b35);

        // Subtitle
        this.add
            .bitmapText(
                this.center_width,
                this.center_height,
                "arcade",
                "ADVENTURE BEGINS",
                20
            )
            .setOrigin(0.5)
            .setTint(0x4ecdc4);

        // Modern instruction text
        this.add
            .bitmapText(
                this.center_width,
                this.center_height + 50,
                "arcade",
                "PRESS SPACE OR CLICK TO START",
                12
            )
            .setOrigin(0.5)
            .setTint(0xffffff)
            .setAlpha(0.8);

        // Add pulsing animation to title
        this.tweens.add({
            targets: titleText,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 2000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        this.input.keyboard.on("keydown-SPACE", this.startGame, this);
        this.input.keyboard.on("keydown-ENTER", this.startGame, this);
        this.input.on("pointerdown", () => this.startGame(), this);
    }

    createBackgroundEffects() {
        // Add floating particles
        for (let i = 0; i < 20; i++) {
            const x = Phaser.Math.Between(0, this.width);
            const y = Phaser.Math.Between(0, this.height);
            const particle = this.add.circle(x, y, 2, 0xffffff, 0.3);
            
            this.tweens.add({
                targets: particle,
                y: y - 100,
                alpha: { from: 0.3, to: 0 },
                duration: Phaser.Math.Between(3000, 6000),
                ease: 'Linear',
                repeat: -1,
                delay: Phaser.Math.Between(0, 3000)
            });
        }

        // Add glowing orbs
        const fireOrb = this.add.circle(this.center_width - 100, this.center_height + 100, 30, 0xff6b35, 0.2);
        const waterOrb = this.add.circle(this.center_width + 100, this.center_height + 100, 30, 0x4ecdc4, 0.2);

        this.tweens.add({
            targets: [fireOrb, waterOrb],
            scaleX: 1.2,
            scaleY: 1.2,
            alpha: 0.4,
            duration: 2500,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
    }

    startGame() {
        this.scene.start("level1", {hearts: this.hearts});
    }
}