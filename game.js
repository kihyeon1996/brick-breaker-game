const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 게임 변수
const ballRadius = 8;

function createBall(x, y, dx, dy) {
    return { x, y, dx, dy };
}

let balls = [createBall(canvas.width / 2, canvas.height - 30, 2, -2)];

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

function collisionDetection(ball) {
    for(let c = 0; c < brickColumnCount; c++) {
        for(let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if(b.status === 1) {
                if(ball.x > b.x && ball.x < b.x + brickWidth && ball.y > b.y && ball.y < b.y + brickHeight) {
                    ball.dy = -ball.dy;
                    b.status = 0;
                    score++;
                    // 공 추가: 랜덤 방향
                    const angle = Math.random() * Math.PI * 2;
                    const speed = Math.sqrt(ball.dx*ball.dx + ball.dy*ball.dy);
                    balls.push(createBall(ball.x, ball.y, speed * Math.cos(angle), speed * Math.sin(angle)));
                    if(score === brickRowCount * brickColumnCount) {
                        alert('축하합니다! 모든 벽돌을 깼어요!');
                        document.location.reload();
                    }
                }
            }
        }
    }
}

function drawBall(ball) {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2);
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
    ctx.fillStyle = '#ffeb3b';
    ctx.fillText('공: ' + balls.length, 180, 20);
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
    drawPaddle();
    drawScore();
    drawLives();
    // 각 공 처리
    for(let i = balls.length - 1; i >= 0; i--) {
        let ball = balls[i];
        drawBall(ball);
        collisionDetection(ball);

        // 벽 충돌
        if(ball.x + ball.dx > canvas.width - ballRadius || ball.x + ball.dx < ballRadius) {
            ball.dx = -ball.dx;
        }
        if(ball.y + ball.dy < ballRadius) {
            ball.dy = -ball.dy;
        } else if(ball.y + ball.dy > canvas.height - ballRadius) {
            if(ball.x > paddleX && ball.x < paddleX + paddleWidth) {
                // 패들 중앙 기준 위치
                let hitPoint = (ball.x - (paddleX + paddleWidth / 2)) / (paddleWidth / 2);
                let speed = Math.sqrt(ball.dx*ball.dx + ball.dy*ball.dy);
                let angle = hitPoint * Math.PI / 3; // 최대 60도
                ball.dx = speed * Math.sin(angle);
                ball.dy = -Math.abs(speed * Math.cos(angle));
                if(rightPressed) ball.dx += 1;
                if(leftPressed) ball.dx -= 1;
            } else {
                // 공 삭제
                balls.splice(i, 1);
                if(balls.length === 0) {
                    lives--;
                    if(!lives) {
                        alert('게임 오버!');
                        document.location.reload();
                    } else {
                        balls = [createBall(canvas.width / 2, canvas.height - 30, 2, -2)];
                        paddleX = (canvas.width - paddleWidth) / 2;
                    }
                }
                continue;
            }
        }
        // 패들 이동 (auto 모드)
        if(autoMode) {
            let target = ball.x - paddleWidth/2;
            let diff = target - paddleX;
            if(Math.abs(diff) > 4) {
                paddleX += diff > 0 ? 7 : -7;
            } else {
                paddleX = target;
            }
            if(paddleX < 0) paddleX = 0;
            if(paddleX > canvas.width - paddleWidth) paddleX = canvas.width - paddleWidth;
        }
        ball.x += ball.dx;
        ball.y += ball.dy;
    }
    // 수동 패들 이동
    if(!autoMode) {
        if(rightPressed && paddleX < canvas.width - paddleWidth) {
            paddleX += 7;
        } else if(leftPressed && paddleX > 0) {
            paddleX -= 7;
        }
    }
    requestAnimationFrame(draw);
}

drawStartScreen();
