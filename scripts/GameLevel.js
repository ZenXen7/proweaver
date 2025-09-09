    let scores =[];
class GameLevel extends Phaser.Scene {
  constructor(levelName = "level1" , mapName ,  Data) {
    super({ key: levelName }); 
    this.levelName = levelName;
    this.mapName = mapName;
    this.intialData = Data;
    this.levelCount = 3;


    

  }

  init(data){
    this.hearts = data.hearts
  }


    preload() {


      this.load.image("tileset", "./assets/images/tile-new.png");
      this.load.image("background", "./assets/images/Ground.png");

      this.load.image("character1", "assets/images/worker-final.png");
      this.load.image("character2", "assets/images/woman.png");

      this.load.audio("coin", "./assets/audio/coin.mp3");
      this.load.audio("jump", "./assets/audio/jump.mp3");
      this.load.audio("levelEnd", "./assets/audio/levelEnd.mp3");
      this.load.audio("theme", "./assets/audio/theme.mp3");
      
      this.load.image("coin", "./assets/images/burger.png");
      this.load.image("coin2", "./assets/images/cash.png");
      this.load.image("wall", "./assets/images/Wall.png");
      this.load.image("wallBtn", "./assets/images/wallBtn.png");
      this.load.image("heart" , "../assets/images/heart.png")
      this.load.image("door" , "../assets/images/door.png")
      
      this.load.audio("wallOpen" , "../assets/audio/wallOpen.mp3")
      this.load.audio("wallClose" , "../assets/audio/wallClose.mp3")
      this.load.audio("lose" , "../assets/audio/lose.mp3")
      this.load.audio("gameOverSound" , "../assets/audio/gameOver.mp3")
      

      this.load.tilemapCSV("tilemap1", "./assets/maps/LEVEL1.csv");
      this.load.tilemapCSV("tilemap2", "./assets/maps/level2.csv");
      this.load.tilemapCSV("tilemap3", "./assets/maps/level3.csv");
      


    }


    create() {

    this.Data = structuredClone(this.intialData);
   
    this.levelStartTime = Math.floor(new Date().getTime() / 1000);
    
    this.waterLevel = this.cameras.main.height + 50;
    this.waterRiseSpeed = this.Data.waterRiseSpeed || 0.8;
    this.maxLevelTime = this.Data.timeLimit || 45000;
    this.levelStartTime = Date.now();
    this.waterActive = false;




      this.createModernBackground();

      const background = this.add.image(
        this.cameras.main.centerX,
        this.cameras.main.centerY,
        "background"
      );
  
      background.displayWidth = this.cameras.main.width;
      background.displayHeight = this.cameras.main.height;
      background.setScrollFactor(0);
      background.setAlpha(0.3); 
  
      const map = this.make.tilemap({
        key: this.mapName,
        tileWidth: 32,
        tileHeight: 32,
      });


      const tiles = map.addTilesetImage("tileset");
      const layerY = background.displayHeight / map.heightInPixels;
      const layer = map.createLayer(0, tiles, 0, layerY);
  
      this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);




  
      const groundLevel = this.cameras.main.height - 60;








  
      this.character1 = this.physics.add
        .sprite(100, groundLevel, "character1")
        .setOrigin(0.5, 1)
        .setCollideWorldBounds(true)
        .setBounce(0.2)
        .setDrag(100)
        .setGravityY(500)
        .setScale(0.3);
  
      this.character1.body.setSize(80, 200);
      
      this.character1.setTint(0xff6b35);
      this.addCharacterGlow(this.character1, 0xff6b35, 'fire');




  
      this.character2 = this.physics.add
        .sprite(160, groundLevel, "character2")
        .setOrigin(0.5, 1)
        .setCollideWorldBounds(true)
        .setBounce(0.2)
        .setDrag(100)
        .setGravityY(500)
        .setScale(0.3);
  
      this.character2.body.setSize(80, 200);

      this.character2.setTint(0x4ecdc4);
      this.addCharacterGlow(this.character2, 0x4ecdc4, 'water');


      this.coins = this.physics.add.staticGroup();
      this.coins2 = this.physics.add.staticGroup(); 







      map.setCollisionBetween(0, 2);
      this.physics.add.collider(this.character1, layer);
      this.physics.add.collider(this.character2, layer);

  
      this.physics.add.overlap(
        this.character2,
        this.coins,
        this.hitCoin,
        null,
        this
      );
      this.physics.add.overlap(
        this.character1,
        this.coins2,
        this.hitCoin,
        null,
        this
      );




      this.walls = this.physics.add.staticGroup();
      this.wallBtns = this.physics.add.staticGroup();

      this.createWalls();

 



  
      this.loadAudios();
      this.playMusic();
  
      this.score = 0;
  
      this.scoreText = this.add.text(26, 4, "Evidence: 0", {
        fontSize: "26px",
        fill: "#fff",
        fontFamily: "Arial, sans-serif",
        stroke: "#000",
        strokeThickness: 2
      }).setScrollFactor(0).setDepth(5);

      this.timeText = this.add.text(26, 35, "Time: 60s", {
        fontSize: "16px",
        fill: "#fff",
        fontFamily: "Arial, sans-serif",
        stroke: "#000",
        strokeThickness: 2
      }).setScrollFactor(0).setDepth(5);

      this.waterLevelIndicator = this.add.graphics();
      this.waterLevelIndicator.setScrollFactor(0).setDepth(5);

      if (window.updateGameUI) {
        window.updateGameUI({
          level: this.registry.get("currentLevel") || 1,
          score: this.score
        });
      }





      // for development only
      /*this.dimensionsText = this.add.text(400, 40, "Dimensions", {
        fontSize: "24px",
        fill: "#00f",
      }).setScrollFactor(0).setDepth(5);*/

      if(this.registry.get("currentLevel")  === undefined){
        this.registry.set("currentLevel", 1);
        }
      let currentLevel = this.registry.get("currentLevel") ;
      let door; 
      if(currentLevel > 1){
        door = this.add.image(75, 96, 'door');
      }else{ door = this.add.image(75, 64, 'door');}  

      door.setDisplaySize(100, 76); 
      door.setDepth(0);







  
      this.cursors = this.input.keyboard.createCursorKeys();
      this.cameras.main.startFollow(this.character1, true);
      this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
     layer.setDepth(1);
      this.character1.setDepth(2);
      this.character2.setDepth(2);


  
      this.createCoins();
      this.createHearts();
      this.createWaterVisual();
      this.setupTouchControls();
    }


    setupTouchControls() {
      const leftButton1 = document.getElementById("left1");
      const rightButton1 = document.getElementById("right1");
      const upButton1 = document.getElementById("up1");
  
      leftButton1.addEventListener("touchstart", () => this.moveCharacter(this.character1, "left"));
      rightButton1.addEventListener("touchstart", () => this.moveCharacter(this.character1, "right"));
      upButton1.addEventListener("touchstart", () => this.jumpCharacter(this.character1));
  
      const leftButton2 = document.getElementById("left2");
      const rightButton2 = document.getElementById("right2");
      const upButton2 = document.getElementById("up2");
  
      leftButton2.addEventListener("touchstart", () => this.moveCharacter(this.character2, "left"));
      rightButton2.addEventListener("touchstart", () => this.moveCharacter(this.character2, "right"));
      upButton2.addEventListener("touchstart", () => this.jumpCharacter(this.character2));
    }
  
    moveCharacter(character, direction) {
      if (direction === "left") {
        character.setVelocityX(-400);
      } else if (direction === "right") {
        character.setVelocityX(400);
      }
    }
  
    jumpCharacter(character) {
      if (character.body.blocked.down) {
        character.setVelocityY(-500);
        this.playAudio("jump");
      }
    }
  


  
    createCoins() {
      let coinsX = this.Data.waterCoinsX;
      let coinsY = this.Data.waterCoinsy;

      console.log(coinsX)
      console.log(coinsY)


      for (let i = 0; i < 10; i++) {
        const x = coinsX[i];
        const y = coinsY[i]-60;
        const coin = this.coins.create(x, y, "coin");
        coin.body.allowGravity = false;
        
        // Add modern coin effects
        coin.setTint(0x4ecdc4);
        coin.setScale(0.8);
        
        // Add floating animation
        this.tweens.add({
          targets: coin,
          y: y - 10,
          scaleX: 0.9,
          scaleY: 0.9,
          duration: 2000,
          ease: 'Sine.easeInOut',
          yoyo: true,
          repeat: -1,
          delay: i * 200
        });
        
        // Add subtle glow
        const coinGlow = this.add.circle(x, y, 15, 0x4ecdc4, 0.2);
        coinGlow.setDepth(0);
        this.tweens.add({
          targets: coinGlow,
          alpha: 0.4,
          scaleX: 1.2,
          scaleY: 1.2,
          duration: 2000,
          ease: 'Sine.easeInOut',
          yoyo: true,
          repeat: -1,
          delay: i * 200
        });
      }


       coinsX = this.Data.fireCoinsX;
       coinsY = this.Data.fireCoinsy;

      for (let i = 0; i < 10; i++) {
        const x = coinsX[i];
        const y = coinsY[i]-60;
        const coin2 = this.coins2.create(x, y, "coin2");
        coin2.body.allowGravity = false;
        
        // Add modern coin effects
        coin2.setTint(0xff6b35);
        coin2.setScale(0.8);
        
        // Add floating animation
        this.tweens.add({
          targets: coin2,
          y: y - 10,
          scaleX: 0.9,
          scaleY: 0.9,
          duration: 2000,
          ease: 'Sine.easeInOut',
          yoyo: true,
          repeat: -1,
          delay: i * 200
        });
        
        // Add subtle glow
        const coinGlow = this.add.circle(x, y, 15, 0xff6b35, 0.2);
        coinGlow.setDepth(0);
        this.tweens.add({
          targets: coinGlow,
          alpha: 0.4,
          scaleX: 1.2,
          scaleY: 1.2,
          duration: 2000,
          ease: 'Sine.easeInOut',
          yoyo: true,
          repeat: -1,
          delay: i * 200
        });
      }


    }

    createHearts(){

    this.heartsGroup = this.physics.add.staticGroup().setDepth(5);

    for (let i = 0; i < this.hearts; i++) {
        let heart = this.heartsGroup.create(770 - i * 25, 16, 'heart').setDepth(5).setScale(0.1);
        heart.refreshBody();
        this.heartsGroup.add(heart);
    }

    }

     loseHeart() {
      // Remove the last heart from the group
      if (this.heartsGroup.getLength() > 0) {
          let lastHeart = this.heartsGroup.getLast(true);
          lastHeart.destroy();

          if(this.hearts == 0){
            this.looseGame();
          }else{
           this.playAudio("lose");

          }
      }
  }


    createWalls() {



      this.Data.walls.forEach(
        (item )=>{
      let wall = this.walls.create(item[0], item[1], 'wall').setScale(item[2]).refreshBody();
      let wallBtn1 = this.wallBtns.create(item[3], item[4], 'wallBtn').setScale(item[7]).refreshBody();
      let wallBtn2 = this.wallBtns.create(item[5], item[6], 'wallBtn').setScale(item[7]).refreshBody();

      wall.body.allowGravity = false;
      wallBtn1.body.allowGravity = false;
      wallBtn2.body.allowGravity = false;

      item.push(
        wall,false,"close","close"
      )


      }
    )

          console.log(this.Data.walls)     


    this.physics.add.collider(this.character1, this.walls);
    this.physics.add.collider(this.character2, this.walls);


    }



    





  
    hitCoin(player, coin) {
      this.playAudio("coin");
      this.showPoints(100, coin.x, coin.y);
      this.updateScore(100);
      coin.destroy();
    }
  
    loadAudios() {//filling audio objects in an arraay
      this.audios = {
        jump: this.sound.add("jump"),
        coin: this.sound.add("coin"),
        levelEnd: this.sound.add("levelEnd"),
        wallOpen: this.sound.add("wallOpen"),
        wallClose: this.sound.add("wallClose"),
        lose: this.sound.add("lose"),
        gameOverSound: this.sound.add("gameOverSound"),
        
      };
    }
  
    playAudio(key) {
      this.audios[key].play();
    }
  
    playMusic(theme = "theme") {
      this.theme = this.sound.add(theme);
      this.theme.stop();
      this.theme.play({
        mute: false,
        volume: 0.5,
        rate: 1,
        detune: 0,
        seek: 0,
        loop: true,
        delay: 0,
      });
    }




  
    update() {
      this.updateWaterLevel();
      this.updateCharacterEffects();

      this.character1.setVelocityX(0);
      if (this.cursors.left.isDown) {
        this.character1.setVelocityX(-200);
      } else if (this.cursors.right.isDown) {
        this.character1.setVelocityX(200);
      }
      if (this.cursors.up.isDown && this.character1.body.blocked.down) {
        this.character1.setVelocityY(-500);
        this.playAudio("jump");
      }
  
      this.character2.setVelocityX(0);
      if (this.input.keyboard.addKey('A').isDown) {
        this.character2.setVelocityX(-200);
      } else if (this.input.keyboard.addKey('D').isDown) {
        this.character2.setVelocityX(200);
      }
      if (this.input.keyboard.addKey('W').isDown && this.character2.body.blocked.down) {
        this.character2.setVelocityY(-500);
        this.playAudio("jump");
      }
      


      //End the game when the door is reacvhed
      const thresholdY = 150; 
      if (this.character1.y <= thresholdY && this.character2.y <= thresholdY
          && this.character1.x <= 100 && this.character2.x <= 100 ) {

        this.finishScene();

      }

      let x1,x2,y1,y2;
      x1 = this.character1.x ;
      y1 = this.character1.y ;
      x2 = this.character2.x ;
      y2 = this.character2.y ;


      this.Data.walls.forEach( (item)=>{

            item[9] = item[10];

          
        if (x1> item[3]-20    &&   x1<= item[3]+20   &&   y1 > item[4]-10   &&    y1 <= item[4]+70
          ||x1> item[5]-20    &&   x1<= item[5]+20   &&   y1 > item[6]-10   &&    y1 <= item[6]+70
          ||x2 > item[3]-20   &&   x2 <= item[3]+20  &&   y2 > item[4]-10   &&    y2 <= item[4]+70
          ||x2 > item[5]-20   &&   x2 <= item[5]+20  &&   y2 > item[6]-10   &&    y2 <= item[6]+70) {
          
            item[10] = "open";
          item[8].setY(item[1]-35);
          item[8].setAngle(90);
          item[8].body.enable = false; 
         item[8].refreshBody();


      }else {
        item[10] = "close";
        item[8].setY(item[1]);
        item[8].setAngle(0);
        item[8].body.enable = true;
       item[8].refreshBody();

      } 

      if(item[9] == "open" && item[10] == "close" ){
          //console.log("close")
          this.playAudio("wallClose");
        }else if(item[9] == "close" && item[10]=="open"){
          //console.log("open")
          this.playAudio("wallOpen");


        }

}      
)  




if (this.waterActive && this.waterLevel < this.cameras.main.height) {
      const char1Bottom = this.character1.y + this.character1.height;
      const char2Bottom = this.character2.y + this.character2.height;
      
      if (char1Bottom >= this.waterLevel || char2Bottom >= this.waterLevel) {
        this.gameOver('drowned');
        return;
      }
    } 






      //this.dimensionsText.setText(Math.floor(this.character2.x) + " x "+Math.floor(this.character2.y))

    }

    createWaterVisual() {
      this.waterGraphics = this.add.graphics();
      this.waterGraphics.setDepth(3);
      this.waterGraphics.setScrollFactor(0);
      
      this.waterSurface = this.add.graphics();
      this.waterSurface.setDepth(4);
      this.waterSurface.setScrollFactor(0);
    }

    updateWaterLevel() {
      const elapsedTime = Date.now() - this.levelStartTime;
      const gracePeriod = 10000;
      
      if (elapsedTime < gracePeriod) {
        this.waterActive = false;
        this.waterLevel = this.cameras.main.height + 50;
        this.renderWater();
        this.updateWaterUI(elapsedTime);
        return;
      }
      
      this.waterActive = true;
      const adjustedElapsedTime = elapsedTime - gracePeriod;
      const timeProgress = Math.min(1.0, adjustedElapsedTime / this.maxLevelTime);
      
      if (timeProgress >= 1.0) {
        this.gameOver('timeout');
        return;
      }
      
      const screenHeight = this.cameras.main.height;
      const waterStartLevel = screenHeight + 50;
      const waterEndLevel = screenHeight - 200;
      
      this.waterLevel = waterStartLevel - (timeProgress * (waterStartLevel - waterEndLevel));
      
      this.renderWater();
      this.updateWaterUI(elapsedTime);
    }

    updateWaterUI(elapsedTime) {
      const gracePeriod = 10000;
      
      if (elapsedTime < gracePeriod) {
        const graceRemaining = Math.ceil((gracePeriod - elapsedTime) / 1000);
        this.timeText.setFill('#00ff00');
        this.timeText.setText(`Grace period: ${graceRemaining}s`);
        
        this.waterLevelIndicator.clear();
        this.waterLevelIndicator.fillStyle(0x00ff00, 0.8);
        this.waterLevelIndicator.fillRect(this.cameras.main.width - 25, 80, 15, 100);
        return;
      }
      
      const adjustedElapsedTime = Math.max(0, elapsedTime - gracePeriod);
      const remainingTime = Math.max(0, this.maxLevelTime - adjustedElapsedTime);
      const seconds = Math.ceil(remainingTime / 1000);
      
      this.timeText.setFill(remainingTime < 10000 ? '#ff4757' : '#ffffff');
      this.timeText.setText(`Flood in: ${seconds}s`);
      
      const waterStartLevel = this.cameras.main.height + 50;
      const waterEndLevel = this.cameras.main.height - 200;
      const waterProgress = Math.max(0, Math.min(1, (waterStartLevel - this.waterLevel) / (waterStartLevel - waterEndLevel)));
      this.waterLevelIndicator.clear();
      this.waterLevelIndicator.fillStyle(0x0096ff, 0.8);
      this.waterLevelIndicator.fillRect(this.cameras.main.width - 25, 80, 15, 100);
      this.waterLevelIndicator.fillStyle(0x0064c8, 0.9);
      this.waterLevelIndicator.fillRect(this.cameras.main.width - 23, 80 + (100 * (1 - waterProgress)), 11, 100 * waterProgress);
      
      this.waterLevelIndicator.fillStyle(0xffffff);
      this.add.text(this.cameras.main.width - 17, 195, 'Flood', {
        fontSize: '12px',
        fill: '#ffffff',
        fontFamily: 'Arial',
        align: 'center'
      }).setOrigin(0.5).setScrollFactor(0).setDepth(5);
    }

    renderWater() {
      this.waterGraphics.clear();
      this.waterSurface.clear();
      
      if (this.waterLevel < this.cameras.main.height) {
        this.waterGraphics.fillStyle(0x0064c8, 0.7);
        this.waterGraphics.fillRect(0, this.waterLevel, this.cameras.main.width, this.cameras.main.height - this.waterLevel);
        
        this.waterSurface.fillStyle(0x0096ff, 0.9);
        this.waterSurface.fillRect(0, this.waterLevel - 8, this.cameras.main.width, 8);
        
        for (let i = 0; i < this.cameras.main.width; i += 15) {
          const waveHeight = Math.sin((Date.now() * 0.008) + (i * 0.03)) * 4;
          this.waterSurface.fillStyle(0x64c8ff, 0.95);
          this.waterSurface.fillRect(i, this.waterLevel + waveHeight - 3, 12, 3);
        }
        
        this.waterSurface.fillStyle(0xc8f0ff, 0.3);
        for (let i = 0; i < 5; i++) {
          const bubbleX = (Date.now() * 0.02 + i * 150) % this.cameras.main.width;
          const bubbleY = this.waterLevel + 20 + Math.sin(Date.now() * 0.003 + i) * 10;
          if (bubbleY < this.cameras.main.height) {
            this.waterSurface.fillCircle(bubbleX, bubbleY, 2 + Math.sin(Date.now() * 0.01 + i) * 1);
          }
        }
      }
    }

    gameOver(reason) {
      this.gameOverReason = reason;
      this.playAudio("gameOverSound");
      this.theme.stop();
      this.scene.start("gameover", { scores: [this.score], reason: reason });
    }





  
  

    

    




  
    updateScore(points = 0) {
      this.score += points;
      this.scoreText.setText("Evidence: " + this.score);
      
      // Update the external modern UI
      if (window.updateGameUI) {
        window.updateGameUI({
          level: this.registry.get("currentLevel") || 1,
          score: this.score
        });
      }
    }
  
    showPoints(score, x, y) {
      let pointsText = this.add.text(x, y, `+${score}`, {
        fontSize: "28px",
        fill: "#4ecdc4",
        fontFamily: "Arial, sans-serif",
        stroke: "#000",
        strokeThickness: 3,
        shadow: {
          offsetX: 2,
          offsetY: 2,
          color: '#000000',
          blur: 4,
          fill: true
        }
      }).setOrigin(0.5).setDepth(5); 
  
      // Add modern floating animation with scaling
      this.tweens.add({
        targets: pointsText,
        y: y - 80,
        scaleX: { from: 0.5, to: 1.2 },
        scaleY: { from: 0.5, to: 1.2 },
        alpha: { from: 1, to: 0 },
        duration: 1200,
        ease: 'Back.easeOut',
        onComplete: () => {
          pointsText.destroy();
        },
      });

      // Add particle effect
      this.createScoreParticles(x, y);
    }

    createScoreParticles(x, y) {
      // Create small particle effects when scoring
      for (let i = 0; i < 5; i++) {
        const particle = this.add.circle(x, y, 3, 0x4ecdc4, 0.8).setDepth(6);
        
        this.tweens.add({
          targets: particle,
          x: x + Phaser.Math.Between(-30, 30),
          y: y + Phaser.Math.Between(-40, -10),
          alpha: { from: 0.8, to: 0 },
          scale: { from: 1, to: 0.2 },
          duration: 800,
          ease: 'Quad.easeOut',
          delay: i * 100,
          onComplete: () => {
            particle.destroy();
          }
        });
      }
    }



    looseGame(){
        this.registry.set("currentLevel", 1);

        let currentLevel = this.registry.get("currentLevel") ;
  
        scores.push(this.score);


          this.registry.set("score", this.score);
          this.playAudio("gameOverSound");
          this.scene.stop();
          this.theme.stop();
          this.scene.start("gameover", {  scores: scores });
          scores = []; 

  



    }
    
  
    finishScene() {

      if(this.registry.get("currentLevel")  === undefined){
      this.registry.set("currentLevel", 1);
      }
      let currentLevel = this.registry.get("currentLevel") ;

      const levelEndTime = Math.floor(new Date().getTime() / 1000);
      const speedValue =Math.floor(10 / (levelEndTime - this.levelStartTime) * 10000)
      this.score +=speedValue;
      scores.push(this.score);
      if(currentLevel == this.levelCount){

        this.playAudio("levelEnd");
        this.scene.stop();
        this.theme.stop();
        this.registry.set("currentLevel", 1);
        this.scene.start("end", { level: currentLevel, scores: scores });
        scores = [];
      }else{
        //console.log(scores)
        this.registry.set("score", this.score);
        this.playAudio("levelEnd");
        this.scene.stop();
        this.theme.stop();
        this.scene.start("nextScenex", { score : this.score, hearts: this.hearts}); 
      }

    }

    createModernBackground() {
      // Create a modern gradient background
      const graphics = this.add.graphics();
      
      // Create gradient effect
      graphics.fillGradientStyle(0x0a0a0f, 0x0a0a0f, 0x1a1a2e, 0x16213e, 1);
      graphics.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
      graphics.setScrollFactor(0);
      graphics.setDepth(-2);

      // Add subtle animated elements
      this.createBackgroundParticles();
    }

    createBackgroundParticles() {
      // Add floating ambient particles
      for (let i = 0; i < 15; i++) {
        const x = Phaser.Math.Between(0, this.cameras.main.width);
        const y = Phaser.Math.Between(0, this.cameras.main.height);
        const size = Phaser.Math.Between(1, 3);
        
        const particle = this.add.circle(x, y, size, 0xffffff, 0.1);
        particle.setScrollFactor(0.1); // Parallax effect
        particle.setDepth(-1);
        
        // Floating animation
        this.tweens.add({
          targets: particle,
          y: y - 200,
          alpha: { from: 0.1, to: 0 },
          duration: Phaser.Math.Between(8000, 15000),
          ease: 'Linear',
          repeat: -1,
          delay: Phaser.Math.Between(0, 5000)
        });
      }

      // Add elemental orbs that move across the background
      this.createElementalOrbs();
    }

    createElementalOrbs() {
      // Fire orbs
      for (let i = 0; i < 3; i++) {
        const fireOrb = this.add.circle(
          Phaser.Math.Between(-50, this.cameras.main.width + 50),
          Phaser.Math.Between(50, this.cameras.main.height - 50),
          Phaser.Math.Between(8, 15),
          0xff6b35,
          0.15
        );
        fireOrb.setScrollFactor(0.2);
        fireOrb.setDepth(-1);
        
        this.tweens.add({
          targets: fireOrb,
          x: fireOrb.x + Phaser.Math.Between(-200, 200),
          y: fireOrb.y + Phaser.Math.Between(-100, 100),
          scaleX: { from: 1, to: 1.5 },
          scaleY: { from: 1, to: 1.5 },
          alpha: { from: 0.15, to: 0.05 },
          duration: Phaser.Math.Between(10000, 20000),
          ease: 'Sine.easeInOut',
          yoyo: true,
          repeat: -1
        });
      }

      // Water orbs
      for (let i = 0; i < 3; i++) {
        const waterOrb = this.add.circle(
          Phaser.Math.Between(-50, this.cameras.main.width + 50),
          Phaser.Math.Between(50, this.cameras.main.height - 50),
          Phaser.Math.Between(8, 15),
          0x4ecdc4,
          0.15
        );
        waterOrb.setScrollFactor(0.2);
        waterOrb.setDepth(-1);
        
        this.tweens.add({
          targets: waterOrb,
          x: waterOrb.x + Phaser.Math.Between(-200, 200),
          y: waterOrb.y + Phaser.Math.Between(-100, 100),
          scaleX: { from: 1, to: 1.5 },
          scaleY: { from: 1, to: 1.5 },
          alpha: { from: 0.15, to: 0.05 },
          duration: Phaser.Math.Between(10000, 20000),
          ease: 'Sine.easeInOut',
          yoyo: true,
          repeat: -1,
          delay: 5000
        });
      }
    }

    addCharacterGlow(character, color, elementType) {
      // Create a subtle glow effect around characters
      const glowRadius = 40;
      const glow = this.add.circle(character.x, character.y, glowRadius, color, 0.1);
      glow.setDepth(1);
      
      // Make glow follow the character
      this.physics.add.existing(glow);
      glow.body.setSize(glowRadius * 2, glowRadius * 2);
      glow.body.setOffset(-glowRadius, -glowRadius);
      
      // Store glow reference on character
      character.glowEffect = glow;
      
      // Pulsing animation
      this.tweens.add({
        targets: glow,
        scaleX: 1.2,
        scaleY: 1.2,
        alpha: 0.2,
        duration: 2000,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1
      });

      // Add particle trail
      this.createCharacterTrail(character, color, elementType);
    }

    createCharacterTrail(character, color, elementType) {
      // Create particle trail that follows the character when moving
      character.trailParticles = [];
      character.lastTrailTime = 0;
      
      // Store element type for trail effects
      character.elementType = elementType;
      character.trailColor = color;
    }

    updateCharacterEffects() {
      // Update character glows to follow their positions
      if (this.character1 && this.character1.glowEffect) {
        this.character1.glowEffect.x = this.character1.x;
        this.character1.glowEffect.y = this.character1.y;
        
        // Create movement particles
        this.createMovementParticles(this.character1);
      }
      
      if (this.character2 && this.character2.glowEffect) {
        this.character2.glowEffect.x = this.character2.x;
        this.character2.glowEffect.y = this.character2.y;
        
        // Create movement particles
        this.createMovementParticles(this.character2);
      }
    }

    createMovementParticles(character) {
      // Only create particles when character is moving
      const isMoving = Math.abs(character.body.velocity.x) > 50 || Math.abs(character.body.velocity.y) > 50;
      
      if (isMoving && this.time.now - character.lastTrailTime > 100) {
        character.lastTrailTime = this.time.now;
        
        const particle = this.add.circle(
          character.x + Phaser.Math.Between(-10, 10),
          character.y + Phaser.Math.Between(-20, 0),
          Phaser.Math.Between(2, 4),
          character.trailColor,
          0.6
        );
        
        particle.setDepth(1);
        
        this.tweens.add({
          targets: particle,
          alpha: 0,
          scale: 0.2,
          duration: 800,
          ease: 'Quad.easeOut',
          onComplete: () => {
            particle.destroy();
          }
        });
      }
    }
  }
  
  export default GameLevel;
  
