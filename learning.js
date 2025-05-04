// learning.js
let currentGroupIndex = 0;
let learnedWords = new Set();
let wordsData = {};

// 初始化加载
document.addEventListener('DOMContentLoaded', () => {
    loadWordData();
    document.getElementById('wordCard').style.display = 'none';
});

// 加载JSON数据
async function loadWordData() {
    try {
        const response = await fetch('learning.json');
        if (!response.ok) throw new Error('网络响应异常');
        
        wordsData = await response.json();
        console.log('加载的数据:', wordsData); // 添加调试信息
        loadGroup(currentGroupIndex);
    } catch (error) {
        console.error('数据加载失败:', error);
        alert('学习资料加载失败，请刷新重试');
    }
    console.log(wordsData);
}

// 加载当前组内容
function loadGroup(groupIndex) {
    // 切回默认图片
    document.querySelector('.assistant-image').src = 'as.png'; // ✅ 新增

    // 使用可选链操作符 (?.) 防止 undefined 错误
    const group = wordsData.groups?.[groupIndex];
    if (!group) return;

    closeCard();
    // 明确指定 areas 数据源
    const areas = group.areas || []; // 默认空数组
    
    // 生成热区 HTML（已正确使用 areas）
    const areasHTML = areas.map(word => `
        <area shape="${word.shape}" 
              coords="${word.coords.join(',')}" 
              alt="${word.word}" 
              data-word="${word.word}"
              onclick="showWord('${word.word}')"
              onmouseover="showTooltip(event, '${word.zh}')"
              onmouseout="hideTooltip()">
    `).join('');

    imageContainer.innerHTML = `
        <img src="${group.image}" usemap="#${mapName}" alt="学习图片-${group.id}" class="learning-image">
        <map name="${mapName}">${areasHTML}</map>
    `;

    console.log('生成的热区 HTML:', areasHTML); // 添加调试信息
}

// 显示单词卡片
function showWord(word) {
    const currentGroup = wordsData.groups[currentGroupIndex];
    const wordInfo = currentGroup.areas.find(w => w.word === word);
    
    if (!wordInfo) {
        alert('未找到单词信息');
        return;
    }

    // 更新学习状态
    if (!learnedWords.has(word)) {
        learnedWords.add(word);
        updateProgress();
    }

    // 填充卡片内容
    document.getElementById('wordTitle').textContent = word;
    document.getElementById('zhText').textContent = wordInfo.zh;
    document.getElementById('spellingText').textContent = wordInfo.spelling;
    document.getElementById('exampleText').textContent = wordInfo.example;
    
    // 显示卡片
    document.getElementById('wordCard').style.display = 'block';
}

// 发音功能（增强版）
function speak() {
    try {
        const word = document.getElementById('wordTitle').textContent;
        const currentGroup = wordsData.groups[currentGroupIndex];
        const wordInfo = currentGroup.areas.find(w => w.word === word);

        if (!wordInfo?.audio) {
            throw new Error('该单词暂无发音资源');
        }

        // 优先使用本地音频
        const audioURL = wordInfo.audio.local || wordInfo.audio.online;
        const audio = new Audio(audioURL);

        // 错误处理
        audio.addEventListener('error', (e) => {
            console.error('音频加载失败:', e);
            alert('发音加载失败，请检查网络连接');
        });

        // 播放控制
        audio.play().catch(error => {
            console.error('播放失败:', error);
            alert('播放失败: ' + error.message);
        });
    } catch (error) {
        console.error('发音错误:', error);
        alert(error.message);
    }
}

// 更新学习进度
function updateProgress() {
    const currentGroup = wordsData.groups[currentGroupIndex];
    document.getElementById('progress').textContent = 
      `已学习：${learnedWords.size}/${currentGroup.areas.length}`;
    
    const guideText = document.getElementById('guideText');
    guideText.textContent = `请学习这张图片上的单词吧！ (${learnedWords.size}/${currentGroup.areas.length})`;
    
    const nextButtonContainer = document.getElementById('nextButtonContainer');
    if (learnedWords.size === currentGroup.areas.length) {
      assistantImage.src = 'as_happy.jpg'; // ✅ 切换图片
      guideText.textContent = '恭喜学完了这三个单词，进入下一页~';
      
      document.querySelector('.assistant-image').src = happyImage;
      
      nextButtonContainer.innerHTML = currentGroupIndex < wordsData.groups.length - 1 ?
        '<button class="next-button" onclick="nextGroup()">下一页 →</button>' :
        '<button class="next-button" onclick="location.href=\'home.html\'">完成学习！返回主页</button>';
    } else {
      assistantImage.src = 'as.png'; // ✅ 恢复默认图片
      guideText.textContent = `请继续学习 (${learnedWords.size}/${total})`;
      nextButtonContainer.innerHTML = '';
    }
  }

// 切换到下一组
function nextGroup() {
    currentGroupIndex++;
    loadGroup(currentGroupIndex);
    preloadNextGroupAudio();
}

// 预加载音频（提升响应速度）
function preloadNextGroupAudio() {
    const nextGroup = wordsData.groups[currentGroupIndex + 1];
    if (!nextGroup) return;

    nextGroup.areas.forEach(word => {
        if (word.audio?.online) {
            const audio = new Audio(word.audio.online);
            audio.preload = 'none'; // 不阻塞加载
        }
    });
}

// 关闭卡片
function closeCard() {
    document.getElementById('wordCard').style.display = 'none';
}



// 点击外部关闭卡片
window.addEventListener('click', (e) => {
    if (e.target === document.getElementById('wordCard')) {
        closeCard();
    }
});