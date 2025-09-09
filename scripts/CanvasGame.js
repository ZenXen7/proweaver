class CanvasGame {
  constructor(containerId, width = 800, height = 640) {
    this.container = document.getElementById(containerId);
    this.width = width;
    this.height = height;
    this.canvas = null;
    this.ctx = null;
    this.gameState = 'start';
    this.currentLevel = 1;
    this.score = 0;
    this.hearts = 8;
    
    this.player1 = null;
    this.player2 = null;
    this.coins = [];
    this.fireCoins = [];
    this.walls = [];
    this.particles = [];
    
    this.waterLevel = 0;
    this.waterRiseSpeed = 0.5;
    this.levelStartTime = 0;
    this.maxLevelTime = 60000;
    
    this.keys = {};
    this.touchControls = {};
    
    this.lastTime = 0;
    this.gameRunning = false;
    
    this.levelData = this.getLevelData();
    
    this.init();
  }
  
  init() {
    this.createCanvas();
    this.setupEventListeners();
    this.loadAssets();
    this.startGameLoop();
  }
  
  createCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.canvas.style.background = 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%)';
    this.canvas.style.borderRadius = '12px';
    this.canvas.style.border = '1px solid rgba(255, 255, 255, 0.1)';
    
    this.ctx = this.canvas.getContext('2d');
    this.container.appendChild(this.canvas);
  }
  
  setupEventListeners() {
    document.addEventListener('keydown', (e) => {
      this.keys[e.key] = true;
      if (e.key === ' ') {
        if (this.gameState === 'start') {
          this.startGame();
        } else if (this.gameState === 'gameOver') {
          this.restartGame();
        }
      }
    });
    
    document.addEventListener('keyup', (e) => {
      this.keys[e.key] = false;
    });
    
    this.setupTouchControls();
    
    this.canvas.addEventListener('click', () => {
      if (this.gameState === 'start') {
        this.startGame();
      } else if (this.gameState === 'gameOver') {
        this.restartGame();
      }
    });
  }
  
  setupTouchControls() {
    const touchButtons = {
      'left1': () => this.movePlayer(this.player1, 'left'),
      'right1': () => this.movePlayer(this.player1, 'right'),
      'up1': () => this.jumpPlayer(this.player1),
      'left2': () => this.movePlayer(this.player2, 'left'),
      'right2': () => this.movePlayer(this.player2, 'right'),
      'up2': () => this.jumpPlayer(this.player2)
    };
    
    Object.keys(touchButtons).forEach(id => {
      const button = document.getElementById(id);
      if (button) {
        button.addEventListener('touchstart', (e) => {
          e.preventDefault();
          touchButtons[id]();
        });
        
        button.addEventListener('mousedown', (e) => {
          e.preventDefault();
          touchButtons[id]();
        });
      }
    });
  }
  
  loadAssets() {
    this.assets = {
      fireCharacter: { color: '#ff6b35', width: 24, height: 32 },
      waterCharacter: { color: '#4ecdc4', width: 24, height: 32 },
      fireCoin: { color: '#ff6b35', radius: 8 },
      waterCoin: { color: '#4ecdc4', radius: 8 },
      wall: { color: '#666666', width: 32, height: 32 },
      door: { color: '#8B4513', width: 50, height: 38 }
    };
  }
  
  getLevelData() {
    return {
      1: {
        waterCoinsX: [288, 430, 667, 700, 136, 430, 750, 276],
        waterCoinsy: [130, 230, 220, 130, 318, 430, 510, 606],
        fireCoinsX: [228, 60, 567, 600, 296, 50, 650, 376],
        fireCoinsy: [130, 230, 220, 130, 318, 480, 490, 606],
        walls: [
          [480, 435, 0.8, 450, 606, 420, 478, 0.2],
          [600, 305, 0.8, 418, 318, 500, 190, 0.2]
        ],
        timeLimit: 60000,
        waterRiseSpeed: 0.8
      },
      2: {
        waterCoinsX: [288, 127, 667, 700, 136, 430, 750, 276],
        waterCoinsy: [130, 600, 220, 130, 318, 370, 510, 606],
        fireCoinsX: [348, 60, 550, 600, 296, 50, 650, 376],
        fireCoinsy: [130, 350, 200, 300, 338, 480, 500, 640],
        walls: [
          [440, 465, 0.8, 408, 510, 583, 510, 0.2],
          [215, 83, 0.8, 300, 222, 130, 126, 0.2]
        ],
        timeLimit: 50000,
        waterRiseSpeed: 1.0
      },
      3: {
        waterCoinsX: [288, 127, 720, 700, 116, 250, 750, 276],
        waterCoinsy: [130, 250, 400, 130, 400, 500, 510, 636],
        fireCoinsX: [228, 60, 670, 600, 226, 50, 650, 376],
        fireCoinsy: [130, 260, 400, 130, 400, 500, 500, 636],
        walls: [
          [450, 340, 0.8, 177, 253, 475, 382, 0.2],
          [542, 83, 0.8, 713, 254, 410, 158, 0.2]
        ],
        timeLimit: 40000,
        waterRiseSpeed: 1.2
      }
    };
  }
  
  startGame() {
    this.gameState = 'playing';
    this.initializeLevel(this.currentLevel);
    this.gameRunning = true;
    this.startGameLoop();
  }
  
  restartGame() {
    this.gameState = 'playing';
    this.currentLevel = 1;
    this.score = 0;
    this.hearts = 8;
    this.initializeLevel(this.currentLevel);
    this.gameRunning = true;
  }
  
  initializeLevel(level) {
    const data = this.levelData[level];
    if (!data) return;
    
    this.player1 = {
      x: 100,
      y: this.height - 100,
      width: 24,
      height: 32,
      vx: 0,
      vy: 0,
      onGround: false,
      color: '#ff6b35',
      type: 'fire'
    };
    
    this.player2 = {
      x: 160,
      y: this.height - 100,
      width: 24,
      height: 32,
      vx: 0,
      vy: 0,
      onGround: false,
      color: '#4ecdc4',
      type: 'water'
    };
    
    this.coins = [];
    this.fireCoins = [];
    
    for (let i = 0; i < Math.min(8, data.waterCoinsX.length); i++) {
      this.coins.push({
        x: data.waterCoinsX[i],
        y: data.waterCoinsy[i] - 60,
        radius: 8,
        color: '#4ecdc4',
        collected: false,
        type: 'water'
      });
    }
    
    for (let i = 0; i < Math.min(8, data.fireCoinsX.length); i++) {
      this.fireCoins.push({
        x: data.fireCoinsX[i],
        y: data.fireCoinsy[i] - 60,
        radius: 8,
        color: '#ff6b35',
        collected: false,
        type: 'fire'
      });
    }
    
    
    this.ground = this.height - 32;
    this.waterLevel = this.height - 10;
    this.waterRiseSpeed = data.waterRiseSpeed || 0.8;
    this.maxLevelTime = data.timeLimit || 45000;
    this.levelStartTime = Date.now();
    
    // Update external UI
    if (window.updateGameUI) {
      window.updateGameUI({ level: this.currentLevel, score: this.score });
    }
  }
  
  startGameLoop() {
    const gameLoop = (currentTime) => {
      if (this.gameRunning) {
        const deltaTime = currentTime - this.lastTime;
        this.update(deltaTime);
        this.render();
      }
      this.lastTime = currentTime;
      requestAnimationFrame(gameLoop);
    };
    requestAnimationFrame(gameLoop);
  }
  
  update(deltaTime) {
    if (this.gameState === 'playing') {
      this.updateWaterLevel(deltaTime);
      this.updatePlayers(deltaTime);
      this.updatePhysics(deltaTime);
      this.checkCollisions();
      this.updateParticles(deltaTime);
      this.handleInput();
    }
  }
  
  updateWaterLevel(deltaTime) {
    const elapsedTime = Date.now() - this.levelStartTime;
    const timeProgress = elapsedTime / this.maxLevelTime;
    
    if (timeProgress >= 1.0) {
      this.gameOver('timeout');
      return;
    }
    
    const startingWaterLevel = this.height - 10;
    const maxRiseHeight = this.height - 100;
    const currentRiseHeight = timeProgress * maxRiseHeight;
    this.waterLevel = startingWaterLevel - currentRiseHeight;
  }
  
  updatePlayers(deltaTime) {
    [this.player1, this.player2].forEach(player => {
      player.vy += 0.8;
      
      player.x += player.vx;
      player.y += player.vy;
      
      if (player.y + player.height > this.ground) {
        player.y = this.ground - player.height;
        player.vy = 0;
        player.onGround = true;
      } else {
        player.onGround = false;
      }
      
      if (player.x < 0) player.x = 0;
      if (player.x + player.width > this.width) player.x = this.width - player.width;
      
      player.vx *= 0.8;
    });
  }
  
  updatePhysics(deltaTime) {
  }
  
  checkCollisions() {
    this.coins.forEach(coin => {
      if (!coin.collected && this.isColliding(this.player2, coin)) {
        coin.collected = true;
        this.score += 100;
        this.createScoreParticles(coin.x, coin.y, coin.color);
        this.playSound('coin');
      }
    });
    
    this.fireCoins.forEach(coin => {
      if (!coin.collected && this.isColliding(this.player1, coin)) {
        coin.collected = true;
        this.score += 100;
        this.createScoreParticles(coin.x, coin.y, coin.color);
        this.playSound('coin');
      }
    });
    
    if (this.player1.y + this.player1.height >= this.waterLevel || 
        this.player2.y + this.player2.height >= this.waterLevel) {
      this.gameOver('drowned');
      return;
    }
    
    if (this.player1.x < 100 && this.player1.y < 150 && 
        this.player2.x < 100 && this.player2.y < 150) {
      this.levelComplete();
    }
    
    // Update external UI
    if (window.updateGameUI) {
      window.updateGameUI({ level: this.currentLevel, score: this.score });
    }
  }
  
  isColliding(rect1, rect2) {
    const r1 = {
      x: rect1.x,
      y: rect1.y,
      width: rect1.width || rect1.radius * 2,
      height: rect1.height || rect1.radius * 2
    };
    
    const r2 = {
      x: rect2.x - (rect2.radius || 0),
      y: rect2.y - (rect2.radius || 0),
      width: rect2.width || rect2.radius * 2,
      height: rect2.height || rect2.radius * 2
    };
    
    return r1.x < r2.x + r2.width &&
           r1.x + r1.width > r2.x &&
           r1.y < r2.y + r2.height &&
           r1.y + r1.height > r2.y;
  }
  
  handleInput() {
    this.player1.vx = 0;
    if (this.keys['ArrowLeft']) this.player1.vx = -5;
    if (this.keys['ArrowRight']) this.player1.vx = 5;
    if (this.keys['ArrowUp'] && this.player1.onGround) {
      this.player1.vy = -15;
      this.playSound('jump');
    }
    
    this.player2.vx = 0;
    if (this.keys['a'] || this.keys['A']) this.player2.vx = -5;
    if (this.keys['d'] || this.keys['D']) this.player2.vx = 5;
    if ((this.keys['w'] || this.keys['W']) && this.player2.onGround) {
      this.player2.vy = -15;
      this.playSound('jump');
    }
  }
  
  movePlayer(player, direction) {
    if (direction === 'left') player.vx = -5;
    if (direction === 'right') player.vx = 5;
  }
  
  jumpPlayer(player) {
    if (player.onGround) {
      player.vy = -15;
      this.playSound('jump');
    }
  }
  
  createScoreParticles(x, y, color) {
    for (let i = 0; i < 5; i++) {
      this.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * -3 - 1,
        life: 1,
        maxLife: 60,
        color: color,
        size: 3
      });
    }
  }
  
  createHazardEffect(x, y, color) {
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 1,
        maxLife: 40,
        color: color,
        size: 2
      });
    }
  }
  
  updateParticles(deltaTime) {
    this.particles = this.particles.filter(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.2;
      particle.life -= 1/particle.maxLife;
      return particle.life > 0;
    });
  }
  
  levelComplete() {
    this.score += 1000;
    this.currentLevel++;
    
    if (this.currentLevel > Object.keys(this.levelData).length) {
      this.gameState = 'complete';
    } else {
      this.initializeLevel(this.currentLevel);
    }
  }
  
  gameOver(reason) {
    this.gameState = 'gameOver';
    this.gameRunning = false;
    this.gameOverReason = reason;
    this.playSound('gameOver');
  }
  
  playSound(soundName) {
    console.log(`Playing sound: ${soundName}`);
  }
  
  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    if (this.gameState === 'start') {
      this.renderStartScreen();
    } else if (this.gameState === 'playing') {
      this.renderGame();
    } else if (this.gameState === 'complete') {
      this.renderCompleteScreen();
    } else if (this.gameState === 'gameOver') {
      this.renderGameOverScreen();
    }
  }
  
  renderStartScreen() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    this.ctx.fillStyle = '#ff6b35';
    this.ctx.font = 'bold 36px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('ELEMENTAL DUO', this.width/2, this.height/2 - 40);
    
    this.ctx.fillStyle = '#4ecdc4';
    this.ctx.font = '20px Arial';
    this.ctx.fillText('ADVENTURE BEGINS', this.width/2, this.height/2);
    
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '14px Arial';
    this.ctx.fillText('PRESS SPACE OR CLICK TO START', this.width/2, this.height/2 + 50);
  }
  
  renderGame() {
    this.renderBackgroundEffects();
    
    this.ctx.fillStyle = '#333333';
    this.ctx.fillRect(0, this.ground, this.width, this.height - this.ground);
    
    if (this.waterLevel < this.height) {
      this.ctx.fillStyle = 'rgba(0, 100, 200, 0.7)';
      this.ctx.fillRect(0, this.waterLevel, this.width, this.height - this.waterLevel);
      
      this.ctx.fillStyle = 'rgba(0, 150, 255, 0.9)';
      this.ctx.fillRect(0, this.waterLevel - 8, this.width, 8);
      
      for (let i = 0; i < this.width; i += 15) {
        const waveHeight = Math.sin((Date.now() * 0.008) + (i * 0.03)) * 4;
        this.ctx.fillStyle = 'rgba(100, 200, 255, 0.95)';
        this.ctx.fillRect(i, this.waterLevel + waveHeight - 3, 12, 3);
      }
      
      this.ctx.fillStyle = 'rgba(200, 240, 255, 0.3)';
      for (let i = 0; i < 5; i++) {
        const bubbleX = (Date.now() * 0.02 + i * 150) % this.width;
        const bubbleY = this.waterLevel + 20 + Math.sin(Date.now() * 0.003 + i) * 10;
        this.ctx.beginPath();
        this.ctx.arc(bubbleX, bubbleY, 2 + Math.sin(Date.now() * 0.01 + i) * 1, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }
    
    this.coins.forEach(coin => {
      if (!coin.collected) {
        this.ctx.fillStyle = coin.color;
        this.ctx.beginPath();
        this.ctx.arc(coin.x, coin.y, coin.radius, 0, Math.PI * 2);
        this.ctx.fill();
      }
    });
    
    this.fireCoins.forEach(coin => {
      if (!coin.collected) {
        this.ctx.fillStyle = coin.color;
        this.ctx.beginPath();
        this.ctx.arc(coin.x, coin.y, coin.radius, 0, Math.PI * 2);
        this.ctx.fill();
      }
    });
    
    this.renderPlayer(this.player1);
    this.renderPlayer(this.player2);
    
    this.particles.forEach(particle => {
      this.ctx.fillStyle = particle.color + Math.floor(particle.life * 255).toString(16).padStart(2, '0');
      this.ctx.fillRect(particle.x - particle.size/2, particle.y - particle.size/2, particle.size, particle.size);
    });
    
    this.renderUI();
    
    this.ctx.fillStyle = '#8B4513';
    this.ctx.fillRect(50, 64, 50, 38);
    this.ctx.fillStyle = '#654321';
    this.ctx.fillRect(55, 69, 40, 28);
  }
  
  renderPlayer(player) {
    this.ctx.fillStyle = player.color;
    this.ctx.fillRect(player.x, player.y, player.width, player.height);
    
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(player.x + 6, player.y + 8, 3, 3);
    this.ctx.fillRect(player.x + 15, player.y + 8, 3, 3);
  }
  
  renderBackgroundEffects() {
    for (let i = 0; i < 10; i++) {
      const x = (Date.now() * 0.01 + i * 80) % (this.width + 20);
      const y = 50 + Math.sin(Date.now() * 0.002 + i) * 30;
      
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      this.ctx.beginPath();
      this.ctx.arc(x, y, 2, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }
  
  renderUI() {
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 20px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`Score: ${this.score}`, 20, 30);
    
    for (let i = 0; i < this.hearts; i++) {
      this.ctx.fillStyle = '#ff4757';
      this.ctx.fillText('♥', this.width - 30 - (i * 20), 30);
    }
    
    this.ctx.fillStyle = '#4ecdc4';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`Level ${this.currentLevel}`, this.width/2, 30);
    
    const elapsedTime = Date.now() - this.levelStartTime;
    const remainingTime = Math.max(0, this.maxLevelTime - elapsedTime);
    const seconds = Math.ceil(remainingTime / 1000);
    
    this.ctx.fillStyle = remainingTime < 10000 ? '#ff4757' : '#ffffff';
    this.ctx.font = 'bold 16px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`Time: ${seconds}s`, 20, 55);
    
    const waterProgress = 1 - ((this.waterLevel - 100) / (this.height - 100));
    this.ctx.fillStyle = 'rgba(0, 150, 255, 0.8)';
    this.ctx.fillRect(this.width - 25, 80, 15, 100);
    this.ctx.fillStyle = 'rgba(0, 100, 200, 0.9)';
    this.ctx.fillRect(this.width - 23, 80 + (100 * (1 - waterProgress)), 11, 100 * waterProgress);
    
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Water', this.width - 17, 195);
  }
  
  renderCompleteScreen() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    this.ctx.fillStyle = '#4ecdc4';
    this.ctx.font = 'bold 36px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('CONGRATULATIONS!', this.width/2, this.height/2 - 40);
    
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '20px Arial';
    this.ctx.fillText(`Final Score: ${this.score}`, this.width/2, this.height/2 + 20);
  }
  
  renderGameOverScreen() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    this.ctx.fillStyle = '#ff4757';
    this.ctx.font = 'bold 36px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('GAME OVER', this.width/2, this.height/2 - 60);
    
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '20px Arial';
    
    if (this.gameOverReason === 'drowned') {
      this.ctx.fillText('The water caught you!', this.width/2, this.height/2 - 20);
    } else if (this.gameOverReason === 'timeout') {
      this.ctx.fillText('Time ran out!', this.width/2, this.height/2 - 20);
    }
    
    this.ctx.fillText(`Score: ${this.score}`, this.width/2, this.height/2 + 10);
    this.ctx.font = '14px Arial';
    this.ctx.fillText('PRESS SPACE OR CLICK TO RESTART', this.width/2, this.height/2 + 50);
  }
}

window.CanvasGame = CanvasGame;
