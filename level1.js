class Level1 extends Phaser.Scene {
  constructor () {
    super({key: 'Level1'});
    this.platforms;
    this.player;
    this.stars;
    this.cursors;
    this.music;
    this.gameOver = false;
  }

  preload() {
    this.load.image('restart_button', 'assets/button_restart-game.png');
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.spritesheet('dude',
      'assets/dude.png',
      { frameWidth: 32, frameHeight: 48 }
    );

    this.load.audio('coin', 'assets/smw_coin.wav');
    this.load.audio('sad_music', 'assets/smw_lost_a_life.wav');
    this.load.audio('jump', 'assets/smw_jump.wav');
    this.load.audio('soundtrack', 'assets/game_music.mp3');
    this.load.audio('star_spawn', 'assets/smw_star_spawn.wav');
    this.load.audio('tap_down', 'assets/smw_tap_down.wav');
  }

  create() {
    this.add.image(400, 300, 'sky');
    restartButton = this.add.image(400, 300, 'restart_button').setDepth(1).setInteractive();
    restartButton.setVisible(false);
    restartButton.on('pointerdown', this.restartGame);
    this.music = this.sound.add('soundtrack');

    scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });
    instuctionsText = this.add.text(16, 550, 'Move: Left/Right Arrow keys. Jump: Space or Up.', { fontSize: '24px', fill: '#FFF' }).setDepth(1);
    setTimeout(function() {
      instuctionsText.setVisible(false);
    }, 5000);

    // Platforms
    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();
    this.platforms.create(600, 400, 'ground');
    this.platforms.create(50, 250, 'ground');
    this.platforms.create(750, 220, 'ground');

    // Player
    this.player = this.physics.add.sprite(100, 450, 'dude');
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);
    this.player.body.setGravityY(300);

    // Stars
    this.stars = this.physics.add.group({
      key: 'star',
      repeat: 11,
      setXY: { x: 12, y: 0, stepX: 70 }
    });

    this.stars.children.iterate(function (child) {
      child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });


    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'turn',
      frames: [ { key: 'dude', frame: 4 } ],
      frameRate: 20
    });

    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1
    });

    this.cursors = this.input.keyboard.createCursorKeys();

    this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this);

    // Add Collider between the this.stars and the platform
    this.physics.add.collider(this.stars, this.platforms);

    // Add Collider between the player and the platforms group
    this.physics.add.collider(this.player, this.platforms);

    // Bombs
    this.bombs = this.physics.add.group();
    this.physics.add.collider(this.bombs, this.platforms);
    this.physics.add.collider(this.player, this.bombs, this.hitBomb, null, this);

    this.sound.play('soundtrack', {
      loop: true
    });
  }

  update(delta) {
    if (this.gameOver) return;

    if (this.cursors.left.isDown)
    {
      this.player.setVelocityX(-160);

      this.player.anims.play('left', true);
    }
    else if (this.cursors.right.isDown)
    {
      this.player.setVelocityX(160);

      this.player.anims.play('right', true);
    }
    else
    {
      this.player.setVelocityX(0);

      this.player.anims.play('turn');
    }

    if ((this.cursors.space.isDown || this.cursors.up.isDown) && this.player.body.touching.down)
    {
      this.player.setVelocityY(-480);
      this.sound.play('jump');
    }
  }

  collectStar (player, star)
  {
    star.disableBody(true, true);
    this.sound.play('coin');

    score += 10;
    scoreText.setText('Score: ' + score);

    if (this.stars.countActive(true) === 0)
    {
      this.stars.children.iterate(function (child) {

        child.enableBody(true, child.x, 0, true, true);
        game.sound.play('star_spawn', { volume: 0.125 });

      });

      var x = (this.player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

      var bomb = this.bombs.create(x, 16, 'bomb');
      bomb.setBounce(1);
      bomb.setCollideWorldBounds(true);
      bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
      bomb.allowGravity = false;
    }
  }

  hitBomb (player, bomb)
  {
    this.physics.pause();

    player.setTint(0xff0000);

    player.anims.play('turn');

    this.physics.pause();
    // this.music.manager.destroy();
    // console.log(this);
    // console.log(this.music);
    this.sound.play('sad_music');
    restartButton.setVisible(true);
    this.gameOver = true;
  }

  restartGame () {
    console.log('restarting game?');
    window.location.reload();
  }
}