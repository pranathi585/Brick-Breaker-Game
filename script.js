const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startScreen = document.getElementById("startScreen");
const startBtn = document.getElementById("startBtn");
const lastScoreEl = document.getElementById("lastScore");
const highScoreEl = document.getElementById("highScore");
const difficultySelect = document.getElementById("difficulty");

let difficulty = "medium";

// Ball
let x, y, dx, dy, isBallMoving;
const ballRadius = 8;

// Paddle
const paddleHeight = 10;
const paddleWidth = 75;
let paddleX;

// Controls
let rightPressed = false;
let leftPressed = false;

// Bricks
let brickRowCount, brickColumnCount;
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;

let bricks = [];
let score, lives;

function getDifficultySettings(level) {
  switch (level) {
    case "easy":
      return { speed: 2, rows: 2, columns: 4 };
    case "hard":
      return { speed: 4, rows: 5, columns: 6 };
    default:
      return { speed: 3, rows: 3, columns: 5 };
  }
}

function initGame() {
  const settings = getDifficultySettings(difficulty);
  dx = settings.speed;
  dy = -settings.speed;
  brickRowCount = settings.rows;
  brickColumnCount = settings.columns;

  // Ball
  x = canvas.width / 2;
  y = canvas.height - 20;
  isBallMoving = false;

  // Paddle
  paddleX = (canvas.width - paddleWidth) / 2;

  // Bricks
  bricks = [];
  for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
      bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
  }

  score = 0;
  lives = 3;
}

// Controls
document.addEventListener("keydown", (e) => {
  if (e.key === "Right" || e.key === "ArrowRight") rightPressed = true;
  if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = true;
  if (e.key === " " && !isBallMoving) isBallMoving = true;
});
document.addEventListener("keyup", (e) => {
  if (e.key === "Right" || e.key === "ArrowRight") rightPressed = false;
  if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = false;
});

// Brick collision
function collisionDetection() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      const b = bricks[c][r];
      if (b.status) {
        if (
          x > b.x &&
          x < b.x + brickWidth &&
          y > b.y &&
          y < b.y + brickHeight
        ) {
          dy = -dy;
          b.status = 0;
          score++;
          if (score === brickRowCount * brickColumnCount) {
            storeScores(score);
            alert("🎉 YOU WIN!");
            resetGame();
          }
        }
      }
    }
  }
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#00ffcc";
  ctx.fill();
  ctx.closePath();
}

function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
  ctx.fillStyle = "#00ffcc";
  ctx.fill();
  ctx.closePath();
}

function drawBricks() {
  const gradient = ctx.createLinearGradient(0, 0, brickWidth, brickHeight);
  gradient.addColorStop(0, "#ff5f6d");
  gradient.addColorStop(1, "#ffc371");

  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      const b = bricks[c][r];
      if (b.status) {
        const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
        const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
        b.x = brickX;
        b.y = brickY;
        ctx.beginPath();
        ctx.roundRect(brickX, brickY, brickWidth, brickHeight, 6);
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}

CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
  this.beginPath();
  this.moveTo(x + r, y);
  this.lineTo(x + w - r, y);
  this.quadraticCurveTo(x + w, y, x + w, y + r);
  this.lineTo(x + w, y + h - r);
  this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  this.lineTo(x + r, y + h);
  this.quadraticCurveTo(x, y + h, x, y + h - r);
  this.lineTo(x, y + r);
  this.quadraticCurveTo(x, y, x + r, y);
  this.closePath();
};

function drawScore() {
  ctx.font = "14px Arial";
  ctx.fillStyle = "#fff";
  ctx.fillText("Score: " + score, 8, 20);
}

function drawLives() {
  ctx.font = "14px Arial";
  ctx.fillStyle = "#fff";
  ctx.fillText("Lives: " + lives, canvas.width - 70, 20);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBricks();
  drawBall();
  drawPaddle();
  drawScore();
  drawLives();
  collisionDetection();

  if (!isBallMoving) {
    x = paddleX + paddleWidth / 2;
    y = canvas.height - 20;
  } else {
    x += dx;
    y += dy;
  }

  if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) dx = -dx;
  if (y + dy < ballRadius) dy = -dy;
  else if (y + dy > canvas.height - ballRadius) {
    if (x > paddleX && x < paddleX + paddleWidth) dy = -dy;
    else {
      lives--;
      if (!lives) {
        storeScores(score);
        alert("💀 Game Over!");
        resetGame();
      } else {
        isBallMoving = false;
        x = canvas.width / 2;
        y = canvas.height - 20;
      }
    }
  }

  if (rightPressed && paddleX < canvas.width - paddleWidth) paddleX += 5;
  if (leftPressed && paddleX > 0) paddleX -= 5;

  requestAnimationFrame(draw);
}

// Score storage
function storeScores(currentScore) {
  localStorage.setItem("lastScore", currentScore);
  const highScore = localStorage.getItem("highScore") || 0;
  if (currentScore > highScore) {
    localStorage.setItem("highScore", currentScore);
  }
}

// Load stored scores
function loadScores() {
  lastScoreEl.textContent = localStorage.getItem("lastScore") || 0;
  highScoreEl.textContent = localStorage.getItem("highScore") || 0;
}

// Reset
function resetGame() {
  canvas.style.display = "none";
  startScreen.style.display = "block";
  loadScores();
}

startBtn.onclick = () => {
  difficulty = difficultySelect.value;
  startScreen.style.display = "none";
  canvas.style.display = "block";
  initGame();
  draw();
};

loadScores();
