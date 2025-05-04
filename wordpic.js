// 随机打乱数组函数
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
// 游戏配置
const words = ["glacier", "penguin", "whale", "camera", "shuttlecock", "eagle"];
const imageMap = {
    glacier: "images/glacier.png",
    penguin: "images/penguin.png",
    whale: "images/whale.png",
    camera: "images/camera.png",
    shuttlecock: "images/shuttlecock.png",
    eagle: "images/eagle.png",
   
};

let selectedWord = null;
let selectedImage = null;
let score = 0;
let startTime = null;

// 初始化游戏
function initGame() {
  const wordGrid = document.getElementById('word-grid');
  const imageGrid = document.getElementById('image-grid');
  wordGrid.innerHTML = '';
  imageGrid.innerHTML = '';

  startTimer(); // 确保调用计时器

  // 随机打乱单词和图片
  const shuffledWords = shuffleArray([...words]); 
  const shuffledImages = shuffleArray(Object.keys(imageMap));

  // 创建单词卡片（左侧）
  shuffledWords.forEach(word => {
    const wordCard = document.createElement('div');
    wordCard.className = 'card';
    wordCard.textContent = word;
    wordCard.addEventListener('click', () => handleWordClick(word));
    wordGrid.appendChild(wordCard);
  });

  // 创建图片卡片（右侧）
  shuffledImages.forEach(key => {
    const imgCard = document.createElement('div');
    imgCard.className = 'card';
    const img = document.createElement('img');
    img.src = imageMap[key];
    img.alt = key;
    imgCard.appendChild(img);
    imgCard.addEventListener('click', () => handleImageClick(key));
    imageGrid.appendChild(imgCard);
  });

// 独立计时器启动函数
function startTimer() {
    startTime = Date.now(); // 确保每次游戏开始都重新记录时间
  }
}

// 处理单词点击
function handleWordClick(word) {
    selectedWord = word;
    checkMatch();
}

// 处理图片点击
function handleImageClick(imageKey) {
    selectedImage = imageKey;
    checkMatch();
}

// 检查匹配
function checkMatch() {
    if (selectedWord && selectedImage) {
        if (selectedWord === selectedImage) {
            score += 10;
            document.getElementById('score').textContent = `得分: ${score}`;
            // 隐藏匹配成功的卡片
            hideMatchedCards(selectedWord);
        } else {
            // 显示居中弹窗（错误提示）
            showAlert('匹配错误，请重试！');
        }
        // 重置选择
        selectedWord = null;
        selectedImage = null;
    }
}

// 隐藏匹配成功的卡片（留白）
function hideMatchedCards(key) {
    // 处理左侧单词卡片
    const wordCards = document.querySelectorAll('#word-grid .card');
    wordCards.forEach(card => {
      if (card.textContent === key) {
        card.innerHTML = ''; // 清空内容
        card.style.backgroundColor = '#f0f0f0'; // 设为空白背景
        card.style.pointerEvents = 'none'; // 禁止点击
        card.classList.add('matched'); // 标记为已匹配
      }
    });
  
    // 处理右侧图片卡片
    const imageCards = document.querySelectorAll('#image-grid .card');
    imageCards.forEach(card => {
      if (card.querySelector('img')?.alt === key) {
        card.innerHTML = ''; // 清空内容
        card.style.backgroundColor = '#f0f0f0'; // 设为空白背景
        card.style.pointerEvents = 'none'; // 禁止点击
        card.classList.add('matched'); // 标记为已匹配
      }
    });
  
    // 检查是否所有卡片都已匹配
    checkGameComplete();
  }
  
  // 检查游戏是否完成的函数
  function checkGameComplete() {
    const remainingCards = document.querySelectorAll('.card:not(.matched)');
    if (remainingCards.length === 0) {
      endGame();
    }
  }

// 显示自定义弹窗
function showAlert(message, isSuccess = false) {
    const alertDiv = document.getElementById('custom-alert');
    const messageDiv = document.getElementById('alert-message');
    messageDiv.textContent = message;
    alertDiv.classList.remove('hidden');
    
    // 根据成功状态修改背景色
    alertDiv.style.backgroundColor = isSuccess ? 'rgba(144, 238, 144, 0.9)' : 'rgba(0, 0, 0, 0.5)';
  
    setTimeout(() => {
      alertDiv.classList.add('hidden');
    }, isSuccess ? 5000 : 2000); // 成功提示停留5秒
  }

// 结束游戏函数
function endGame() {
  const endTime = Date.now();
  const timeSpent = (endTime - startTime) / 1000;
  const formattedTime = timeSpent.toFixed(1);
  const alertDiv = document.getElementById('custom-alert');
  const alertContent = document.querySelector('.alert-content');
  
  // 清空并设置新内容
  alertContent.innerHTML = `
      <p>恭喜！全部匹配完成！用时：${formattedTime}秒</p>
      <button id="next-level">下一题 ➔</button>
  `;
  
  // 设置样式
  alertDiv.style.backgroundColor = 'rgba(144, 238, 144, 0.9)';
  alertDiv.classList.remove('hidden');

  // 绑定跳转事件
  document.getElementById('next-level').addEventListener('click', () => {
      window.location.href = 'wordmaze.html';
  });
}
  
// 启动游戏
initGame();

// 在 game.js 中绑定事件
document.getElementById('restart').addEventListener('click', () => {
  document.getElementById('custom-alert').classList.add('hidden');
  initGame();
});