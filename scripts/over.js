export default class GameOver extends Phaser.Scene {
    constructor() {
        super({ key: "gameover" });
    }

    preload() {
        this.load.bitmapFont("arcade", "./assets/images/arcade.png", "./assets/arcade.xml");
    }

    init(data) {
        this.scores = data.scores;
        this.gameOverReason = data.reason || 'default';
        console.log(data);
    }

    create() {
        this.width = this.sys.game.config.width;
        this.height = this.sys.game.config.height;
        this.center_width = this.width / 2;
        this.center_height = this.height / 2;

        // Modern dark gradient background
        this.cameras.main.setBackgroundColor(0x0a0a0f);
        this.createModernBackground();

        let gameOverMessage = "CORRUPTION WINS";
        let subMessage = "The system has failed...";
        
        if (this.gameOverReason === 'drowned') {
            gameOverMessage = "FLOOD OF CORRUPTION";
            subMessage = "The baha caught our heroes!";
        } else if (this.gameOverReason === 'timeout') {
            gameOverMessage = "CORRUPTION SPREADS";
            subMessage = "Too slow to expose the truth!";
        }

        // Main title with modern styling
        this.add
            .bitmapText(
                this.center_width,
                this.center_height - 180,
                "arcade", 
                gameOverMessage,
                35
            )
            .setOrigin(0.5)
            .setTint(0xff4757);

        // Subtitle
        this.add
            .bitmapText(
                this.center_width,
                this.center_height - 130,
                "arcade", 
                subMessage,
                18
            )
            .setOrigin(0.5)
            .setTint(0xffffff);

        // Evidence section with modern styling
        this.add
            .bitmapText(
                this.center_width,
                this.center_height - 80,
                "arcade", 
                "EVIDENCE RECOVERED:",
                25
            )
            .setOrigin(0.5)
            .setTint(0x4ecdc4);

        const lineHeight = 35;
        const startY = this.center_height - 40;

        for (let i = 0; i < this.scores.length; i++) {
            this.add
                .bitmapText(
                    this.center_width,
                    startY + i * lineHeight,
                    "arcade",
                    `LEVEL ${i + 1}: ${this.scores[i]} PIECES`,
                    18
                )
                .setOrigin(0.5)
                .setTint(0xffffff);
        }

        // Call to action with modern styling
        this.add
            .bitmapText(
                this.center_width,
                this.center_height + this.scores.length * lineHeight + 50,
                "arcade",
                "FIGHT CORRUPTION AGAIN?",
                20
            )
            .setOrigin(0.5)
            .setTint(0xff6b35);

        this.add
            .bitmapText(
                this.center_width,
                this.center_height + this.scores.length * lineHeight + 80,
                "arcade",
                "PRESS SPACE OR CLICK TO RETRY",
                12
            )
            .setOrigin(0.5)
            .setTint(0xb8b8c8)
            .setAlpha(0.8);

        this.input.keyboard.on("keydown-SPACE", this.restartGame, this);
        this.input.on("pointerdown", () => this.restartGame(), this);
    }

    createModernBackground() {
        // Create gradient background similar to main game
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0x0a0a0f, 0x0a0a0f, 0x1a1a2e, 0x16213e, 1);
        graphics.fillRect(0, 0, this.width, this.height);
        graphics.setDepth(-2);

        // Add animated corruption-themed particles
        this.createCorruptionParticles();
    }

    createCorruptionParticles() {
        // Add floating dark particles to represent corruption
        for (let i = 0; i < 20; i++) {
            const x = Phaser.Math.Between(0, this.width);
            const y = Phaser.Math.Between(0, this.height);
            const size = Phaser.Math.Between(2, 5);
            
            const particle = this.add.circle(x, y, size, 0xff4757, 0.3);
            particle.setDepth(-1);
            
            // Floating animation
            this.tweens.add({
                targets: particle,
                y: y - 300,
                alpha: { from: 0.3, to: 0 },
                duration: Phaser.Math.Between(5000, 10000),
                ease: 'Linear',
                repeat: -1,
                delay: Phaser.Math.Between(0, 3000)
            });
        }

        // Add water-like corruption orbs
        for (let i = 0; i < 5; i++) {
            const corruptionOrb = this.add.circle(
                Phaser.Math.Between(-50, this.width + 50),
                Phaser.Math.Between(50, this.height - 50),
                Phaser.Math.Between(15, 25),
                0x4ecdc4,
                0.2
            );
            corruptionOrb.setDepth(-1);
            
            this.tweens.add({
                targets: corruptionOrb,
                x: corruptionOrb.x + Phaser.Math.Between(-100, 100),
                y: corruptionOrb.y + Phaser.Math.Between(-50, 50),
                scaleX: { from: 1, to: 1.3 },
                scaleY: { from: 1, to: 1.3 },
                alpha: { from: 0.2, to: 0.05 },
                duration: Phaser.Math.Between(8000, 15000),
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: -1
            });
        }
    }

    restartGame() {
        this.scene.start("gamestart");
    }
}