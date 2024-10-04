const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const menu = document.getElementById('menu');
const gameOverScreen = document.getElementById('game-over');
const winnerMessage = document.getElementById('winner-message');
const restartDiv = document.getElementById('restart');

let paddleWidth = 10, paddleHeight = 100;
let paddle1Y = canvas.height / 2 - paddleHeight / 2;
let paddle2Y = canvas.height / 2 - paddleHeight / 2;
let ballX = canvas.width / 2, ballY = canvas.height / 2;
let ballSpeedX = 4, ballSpeedY = 2;
const paddleSpeed = 6;
let difficultyMultiplier = 1;
const maxScore = 5;

let score1 = 0;
let score2 = 0;
let paddle1Direction = 0;

const paddleHitSound = new Audio('paddle_hit.mp3');
const wallHitSound = new Audio('wall_hit.mp3');
const scoreSound = new Audio('score.mp3');

document.addEventListener('keydown', (event) => {
    if (event.key === 'w' || event.key === 'W') {
        paddle1Direction = -1;
    } else if (event.key === 's' || event.key === 'S') {
        paddle1Direction = 1;
    }
});

document.addEventListener('keyup', (event) => {
    if (event.key === 'w' || event.key === 'W' || event.key === 's' || event.key === 'S') {
        paddle1Direction = 0;
    }
});

function startGame(difficulty) {
    difficultyMultiplier = difficulty;
    menu.style.display = 'none';
    canvas.style.display = 'block';
    restartDiv.style.display = 'block';
    
    // Dodanie obsługi dotyku
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    
    resetGame();
    gameLoop();
}

function resetGame() {
    score1 = 0;
    score2 = 0;
    paddle1Y = canvas.height / 2 - paddleHeight / 2;
    paddle2Y = canvas.height / 2 - paddleHeight / 2;
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    gameOverScreen.style.display = 'none';
    canvas.style.display = 'block';
    gameLoop();
}

function restartGame() {
    resetGame();
    gameLoop();
}

function endGame() {
    canvas.style.display = 'none';
    gameOverScreen.style.display = 'block';
    
    // Usunięcie obsługi dotyku
    canvas.removeEventListener('touchstart', handleTouchStart);
    canvas.removeEventListener('touchmove', handleTouchMove);
}

function drawRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

function drawBall(x, y, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

function drawScore() {
    const player1Name = document.getElementById('player1-name').value;
    const player2Name = document.getElementById('player2-name').value;

    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.fillText(`${player1Name}: ${score1}`, 50, 30);
    ctx.fillText(`${player2Name}: ${score2}`, canvas.width - 150, 30);
}

function checkGameOver() {
    if (score1 >= maxScore) {
        winnerMessage.innerText = document.getElementById('player1-name').value + " wygrywa!";
        endGame();
    } else if (score2 >= maxScore) {
        winnerMessage.innerText = document.getElementById('player2-name').value + " wygrywa!";
        endGame();
    }
}

// Obsługa dotyku
let touchStartY = 0;
function handleTouchStart(event) {
    touchStartY = event.touches[0].clientY;
}

function handleTouchMove(event) {
    event.preventDefault();
    const touchY = event.touches[0].clientY;
    const deltaY = touchY - touchStartY;
    touchStartY = touchY;
    paddle1Y += deltaY;
    if (paddle1Y < 0) {
        paddle1Y = 0;
    } else if (paddle1Y + paddleHeight > canvas.height) {
        paddle1Y = canvas.height - paddleHeight;
    }
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    paddle1Y += paddleSpeed * paddle1Direction;

    if (paddle1Y < 0) {
        paddle1Y = 0;
    } else if (paddle1Y + paddleHeight > canvas.height) {
        paddle1Y = canvas.height - paddleHeight;
    }

    if (ballY > paddle2Y + paddleHeight / 2) {
        paddle2Y += Math.min(paddleSpeed * difficultyMultiplier, Math.abs(ballY - paddle2Y)) / 1.5;
    } else {
        paddle2Y -= Math.min(paddleSpeed * difficultyMultiplier, Math.abs(ballY - paddle2Y)) / 1.5;
    }

    if (paddle2Y < 0) {
        paddle2Y = 0;
    } else if (paddle2Y + paddleHeight > canvas.height) {
        paddle2Y = canvas.height - paddleHeight;
    }

    drawRect(0, paddle1Y, paddleWidth, paddleHeight, 'white');
    drawRect(canvas.width - paddleWidth, paddle2Y, paddleWidth, paddleHeight, 'white');
    drawBall(ballX, ballY, 10, 'white');
    drawScore();

    ballX += ballSpeedX;
    ballY += ballSpeedY;

    if (ballY < 0 || ballY > canvas.height) {
        wallHitSound.play();
        ballSpeedY = -ballSpeedY;
    }

    if (ballX < paddleWidth && ballY > paddle1Y && ballY < paddle1Y + paddleHeight) {
        paddleHitSound.play();
        ballSpeedX = -ballSpeedX;
    }

    if (ballX > canvas.width - paddleWidth && ballY > paddle2Y && ballY < paddle2Y + paddleHeight) {
        paddleHitSound.play();
        ballSpeedX = -ballSpeedX;
    }

    if (ballX < 0) {
        score2++;
        scoreSound.play();
        resetBall();
    } else if (ballX > canvas.width) {
        score1++;
        scoreSound.play();
        resetBall();
    }

    checkGameOver();

    if (canvas.style.display === 'block') {
        requestAnimationFrame(gameLoop);
    }
}

function resetBall() {
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    ballSpeedX = -ballSpeedX;
    ballSpeedY = 2 * (Math.random() < 0.5 ? 1 : -1);
}
