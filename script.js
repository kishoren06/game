// Game variables
const gameArea = document.getElementById('gameArea');
const bird = document.getElementById('bird');
const gameInfo = document.getElementById('gameInfo');
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('highScore');
const gameTitle = document.getElementById('gameTitle');
const gameMessage = document.getElementById('gameMessage');

let birdY = 250;
let birdVelocity = 0;
let gravity = 0.6;
let gameRunning = false;
let gameOver = false;
let score = 0;
let highScore = localStorage.getItem('flappyBirdHighScore') || 0;
let pipes = [];
let pipeCounter = 0;

const BIRD_SIZE = 40;
const GAME_HEIGHT = 500;
const PIPE_WIDTH = 60;
const PIPE_GAP = 120;
const PIPE_DISTANCE = 200;

// Initialize high score display
highScoreDisplay.textContent = highScore;

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        if (!gameRunning && !gameOver) {
            startGame();
        } else if (gameRunning) {
            birdVelocity = -12;
        }
    }
});

// Mouse/Touch controls
gameArea.addEventListener('click', () => {
    if (!gameRunning && !gameOver) {
        startGame();
    } else if (gameRunning) {
        birdVelocity = -12;
    }
});

function startGame() {
    if (gameRunning) return;
    gameRunning = true;
    gameOver = false;
    gameInfo.classList.add('hidden');
    gameLoop();
}

function restartGame() {
    // Reset variables
    birdY = 250;
    birdVelocity = 0;
    score = 0;
    scoreDisplay.textContent = score;
    pipes = [];
    pipeCounter = 0;
    gameRunning = false;
    gameOver = false;
    
    // Clear pipes
    document.querySelectorAll('.pipe').forEach(pipe => pipe.remove());
    
    // Show game info
    gameInfo.classList.remove('hidden');
    gameInfo.classList.remove('game-over');
    gameTitle.textContent = 'Press SPACE to Start';
    gameMessage.textContent = 'Navigate the bird through the pipes!';
    
    // Reset bird position
    bird.style.top = birdY + 'px';
}

function gameLoop() {
    if (!gameRunning) return;
    
    // Apply gravity
    birdVelocity += gravity;
    birdY += birdVelocity;
    
    // Update bird position
    bird.style.top = birdY + 'px';
    
    // Check collision with ground/ceiling
    if (birdY + BIRD_SIZE > GAME_HEIGHT || birdY < 0) {
        endGame();
        return;
    }
    
    // Generate pipes
    pipeCounter++;
    if (pipeCounter > 100) {
        generatePipe();
        pipeCounter = 0;
    }
    
    // Update and check pipes
    updatePipes();
    
    requestAnimationFrame(gameLoop);
}

function generatePipe() {
    const randomGap = Math.floor(Math.random() * (GAME_HEIGHT - PIPE_GAP - 100)) + 50;
    
    // Top pipe
    const topPipe = document.createElement('div');
    topPipe.className = 'pipe pipe-top';
    topPipe.style.height = randomGap + 'px';
    topPipe.style.width = PIPE_WIDTH + 'px';
    topPipe.style.left = gameArea.offsetWidth + 'px';
    gameArea.appendChild(topPipe);
    
    // Bottom pipe
    const bottomPipe = document.createElement('div');
    bottomPipe.className = 'pipe pipe-bottom';
    bottomPipe.style.height = (GAME_HEIGHT - randomGap - PIPE_GAP) + 'px';
    bottomPipe.style.width = PIPE_WIDTH + 'px';
    bottomPipe.style.left = gameArea.offsetWidth + 'px';
    gameArea.appendChild(bottomPipe);
    
    pipes.push({
        x: gameArea.offsetWidth,
        gapTop: randomGap,
        gapBottom: randomGap + PIPE_GAP,
        scored: false
    });
}

function updatePipes() {
    const allPipes = document.querySelectorAll('.pipe');
    
    for (let i = pipes.length - 1; i >= 0; i--) {
        pipes[i].x -= 5;
        
        // Update visual position
        const pipePair = document.querySelectorAll('.pipe');
        if (allPipes[i * 2]) {
            allPipes[i * 2].style.left = pipes[i].x + 'px';
        }
        if (allPipes[i * 2 + 1]) {
            allPipes[i * 2 + 1].style.left = pipes[i].x + 'px';
        }
        
        // Check collision
        if (checkCollision(pipes[i])) {
            endGame();
            return;
        }
        
        // Check if bird passed pipe
        if (!pipes[i].scored && pipes[i].x + PIPE_WIDTH < 100) {
            pipes[i].scored = true;
            score++;
            scoreDisplay.textContent = score;
        }
        
        // Remove off-screen pipes
        if (pipes[i].x + PIPE_WIDTH < 0) {
            pipes.splice(i, 1);
            allPipes[i * 2]?.remove();
            allPipes[i * 2 + 1]?.remove();
        }
    }
}

function checkCollision(pipe) {
    const birdX = 100;
    const birdRight = birdX + BIRD_SIZE;
    const birdBottom = birdY + BIRD_SIZE;
    
    // Check if bird is in pipe's horizontal range
    if (birdX < pipe.x + PIPE_WIDTH && birdRight > pipe.x) {
        // Check if bird hits top or bottom pipe
        if (birdY < pipe.gapTop || birdBottom > pipe.gapBottom) {
            return true;
        }
    }
    
    return false;
}

function endGame() {
    gameRunning = false;
    gameOver = true;
    
    // Update high score
    if (score > highScore) {
        highScore = score;
        highScoreDisplay.textContent = highScore;
        localStorage.setItem('flappyBirdHighScore', highScore);
    }
    
    // Show game over screen
    gameInfo.classList.remove('hidden');
    gameInfo.classList.add('game-over');
    gameTitle.textContent = 'Game Over!';
    gameMessage.textContent = `Final Score: ${score} | High Score: ${highScore}`;
}