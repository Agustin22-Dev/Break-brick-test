export default class HelloWorldScene extends Phaser.Scene {
  constructor() {
    super("hello-world");
  }

  init() {
    this.score = 0; // Inicializar la puntuación
    this.ballInitialVelocity = { x: 200, y: -200 }; // Velocidad inicial de la pelota
  }

  preload() {
    // No requiere imágenes ya que son solo figuras geométricas
  }

  create() {
    // Crear la paleta como un rectángulo un poco más arriba
    this.paddle = this.add.rectangle(400, 500, 80, 20, 0x00ff00);
    this.physics.add.existing(this.paddle);
    this.paddle.body.setImmovable(true);
    this.paddle.body.setCollideWorldBounds(true);

    // Crear la bola como un círculo con velocidad más balanceada
    this.ball = this.add.circle(400, 480, 10, 0xff0000);
    this.physics.add.existing(this.ball);
    this.ball.body.setCollideWorldBounds(true);
    this.ball.body.setBounce(1.1); // Mantener el rebote elevado
    this.resetBall(); // Inicializar la pelota

    // Configurar el puntero del mouse
    this.input.on('pointermove', this.movePaddle, this);

    // Crear los ladrillos como rectángulos
    this.bricks = this.physics.add.staticGroup();

    for (let i = 0; i < 20; i++) {
      let x = 70 + (i % 10) * 70;
      let y = 100 + Math.floor(i / 10) * 35;
      let brick = this.add.rectangle(x, y, 60, 20, 0x0000ff);
      this.physics.add.existing(brick, true);
      this.bricks.add(brick);
    }

    // Añadir colisiones
    this.physics.add.collider(this.ball, this.bricks, this.hitBrick, null, this);
    this.physics.add.collider(this.ball, this.paddle, this.hitPaddle, null, this);

    // Añadir el marcador
    this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });
  }

  update() {
    // Limitar la velocidad de la pelota
    const maxSpeed = 400;
    let velocityX = this.ball.body.velocity.x;
    let velocityY = this.ball.body.velocity.y;
    
    if (Phaser.Math.Distance.Between(0, 0, velocityX, velocityY) > maxSpeed) {
      const ratio = maxSpeed / Phaser.Math.Distance.Between(0, 0, velocityX, velocityY);
      this.ball.body.setVelocity(velocityX * ratio, velocityY * ratio);
    }

    // Reiniciar el juego si la bola toca la parte baja
    if (this.ball.getBottomCenter().y > this.cameras.main.height) {
      this.scene.restart();
      this.score = 0; // Reiniciar la puntuación
    }
  }

  movePaddle(pointer) {
    // Mover la paleta a la posición horizontal del puntero
    const paddleX = pointer.x;
    const paddleWidth = this.paddle.width;
    
    // Asegurarse de que la paleta no se salga del área de juego
    if (paddleX < paddleWidth / 2) {
      this.paddle.setX(paddleWidth / 2);
    } else if (paddleX > this.cameras.main.width - paddleWidth / 2) {
      this.paddle.setX(this.cameras.main.width - paddleWidth / 2);
    } else {
      this.paddle.setX(paddleX);
    }
  }

  resetBall() {
    // Posicionar la pelota en el centro y darle una velocidad inicial
    this.ball.setPosition(400, 480);
    this.ball.body.setVelocity(this.ballInitialVelocity.x, this.ballInitialVelocity.y);
  }

  hitBrick(ball, brick) {
    brick.destroy();
    this.score += 10;
    this.scoreText.setText('Score: ' + this.score);

    if (this.bricks.countActive() === 0) {
      this.scene.restart();
      this.score = 0;
    }
  }

  hitPaddle(ball, paddle) {
    let diff = 0;

    if (ball.x < paddle.x) {
      diff = paddle.x - ball.x;
      ball.body.setVelocityX(-10 * diff);
    } else if (ball.x > paddle.x) {
      diff = ball.x - paddle.x;
      ball.body.setVelocityX(10 * diff);
    } else {
      ball.body.setVelocityX(2 + Math.random() * 8);
    }
  }
}
