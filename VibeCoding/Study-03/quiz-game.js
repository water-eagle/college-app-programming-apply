// State Management
let allQuestions = [];
let currentQuestions = [];
let currentIndex = 0;
let score = 0;
let correctCount = 0;
let isWaitingForNext = false;

// DOM Elements
const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');
const categoryButtons = document.getElementById('category-buttons');
const categoryTag = document.getElementById('category-tag');
const progressText = document.getElementById('progress-text');
const currentScoreText = document.getElementById('current-score');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const feedbackContainer = document.getElementById('feedback-container');
const feedbackResult = document.getElementById('feedback-result');
const explanationText = document.getElementById('explanation-text');
const finalScoreText = document.getElementById('final-score');
const finalStatsText = document.getElementById('final-stats');
const restartBtn = document.getElementById('restart-btn');
const nextBtn = document.getElementById('next-btn');
const exitBtn = document.getElementById('exit-btn');

// Initialize Game
async function init() {
    try {
        const response = await fetch('quiz_data.json');
        allQuestions = await response.json();
        setupCategoryButtons();
    } catch (error) {
        console.error('데이터를 불러오는데 실패했습니다:', error);
        questionText.innerText = '데이터를 불러오는 중 오류가 발생했습니다.';
    }
}

function setupCategoryButtons() {
    const categories = [...new Set(allQuestions.map(q => q.category))];
    
    // Clear existing buttons (except "All")
    const allBtn = categoryButtons.querySelector('[data-category="all"]');
    categoryButtons.innerHTML = '';
    categoryButtons.appendChild(allBtn);

    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'btn category-btn';
        btn.textContent = cat;
        btn.dataset.category = cat;
        btn.onclick = () => startGame(cat);
        categoryButtons.appendChild(btn);
    });

    allBtn.onclick = () => startGame('all');
}

function startGame(category) {
    if (category === 'all') {
        currentQuestions = [...allQuestions];
    } else {
        currentQuestions = allQuestions.filter(q => q.category === category);
    }

    // Shuffle questions
    currentQuestions.sort(() => Math.random() - 0.5);

    currentIndex = 0;
    score = 0;
    correctCount = 0;
    isWaitingForNext = false;

    updateScoreDisplay();
    showScreen(quizScreen);
    displayQuestion();
}

function displayQuestion() {
    const q = currentQuestions[currentIndex];
    isWaitingForNext = false;
    
    categoryTag.textContent = q.category;
    progressText.textContent = `문제 ${currentIndex + 1} / ${currentQuestions.length}`;
    questionText.textContent = q.question;
    
    optionsContainer.innerHTML = '';
    feedbackContainer.classList.add('hidden');
    
    q.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'btn option-btn';
        btn.innerHTML = `<span class="option-num">${idx + 1}</span> ${opt}`;
        btn.onclick = () => handleChoice(idx);
        optionsContainer.appendChild(btn);
    });
}

function handleChoice(index) {
    if (isWaitingForNext) return;

    const q = currentQuestions[currentIndex];
    const isCorrect = index === q.answer;
    isWaitingForNext = true;

    if (isCorrect) {
        score += 2.5;
        correctCount++;
        feedbackResult.textContent = '정답입니다!';
        feedbackContainer.className = 'feedback-panel correct';
    } else {
        feedbackResult.textContent = `틀렸습니다. 정답은 [${q.options[q.answer]}]입니다.`;
        feedbackContainer.className = 'feedback-panel wrong';
    }

    explanationText.textContent = q.explanation;
    feedbackContainer.classList.remove('hidden');
    updateScoreDisplay();

    // Highlight buttons
    const buttons = optionsContainer.querySelectorAll('.btn');
    buttons.forEach((btn, idx) => {
        if (idx === q.answer) {
            btn.style.borderColor = 'var(--success-color)';
            btn.style.backgroundColor = '#f0fdf4';
        } else if (idx === index && !isCorrect) {
            btn.style.borderColor = 'var(--error-color)';
            btn.style.backgroundColor = '#fef2f2';
        }
        btn.disabled = true;
    });
}

function nextQuestion() {
    currentIndex++;
    if (currentIndex < currentQuestions.length) {
        displayQuestion();
    } else {
        showResult();
    }
}

function updateScoreDisplay() {
    currentScoreText.textContent = `점수: ${score.toFixed(1)}`;
}

function showResult() {
    showScreen(resultScreen);
    finalScoreText.textContent = score.toFixed(1);
    finalStatsText.textContent = `맞힌 개수: ${correctCount} / ${currentQuestions.length}`;
}

function showScreen(screen) {
    [startScreen, quizScreen, resultScreen].forEach(s => s.classList.add('hidden'));
    screen.classList.remove('hidden');
}

// Event Listeners
nextBtn.onclick = nextQuestion;

exitBtn.onclick = () => {
    if (confirm('퀴즈를 종료하고 결과를 확인하시겠습니까?')) {
        // Adjust total question count for result display if exited early
        const actualTotal = currentQuestions.length;
        showResult();
        finalStatsText.textContent = `진행 중 종료 - 맞힌 개수: ${correctCount} / ${currentIndex + (isWaitingForNext ? 1 : 0)} (전체 ${actualTotal}문제 중)`;
    }
};

restartBtn.onclick = () => showScreen(startScreen);

// Keyboard Input Handler
document.addEventListener('keydown', (e) => {
    // Number keys 1-4
    if (!isWaitingForNext && quizScreen.offsetParent !== null) {
        if (['1', '2', '3', '4'].includes(e.key)) {
            handleChoice(parseInt(e.key) - 1);
        }
    } 
    // Enter key for next question
    else if (isWaitingForNext && e.key === 'Enter') {
        nextQuestion();
    }
});

// Start
init();
