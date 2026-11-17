let spriteSheet;
const totalFrames = 8; // 總共有 8 張動作圖

// 角色位置與物理變數
let x, y;
let groundY;       // 地面高度
let speed = 5;     // 移動速度
let vy = 0;        // 垂直速度（用於跳躍）
let gravity = 0.8; // 重力加速度
let jumpForce = -14; // 起跳推力
let isJumping = false;

// 動畫與狀態變數
let currentFrame = 0;
let animTimer = 0;
let framesPerStep = 6; // 控制跑步動畫速度（數字越小越快）
let isMoving = false;
let isAttacking = false;
let attackTimer = 0;
let attackDuration = 15;
let facingDirection = 1; // 1 面向右，-1 面向左

function preload() {
  // 請確認你的圖檔名稱是 all_2.png
  spriteSheet = loadImage('all_2.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // 設定地面位置在畫布中下方（士官長站在這條線上）
  groundY = height / 2 + 120;
  x = width / 2;
  y = groundY;
  
  imageMode(CENTER);
}

function draw() {
  background('#caf0f8');

  // 精確計算每一格在原圖上的寬與高（強制取整數，避免像素累積誤差導致圖片跑掉）
  const srcFrameWidth = floor(spriteSheet.width / totalFrames);
  const srcFrameHeight = spriteSheet.height;

  // 左右去留白邊距設定（把兩側多餘的空白切掉，讓畫面更集中）
  const trimX = 30; 
  const trimY = 5;  
  const actualSrcWidth = srcFrameWidth - (trimX * 2);
  const actualSrcHeight = srcFrameHeight - (trimY * 2);

  // 角色高度設定為畫布高度的 1/3，寬度依照比例自動計算
  const displayHeight = height / 3;
  const ratio = actualSrcWidth / actualSrcHeight;
  const displayWidth = displayHeight * ratio;

  isMoving = false;

  // --- 1. 鍵盤控制（下鍵攻擊、左右移動、上鍵跳躍） ---
  if (keyIsDown(DOWN_ARROW) && attackTimer === 0) {
    isAttacking = true;
    attackTimer = attackDuration;
  } else if (attackTimer === 0) {
    // 左右移動
    if (keyIsDown(RIGHT_ARROW)) {
      x += speed;
      facingDirection = 1;
      isMoving = true;
    }
    if (keyIsDown(LEFT_ARROW)) {
      x -= speed;
      facingDirection = -1;
      isMoving = true;
    }
    
    // 上鍵：起跳（必須在地面上才能跳）
    if (keyIsDown(UP_ARROW) && !isJumping) {
      vy = jumpForce;
      isJumping = true;
    }
  }

  // 攻擊計時器遞減
  if (attackTimer > 0) {
    attackTimer--;
    isAttacking = true;
  } else {
    isAttacking = false;
  }

  // --- 2. 物理重力與平地起落模擬 ---
  if (isJumping) {
    vy += gravity; // 受重力影響速度改變
    y += vy;       // 更新垂直位置

    // 落地偵測：如果掉回地面高度或以下，就停在地面上
    if (y >= groundY) {
      y = groundY;
      vy = 0;
      isJumping = false;
    }
  } else {
    y = groundY; // 確保在地面時穩穩貼齊
  }

  // --- 3. 動畫播放控制 ---
  if (isMoving && !isJumping) {
    // 只有在地面移動時才播放 8 格跑步動畫
    animTimer++;
    if (animTimer >= framesPerStep) {
      currentFrame = (currentFrame + 1) % totalFrames;
      animTimer = 0;
    }
  } else if (isJumping) {
    // 跳躍騰空時固定顯示第 2 格（跳躍動作姿勢）
    currentFrame = 2; 
  } else {
    // 靜止站立時顯示第 0 格
    currentFrame = 0;
    animTimer = 0;
  }

  // 計算原圖精確裁切的起始 X 座標
  const sx = floor(currentFrame * srcFrameWidth) + trimX;
  const sy = trimY;

  // --- 4. 繪製角色與攻擊特效 ---
  push();
  translate(x, y);
  scale(facingDirection, 1); // 左右翻轉

  // 繪製角色本體（以中心點對齊，確保切換影格時絕對不亂跳）
  image(
    spriteSheet,
    -displayWidth / 2, -displayHeight / 2, displayWidth, displayHeight, 
    sx, sy, actualSrcWidth, actualSrcHeight                              
  );

  // 攻擊特效
  if (isAttacking) {
    noStroke();
    fill(255, 60, 60, 190);
    ellipse(displayWidth / 2 + 15, -12, 65, 35);
    fill(255, 220, 0, 220);
    ellipse(displayWidth / 2 + 35, -12, 35, 18);
  }
  pop();

  // 攻擊提示文字
  if (isAttacking) {
    fill(200, 0, 0);
    textSize(22);
    textAlign(CENTER, CENTER);
    text("💥 攻擊！", x, y - (displayHeight / 2) - 20);
  }
}

// 攔截方向鍵事件，防止畫面跟著上下左右捲動
function keyPressed() {
  if ([UP_ARROW, DOWN_ARROW, LEFT_ARROW, RIGHT_ARROW].includes(keyCode)) {
    return false; 
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  groundY = height / 2 + 120;
}