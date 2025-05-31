const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 게임 변수
const ballRadius = 8;
let x = canvas.width / 2;
let y = canvas.height - 30;
let dx = 2;
let dy = -2;

const paddleHeight = 10;
const paddleWidth = 75;
let paddleX = (canvas.width - paddleWidth) / 2;

let rightPressed = false;
let leftPressed = false;
let autoMode = false;

const brickRowCount = 5;
const brickColumnCount = 7;
const brickWidth = 55;
const brickHeight = 20;
const brickPadding = 8;
const brickOffsetTop = 30;
const brickOffsetLeft = 25;

let score = 0;
let lives = 3;

let gameStarted = false;

// 벽돌 배열 생성
const bricks = [];
for(let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for(let r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
}

// 이벤트 리스너

document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('keyup', keyUpHandler, false);
document.addEventListener('mousemove', mouseMoveHandler, false);
canvas.addEventListener('click', startGame, false);

function keyDownHandler(e) {
    if(e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = true;
    } else if(e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = true;
    } else if(e.key === 'a' || e.key === 'A') {
        autoMode = !autoMode;
    }
}

function keyUpHandler(e) {
    if(e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = false;
    } else if(e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = false;
    }
}

function mouseMoveHandler(e) {
    if(autoMode) return; // 오토모드일 때는 마우스 무시
    const relativeX = e.clientX - canvas.getBoundingClientRect().left;
    if(relativeX > 0 && relativeX < canvas.width) {
        paddleX = relativeX - paddleWidth / 2;
    }
}

function collisionDetection() {
    for(let c = 0; c < brickColumnCount; c++) {
        for(let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if(b.status === 1) {
                if(x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
                    dy = -dy;
                    b.status = 0;
                    score++;
                    if(score === brickRowCount * brickColumnCount) {
                        alert('축하합니다! 모든 벽돌을 깼어요!');
                        document.location.reload();
                    }
                }
            }
        }
    }
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#ffeb3b';
    ctx.fill();
    ctx.closePath();
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = autoMode ? '#f44336' : '#2196f3';
    ctx.fill();
    ctx.closePath();
}

function drawBricks() {
    for(let c = 0; c < brickColumnCount; c++) {
        for(let r = 0; r < brickRowCount; r++) {
            if(bricks[c][r].status === 1) {
                const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = '#4caf50';
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function drawScore() {
    ctx.font = '16px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText('점수: ' + score, 8, 20);
    if(autoMode) {
        ctx.fillStyle = '#f44336';
        ctx.fillText('AUTO', 100, 20);
    }
}

function drawLives() {
    ctx.font = '16px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText('목숨: ' + lives, canvas.width - 70, 20);
}

function drawStartScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '28px Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText('벽돌깨기 게임', canvas.width/2, canvas.height/2 - 30);
    ctx.font = '20px Arial';
    ctx.fillText('클릭해서 시작', canvas.width/2, canvas.height/2 + 20);
    ctx.font = '16px Arial';
    ctx.fillStyle = '#f44336';
    ctx.fillText('A키로 AUTO 모드 토글', canvas.width/2, canvas.height/2 + 60);
    ctx.textAlign = 'start';
}

function startGame() {
    if (!gameStarted) {
        gameStarted = true;
        draw();
    }
}

function draw() {
    if (!gameStarted) {
        drawStartScreen();
        return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    drawLives();
    collisionDetection();

    // 벽 충돌
    if(x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx;
    }
    if(y + dy < ballRadius) {
        dy = -dy;
    } else if(y + dy > canvas.height - ballRadius) {
        if(x > paddleX && x < paddleX + paddleWidth) {
            // 패들 중앙 기준 위치
            let hitPoint = (x - (paddleX + paddleWidth / 2)) / (paddleWidth / 2);
            let speed = Math.sqrt(dx*dx + dy*dy);
            let angle = hitPoint * Math.PI / 3; // 최대 60도
            dx = speed * Math.sin(angle);
            dy = -Math.abs(speed * Math.cos(angle));
            // 패들이 움직이고 있으면 추가 가속도
            if(rightPressed) dx += 1;
            if(leftPressed) dx -= 1;
        } else {
            lives--;
            if(!lives) {
                alert('게임 오버!');
                document.location.reload();
            } else {
                x = canvas.width / 2;
                y = canvas.height - 30;
                dx = 2;
                dy = -2;
                paddleX = (canvas.width - paddleWidth) / 2;
            }
        }
    }

    // 패들 이동
    if(autoMode) {
        // 패들이 공을 따라가도록 자동 이동
        let target = x - paddleWidth/2;
        let diff = target - paddleX;
        if(Math.abs(diff) > 4) {
            paddleX += diff > 0 ? 7 : -7;
        } else {
            paddleX = target;
        }
        // 화면 경계 체크
        if(paddleX < 0) paddleX = 0;
        if(paddleX > canvas.width - paddleWidth) paddleX = canvas.width - paddleWidth;
    } else {
        if(rightPressed && paddleX < canvas.width - paddleWidth) {
            paddleX += 7;
        } else if(leftPressed && paddleX > 0) {
            paddleX -= 7;
        }
    }

    x += dx;
    y += dy;
    requestAnimationFrame(draw);
}

drawStartScreen();
