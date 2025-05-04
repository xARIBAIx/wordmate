// 配置参数
const ROWS = 10;
const COLS = 10;
const questions = [
  { 
      word: 'camera',
      images: ['camera.png', 'camera2.png', 'camera3.png']
  },
  {
      word: 'shuttlecock',
      images: ['shuttlecock.png', 'shuttlecock2.png', 'shuttlecock3.png']
  },
  {
      word: 'eagle',
      images: ['eagle.png', 'eagle2.png', 'eagle3.png']
  },
  {
    word: 'glacier',
    images: ['glacier.png', 'glacier2.png', 'glacier3.png']
  },
  {
    word: 'penguin',
    images: ['penguin.png', 'penguin2.png', 'penguin3.png']
  },
  {
    word: 'whale',
    images: ['whale.png', 'whale2.png', 'whale3.png']
  }
];
let currentQuestionIndex = 0;
let correctAnswers = 0;
let selectedCells = [];
let gameBoard = [];
let startPosition = { row: -1, col: -1 };
// 新增提示状态管理
let hintState = 0; // 0:无提示 1:显示所有首字母 2:显示正确首字母
let wrongAnswers = []; // 存储错题
let isRedoing = false; // 是否处于重做模式
// 新增全局变量
let originalTotal = 6; // 原始题目总数
let redoTotal = 0;    // 复现题目总数
let originalCorrect = 0; // 原始正确数
let redoCorrect = 0;     // 复现正确数

function handleTips() {
  hintState = (hintState + 1) % 3;
  updateHints();
}

function updateHints() {
  document.querySelectorAll('.cell').forEach(cell => {
    cell.classList.remove('hint-all', 'hint-correct');
    
    const isFirstLetter = gameBoard[cell.dataset.row][cell.dataset.col] === TARGET_WORD[0];
    const isStartCell = cell.dataset.row == startPosition.row && cell.dataset.col == startPosition.col;

    if (hintState === 1 && isFirstLetter) {
        cell.classList.add('hint-all');
    } 
    if (hintState === 2 && isStartCell) {
        cell.classList.add('hint-correct');
    }
});
}

// 初始化游戏
function initGame() {
  TARGET_WORD = questions[currentQuestionIndex].word;
  generateBoard();
  renderBoard();
  hintState = 0;
  updateHints();
  
  // 修复图片路径逻辑
  const currentImage = isRedoing 
      ? `images/${wrongAnswers[0].images[0]}` 
      : `images/${questions[currentQuestionIndex].images[0]}`;
      
  document.getElementById('target-image').src = currentImage;
  document.getElementById('target-image').style.display = 'block';
  }

// 修改后的 generateBoard 函数
function generateBoard() {
    
  // 初始化随机字母
    gameBoard = Array.from({ length: ROWS }, () =>
      Array.from({ length: COLS }, () =>
        String.fromCharCode(97 + Math.floor(Math.random() * 26))
      )
    );
  
    // 生成随机起始点
    let currentRow = Math.floor(Math.random() * ROWS);
    let currentCol = Math.floor(Math.random() * COLS);
    let remainingLetters = TARGET_WORD.split('');
    let currentDirection = Math.random() > 0.5 ? 'horizontal' : 'vertical';
    let turnsLeft = 3; // 最大允许三次转折
  
    // 记录起始位置并插入第一个字母
    startPosition = { row: currentRow, col: currentCol };
    gameBoard[currentRow][currentCol] = remainingLetters.shift();
  
    // 插入剩余字母（强制至少一次转折）
    let hasTurned = false;
    while (remainingLetters.length > 0) {
      // 保存当前位置
      const prevRow = currentRow;
      const prevCol = currentCol;
  
      // 尝试移动
      if (currentDirection === 'horizontal') {
        currentCol += 1;
      } else {
        currentRow += 1;
      }
  
      // 边界检查和转折处理
      if (currentRow >= ROWS || currentCol >= COLS) {
        if (turnsLeft > 0) {
          currentDirection = currentDirection === 'horizontal' ? 'vertical' : 'horizontal';
          turnsLeft--;
          hasTurned = true;
          currentRow = prevRow;
          currentCol = prevCol;
          continue;
        } else {
          // 回退并重新生成路径
          return generateBoard();
        }
      }
  
      // 随机转折逻辑（确保至少一次转折）
      if (!hasTurned && remainingLetters.length > 1 && Math.random() < 0.5 && turnsLeft > 0) {
        currentDirection = currentDirection === 'horizontal' ? 'vertical' : 'horizontal';
        turnsLeft--;
        hasTurned = true;
      }
  
      gameBoard[currentRow][currentCol] = remainingLetters.shift();
    }
  
    // 最终验证转折次数
    if (!hasTurned) return generateBoard();
  }


// 修改renderBoard函数（移除起始点标记）
function renderBoard() {
  const board = document.getElementById('game-board');
  board.innerHTML = '';

  gameBoard.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
          const cellDiv = document.createElement('div');
          cellDiv.className = 'cell';
          cellDiv.textContent = cell.toUpperCase();
          cellDiv.dataset.row = rowIndex;
          cellDiv.dataset.col = colIndex;

          // 移除起始点标记（由提示功能控制显示）
          cellDiv.addEventListener('click', handleCellClick);
          board.appendChild(cellDiv);
      });
  });
}

// 其他函数保持不变
function handleCellClick(event) {
    const cell = event.target;
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);

    if (isValidSelection(row, col)) {
        cell.classList.add('selected');
        selectedCells.push({ row, col });

        if (selectedCells.length === TARGET_WORD.length) {
            checkAnswer();
        }
    }
}

function isValidSelection(row, col) {
    if (selectedCells.length === 0) return true;

    const last = selectedCells[selectedCells.length - 1];
    return (
        (Math.abs(row - last.row) === 1 && col === last.col) ||
        (Math.abs(col - last.col) === 1 && row === last.row)
    );
}


function checkAnswer() {
  const selectedWord = selectedCells
  .map(({ row, col }) => gameBoard[row][col])
  .join('')
  .toLowerCase();

// 判断是否处于复现模式
const isCorrect = selectedWord === TARGET_WORD;
if (isRedoing) {
  redoTotal++;
  if (isCorrect) redoCorrect++;
} else {
  originalCorrect += isCorrect ? 1 : 0;
}

// 错误处理逻辑（修改部分）
if (!isCorrect && !isRedoing) {
  wrongAnswers.push({
      word: TARGET_WORD,
      images: questions.find(q => q.word === TARGET_WORD).images,
      attempts: 0
  });
}

    // 创建自动消失的弹窗
    const popup = document.createElement('div');
    popup.className = `auto-popup ${selectedWord === TARGET_WORD ? 'correct' : 'error'}`;
    
    if (selectedWord === TARGET_WORD) {
        correctAnswers++;
        popup.innerHTML = `
            <h3>${currentQuestionIndex < questions.length-1 ? '正确！' : '最终正确！'}</h3>
            <p>${getProgressText()}</p >
        `;
        selectedCells.forEach(({ row, col }) => {
            document.querySelector(`[data-row="${row}"][data-col="${col}"]`).classList.add('correct');
        });
    } else {
        popup.innerHTML = `
            <h3>错误</h3>
            <p>${getProgressText()}</p >
        `;
    }

    document.body.appendChild(popup);
    
    // 自动跳转逻辑
    setTimeout(() => {
        popup.remove();
        if (currentQuestionIndex < questions.length - 1) {
            goToNextQuestion();
        } else {
            showAccuracyPopup();
        }
    }, 1500); // 1.5秒后自动跳转
}
  
  
  function goToNextQuestion() {
    currentQuestionIndex++;
    const nextButton = document.getElementById('next-btn');
    if (nextButton) nextButton.remove();
  
    if (currentQuestionIndex < questions.length) {
      selectedCells = [];
      clearSelection();
      initGame();
    } else {
      showAccuracyPopup();
    }
  }
  
  function showAccuracyPopup() {
    if (wrongAnswers.length > 0 && !isRedoing) {
      isRedoing = true;
      return startRedoMode();
  }
  const totalQuestions = originalTotal + redoTotal;
  const totalCorrect = originalCorrect + redoCorrect;
  const accuracy = ((totalCorrect / totalQuestions) * 100).toFixed(1);

  const popup = document.createElement('div');
  popup.id = 'accuracy-popup';
  popup.innerHTML = `
      <div class="popup-content">
          <h2>游戏完成！正确率：${accuracy}%</h2>
          <p>总题数：${totalQuestions}（原始 ${originalTotal} + 复现 ${redoTotal}）</p >
          <button onclick="location.reload()">再玩一次</button>
          <button onclick="window.location.href='final.html'">结束游戏</button>
      </div>
  `;
  document.body.appendChild(popup);
}
  
// 重做游戏逻辑
  function startRedoMode() {
    if (wrongAnswers.length === 0) {
      return showAccuracyPopup();
  }

  const currentWrong = wrongAnswers[0];
  TARGET_WORD = currentWrong.word; // 确保单词同步更新
  
  // 使用当前错题的图片
  const imgIndex = currentWrong.attempts % currentWrong.images.length;
  document.getElementById('target-image').src = 
      `images/${currentWrong.images[imgIndex]}`;

  // 重置游戏状态
  selectedCells = [];
  generateBoard();
  renderBoard();
}

  // 修复清除选择的语法错误
  function clearSelection() {
    selectedCells = [];
    document.querySelectorAll('.cell').forEach(cell => {
      cell.classList.remove('selected');
    });
  }
  
  // 启动游戏
  initGame();

  // 进度提示文本
function getProgressText() {
    if (currentQuestionIndex < questions.length - 1) {
        return "即将进入下一题...";
    }
    return "正在生成最终结果...";
}

// 修改后的跳转函数
function goToNextQuestion() {
    currentQuestionIndex++;
    selectedCells = [];
    clearSelection();
    initGame(); // 重新初始化游戏
}