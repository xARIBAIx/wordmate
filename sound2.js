const allWords = ['glacier', 'eagle', 'camera']; // 更新后的单词列表
let correctOrder = [];
let currentOrder = [];
let totalAttempts = 0;
let correctAttempts = 0;
// 在全局变量中添加
//let nextQuestionUrl = 'home.html';

document.addEventListener('DOMContentLoaded', () => {
    correctOrder = shuffleArray([...allWords]);
    console.log('当前正确顺序：', correctOrder);
    shuffleImages();

    // 使用免费音频资源URL（请替换为实际音频地址）
    const sounds = {
        glacier: new Audio('https://ssl.gstatic.com/dictionary/static/sounds/20200429/glacier--_gb_1.mp3'),
        eagle: new Audio('https://ssl.gstatic.com/dictionary/static/sounds/20200429/eagle--_gb_1.mp3'),
        camera: new Audio('https://ssl.gstatic.com/dictionary/static/sounds/20200429/camera--_gb_1.mp3')
    };

    
    // 其余原有初始化代码保持不变...
    //const checkBtn = document.getElementById('check');
    const speaker = document.getElementById('speaker');
    const dropZones = document.querySelectorAll('.drop-zone');
    const draggables = document.querySelectorAll('.draggable');
    // 获取下一题按钮引用
    const nextBtn = document.getElementById('next-btn');
    // 添加点击事件监听
    nextBtn.addEventListener('click', () => {
        // 简单跳转
        window.location.href = 'wordpic.html'; });

// 在 sounds 定义之后添加这个 playSound 函数
const playSound = (audioElement) => {
    return new Promise(resolve => {
      audioElement.play().then(() => {
        audioElement.addEventListener('ended', resolve);
      }).catch(error => {
        console.error('播放失败:', error);
        resolve(); // 即使出错也继续执行
      });
    });
  };
  
  // 修改 speaker 事件监听器
  speaker.addEventListener('click', async () => {
    try {
      // 先预加载所有音频
      await Promise.all(Object.values(sounds).map(audio => audio.load()));
      
      // 按顺序播放
      for (const word of correctOrder) {
        sounds[word].currentTime = 0; // 重置播放进度
        await playSound(sounds[word]);
      }
    } catch (error) {
      console.error('音频播放错误:', error);
      alert('无法播放音频，请检查网络连接或刷新页面');
    }
  });


    // 拖放功能
    draggables.forEach(draggable => {
        draggable.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', draggable.dataset.word);
        });
    });

    dropZones.forEach(zone => {
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            const word = e.dataTransfer.getData('text/plain');
            const img = document.querySelector(`[data-word="${word}"]`);
            
            // 清除原有位置
            if (img.parentElement.classList.contains('drop-zone')) {
                img.parentElement.innerHTML = '';
            }
            
            zone.innerHTML = '';
            zone.appendChild(img.cloneNode(true));
            updateCurrentOrder();
        });
    });

    // 检查答案
    /*checkBtn.addEventListener('click', () => {
        const resultDiv = document.getElementById('result');
        const scoreDiv = document.getElementById('score');
        
        // 计算正确数量
        const correctCount = currentOrder.reduce((acc, curr, index) => {
            return curr === correctOrder[index] ? acc + 1 : acc;
        }, 0);

        // 计算正确率
        const accuracy = (correctCount / correctOrder.length * 100).toFixed(1);
        totalAttempts++;
        if (correctCount === correctOrder.length) {
            correctAttempts++;
        }

        // 更新显示
        resultDiv.innerHTML = `${correctCount === 3 ? '✅ 正确！' : '❌ 再试一次'}<br>
                             正确数量：${correctCount}/3`;
        scoreDiv.textContent = `正确率：${accuracy}% | 尝试次数：${totalAttempts} | 成功次数：${correctAttempts}`;
    });*/
});

// 图片随机排列函数
function shuffleImages() {
    const container = document.querySelector('.images');
    const images = Array.from(container.children);
    
      // 三重洗牌 + 每次获取最新子元素
      for (let n = 0; n < 3; n++) { // 改为三重洗牌
        const images = Array.from(container.children); // 每次重新获取最新顺序
        for (let i = images.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            // 添加随机交换方向逻辑
            if (Math.random() > 0.5) {
                container.insertBefore(images[j], images[i]);
            } else {
                container.insertBefore(images[i], images[j]);
            }
        }
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// 修改updateCurrentOrder函数（添加验证逻辑）
function updateCurrentOrder() {
    currentOrder = Array.from(document.querySelectorAll('.drop-zone'))
        .map(zone => zone.firstChild?.dataset.word || '');

    // 当三个位置都填满时自动检查
    if (currentOrder.every(word => word)) {
        // 获取按钮引用
        const nextBtn = document.getElementById('next-btn');
        
        // 验证是否完全正确
        const isPerfect = currentOrder.every((word, index) => 
            word === correctOrder[index]
        );
        
        // 更新按钮状态
        nextBtn.disabled = !isPerfect;

        // 保持原有结果显示逻辑...
        const resultDiv = document.getElementById('result');
        const scoreDiv = document.getElementById('score');
        
        const correctCount = currentOrder.reduce((acc, curr, index) => {
            return curr === correctOrder[index] ? acc + 1 : acc;
        }, 0);

        const accuracy = (correctCount / correctOrder.length * 100).toFixed(1);
        totalAttempts++;
        if (correctCount === correctOrder.length) correctAttempts++;

        resultDiv.innerHTML = `${correctCount === 3 ? '✅ 正确！' : '❌ 顺序错误'}<br>
                             正确数量：${correctCount}/3`;
    }
}

// 添加下一题按钮事件监听
// 修改重启逻辑（在restart事件处理函数中新增）
document.getElementById('restart').addEventListener('click', () => {
    // 新增：禁用下一题按钮
    document.getElementById('next-btn').disabled = true;
    
    // 保持原有重启逻辑...
    correctOrder = shuffleArray([...allWords]);
    console.log('新正确顺序：', correctOrder);

    // 清空所有放置区
    document.querySelectorAll('.drop-zone').forEach(zone => {
        zone.innerHTML = '';
        zone.classList.remove('correct', 'wrong'); // 清除样式
    });
    
    // 重置计分
    totalAttempts = 0;
    correctAttempts = 0;
    
    // 刷新图片排列
    shuffleImages();
    
    // 清空显示结果
    document.getElementById('result').innerHTML = '';
    document.getElementById('score').textContent = '';
    
    // 重置当前顺序
    currentOrder = [];

    shuffleImages(); // 确保每次重新开始都洗牌图片
});