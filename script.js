const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let player, obstacles, trail;
let playing = false;
let holding = false;
let speed, size, difficulty;
let bgColor;

const startBtn = document.getElementById("startBtn");

startBtn.onclick = startGame;

document.addEventListener("mousedown", () => holding = true);
document.addEventListener("mouseup", () => holding = false);

function randomColor() {
  return `hsl(${Math.random()*360}, 40%, 10%)`;
}

function startGame() {
  speed = Number(document.getElementById("speed").value);
  size = Number(document.getElementById("size").value);
  difficulty = Number(document.getElementById("difficulty").value);

  player = {
    x: 120,
    y: canvas.height / 2,
    vel: 0
  };

  obstacles = [];
  trail = [];
  playing = true;
  bgColor = randomColor();

  generateLevel();
}

function generateLevel() {
  obstacles = [];

  let gap = 220 - difficulty * 40;
  let spacing = 300 - difficulty * 50;

  for (let i = 400; i < 15000; i += spacing) {
    let gapY = Math.random() * (canvas.height - gap);

    obstacles.push({
      x: i,
      width: 60,
      gapY: gapY,
      gapH: gap
    });
  }
}

function update() {
  if (!playing) return;

  player.vel = holding ? -speed : speed;
  player.y += player.vel;

  // Trail effect
  trail.push({ x: player.x, y: player.y });
  if (trail.length > 25) trail.shift();

  // Collision detection
  for (let obs of obstacles) {
    if (
      player.x + size > obs.x &&
      player.x - size < obs.x + obs.width
    ) {
      if (player.y < obs.gapY || player.y > obs.gapY + obs.gapH) {
        playing = false;
      }
    }
  }

  if (player.y < 0 || player.y > canvas.height) {
    playing = false;
  }

  // Move obstacles
  for (let obs of obstacles) {
    obs.x -= speed;
  }

  // New level when finished
  if (obstacles.length && obstacles[obstacles.length - 1].x < 0) {
    bgColor = randomColor();
    generateLevel();
  }
}

function draw() {
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Obstacles
  ctx.fillStyle = "red";
  for (let obs of obstacles) {
    ctx.fillRect(obs.x, 0, obs.width, obs.gapY);
    ctx.fillRect(obs.x, obs.gapY + obs.gapH, obs.width, canvas.height);
  }

  // Wave trail
  ctx.strokeStyle = "cyan";
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i < trail.length; i++) {
    ctx.lineTo(trail[i].x, trail[i].y);
  }
  ctx.stroke();

  // Player
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(player.x, player.y, size, 0, Math.PI * 2);
  ctx.fill();

  // Game Over text
  if (!playing) {
    ctx.fillStyle = "white";
    ctx.font = "50px Arial";
    ctx.fillText("Game Over", canvas.width / 2 - 140, canvas.height / 2);
  }
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();
