var score = 0;
var scoreText;
var instuctionsText;
var restartButton;

var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {
        y: 300
      },
      debug: false
    }
  },
  scene: [Level1]
};

var game = new Phaser.Game(config);