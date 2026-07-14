import { triviaQuestions } from './question.js';

const ui = {
  levelBadge: document.getElementById('level-badge'),
  scoreDisplay: document.getElementById('score-display'),
  timerDisplay: document.getElementById('timer-display'),

  quizBox: document.getElementById('quiz-box'),
  questionEl: document.getElementById('question'),
  answerButtonsEl: document.getElementById('answer-buttons'),
  hintEl: document.getElementById('hint'),
  feedbackEl: document.getElementById('feedback'),

  scoreBox: document.getElementById('score-box'),
  finalScoreEl: document.getElementById('final-score'),
  restartBtn: document.getElementById('restart-btn')
};

const LEVELS = [
  { key: 'mudah', label: 'Mudah', points: 10 },
  { key: 'sedang', label: 'Sedang', points: 15 }
];

const gameState = {
  levelIndex: 0,
  questionIndex: 0,
  score: 0,
  timeLeft: 15,
  timerId: null,
  locked: false
};

function getCurrentSet() {
  const level = LEVELS[gameState.levelIndex];
  return triviaQuestions[level.key] || [];
}

function resetFeedback() {
  ui.feedbackEl.classList.add('hide');
  ui.feedbackEl.classList.remove('correct', 'wrong');
  ui.feedbackEl.textContent = '';
}

function setFeedback(message, type) {
  ui.feedbackEl.textContent = message;
  ui.feedbackEl.classList.remove('hide');
  ui.feedbackEl.classList.remove('correct', 'wrong');
  ui.feedbackEl.classList.add(type);
}

function renderLevelAndMeta() {
  const level = LEVELS[gameState.levelIndex];
  ui.levelBadge.textContent = `Level: ${level.label}`;
  ui.scoreDisplay.textContent = `Skor: ${gameState.score}`;
}

function startTimer() {
  stopTimer();
  gameState.timeLeft = 15;
  ui.timerDisplay.textContent = `⏱️ ${gameState.timeLeft}s`;

  gameState.timerId = setInterval(() => {
    gameState.timeLeft -= 1;
    ui.timerDisplay.textContent = `⏱️ ${gameState.timeLeft}s`;

    if (gameState.timeLeft <= 0) {
      stopTimer();
      handleTimeout();
    }
  }, 1000);
}

function stopTimer() {
  if (gameState.timerId) clearInterval(gameState.timerId);
  gameState.timerId = null;
}

function renderQuestion() {
  resetFeedback();
  gameState.locked = false;


  const questions = getCurrentSet();
  const q = questions[gameState.questionIndex];

  if (!q) {
    endGame();
    return;
  }

  ui.questionEl.textContent = q.question;
  ui.hintEl.textContent = "Jawaban pilihan: pilih terjemahan bahasa Indonesianya.";
  ui.answerButtonsEl.innerHTML = '';

  q.answers.forEach((answer) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = answer;

    btn.addEventListener('click', () => {
      if (gameState.locked) return;
      gameState.locked = true;
      const isCorrect = answer === q.correct;
      selectAnswer(isCorrect, q.correct);
    });

    ui.answerButtonsEl.appendChild(btn);
  });
}

function selectAnswer(isCorrect, correctAnswer) {
  stopTimer();

  const level = LEVELS[gameState.levelIndex];
  if (isCorrect) {
    gameState.score += level.points;
    ui.scoreDisplay.textContent = `Skor: ${gameState.score}`;
    setFeedback('Correct! ✅', 'correct');
  } else {
    setFeedback(`Salah ❌. Jawaban yang benar: ${correctAnswer}`, 'wrong');
  }

  // next
  setTimeout(() => {
    gameState.locked = false;

    gameState.questionIndex += 1;

    const currentSet = getCurrentSet();
    if (gameState.questionIndex >= currentSet.length) {
      // move to next level
      gameState.levelIndex += 1;
      gameState.questionIndex = 0;

      if (gameState.levelIndex >= LEVELS.length) {
        endGame();
        return;
      }
    }

    renderLevelAndMeta();
    renderQuestion();
    startTimer();
  }, 900);
}

function handleTimeout() {
  gameState.locked = true;

  const questions = getCurrentSet();
  const q = questions[gameState.questionIndex];
  const correct = q ? q.correct : '';

  setFeedback(`Waktu habis ⏲️. Jawaban yang benar: ${correct}`, 'wrong');

  setTimeout(() => {
    gameState.locked = false;
    gameState.questionIndex += 1;


    const currentSet = getCurrentSet();
    if (gameState.questionIndex >= currentSet.length) {
      gameState.levelIndex += 1;
      gameState.questionIndex = 0;

      if (gameState.levelIndex >= LEVELS.length) {
        endGame();
        return;
      }
    }

    renderLevelAndMeta();
    renderQuestion();
    startTimer();
  }, 950);
}

function endGame() {
  stopTimer();
  ui.quizBox.classList.add('hide');
  ui.scoreBox.classList.remove('hide');
  ui.finalScoreEl.textContent = `Skor kamu: ${gameState.score}`;
}

function startGame() {
  gameState.levelIndex = 0;
  gameState.questionIndex = 0;
  gameState.score = 0;
  gameState.locked = false;

  ui.scoreBox.classList.add('hide');
  ui.quizBox.classList.remove('hide');

  renderLevelAndMeta();
  renderQuestion();
  startTimer();
}

ui.restartBtn?.addEventListener('click', startGame);

startGame();

