import { triviaQuestions } from './question.js';

// ===== UI ELEMENTS =====
const ui = {
  levelBadge: document.getElementById('level-badge'),
  scoreDisplay: document.getElementById('score-value'),
  timerProgress: document.getElementById('timer-progress'),
  timerText: document.getElementById('timer-text'),

  quizBox: document.getElementById('quiz-box'),
  questionEl: document.getElementById('question'),
  questionNumber: document.getElementById('question-number'),
  answerButtonsEl: document.getElementById('answer-buttons'),
  hintEl: document.getElementById('hint'),
  feedbackEl: document.getElementById('feedback'),

  progressFill: document.getElementById('progress-fill'),
  progressLabel: document.getElementById('progress-label'),
  progressLevelName: document.getElementById('progress-level-name'),

  scoreBox: document.getElementById('score-box'),
  finalScoreEl: document.getElementById('final-score'),
  scoreEmoji: document.getElementById('score-emoji'),
  scoreGrade: document.getElementById('score-grade'),
  scoreStars: document.getElementById('score-stars'),
  finalLevel: document.getElementById('final-level'),
  finalCorrect: document.getElementById('final-correct'),
  finalTotal: document.getElementById('final-total'),
  restartBtn: document.getElementById('restart-btn'),

  levelCompleteBox: document.getElementById('level-complete-box'),
  levelCompleteTitle: document.getElementById('level-complete-title'),
  levelCompleteSubtitle: document.getElementById('level-complete-subtitle'),
  levelCompleteScores: document.getElementById('level-complete-scores'),
  playAgainBtn: document.getElementById('play-again-btn'),
  nextLevelBtn: document.getElementById('next-level-btn'),

  leaderboardBody: document.getElementById('leaderboard-body'),
  clearLeaderboardBtn: document.getElementById('clear-leaderboard-btn'),

  achievementOverlay: document.getElementById('achievement-overlay'),
  achievementScore: document.getElementById('achievement-score'),
  achievementCloseBtn: document.getElementById('achievement-close-btn'),
  confettiContainer: document.getElementById('confetti-container'),
};

// ===== CONSTANTS =====
const LEVELS = [
  { key: 'pemula', label: 'Beginner', points: 5 },
  { key: 'mudah', label: 'Easy', points: 10 },
  { key: 'sedang', label: 'Medium', points: 15 },
  { key: 'sulit', label: 'Hard', points: 20 },
  { key: 'ekstrim', label: 'Extreme', points: 25 }
];

const QUESTIONS_PER_LEVEL = 10;
const TIMER_SECONDS = 15;
const CIRCUMFERENCE = 2 * Math.PI * 15.9155;

const STORAGE_KEY = 'trivia_leaderboard';
const MAX_LEADERBOARD = 10;

// ===== GAME STATE =====
const gameState = {
  levelIndex: 0,
  questionIndex: 0,
  score: 0,
  correctCount: 0,
  totalAnswered: 0,
  overallCorrectCount: 0,
  overallTotalAnswered: 0,
  timeLeft: TIMER_SECONDS,
  timerId: null,
  locked: false,
  levelQuestions: [],
  isNewHighScore: false,
};

// ===== LEADERBOARD =====
function getLeaderboard() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveLeaderboard(entry) {
  const board = getLeaderboard();
  board.push(entry);
  board.sort((a, b) => b.score - a.score);
  const trimmed = board.slice(0, MAX_LEADERBOARD);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

function isNewHighScore(score) {
  const board = getLeaderboard();
  if (board.length === 0) return true;
  return score > board[0].score;
}

function renderLeaderboard(currentScore = null) {
  const board = getLeaderboard();
  ui.leaderboardBody.innerHTML = '';

  if (board.length === 0) {
    ui.leaderboardBody.innerHTML = '<div class="leaderboard-empty">No scores yet. Be the first!</div>';
    return;
  }

  board.forEach((entry, i) => {
    const isCurrent = currentScore !== null && entry.score === currentScore &&
                      entry.date === new Date().toLocaleDateString('en-US');

    const item = document.createElement('div');
    item.className = `leaderboard-item${isCurrent ? ' current-player' : ''}`;

    const medal = i === 0 ? '1' : i === 1 ? '2' : i === 2 ? '3' : `#${i + 1}`;

    item.innerHTML = `
      <div class="leaderboard-rank top-${i + 1}">${medal}</div>
      <div class="leaderboard-score">${entry.score}</div>
      <div class="leaderboard-info">
        <div class="leaderboard-level">Level ${entry.level}</div>
        <div class="leaderboard-date">${entry.date}</div>
      ${isCurrent ? '<span class="leaderboard-badge-new">New</span>' : ''}
    `;

    ui.leaderboardBody.appendChild(item);
  });
}

// ===== HELPERS =====
function getCurrentSet() {
  const level = LEVELS[gameState.levelIndex];
  return triviaQuestions[level.key] || [];
}

function initLevelQuestions() {
  const all = getCurrentSet();
  const picked = shuffle(all).slice(0, QUESTIONS_PER_LEVEL);
  gameState.levelQuestions = picked;
  gameState.questionIndex = 0;
  gameState.totalAnswered = 0;
  gameState.correctCount = 0;
}

function shuffle(array) {
  const a = array.slice();
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ===== TIMER =====
function startTimer() {
  stopTimer();
  gameState.timeLeft = TIMER_SECONDS;
  updateTimerDisplay();

  gameState.timerId = setInterval(() => {
    gameState.timeLeft -= 1;
    updateTimerDisplay();

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

function updateTimerDisplay() {
  const progress = gameState.timeLeft / TIMER_SECONDS;
  const offset = CIRCUMFERENCE * (1 - progress);
  ui.timerProgress.style.strokeDasharray = `${CIRCUMFERENCE - offset} ${CIRCUMFERENCE}`;
  ui.timerText.textContent = gameState.timeLeft;

  if (gameState.timeLeft <= 5) {
    ui.timerProgress.style.stroke = '#e74c3c';
    ui.timerText.classList.add('warning');
  } else {
    ui.timerProgress.style.stroke = '#667eea';
    ui.timerText.classList.remove('warning');
  }
}

// ===== FEEDBACK =====
function resetFeedback() {
  ui.feedbackEl.classList.add('hide');
  ui.feedbackEl.classList.remove('correct', 'wrong');
  ui.feedbackEl.textContent = '';
}

function setFeedback(message, type) {
  ui.feedbackEl.textContent = message;
  ui.feedbackEl.classList.remove('hide', 'correct', 'wrong');
  ui.feedbackEl.classList.add(type);
}

// ===== RENDER =====
function renderLevelAndMeta() {
  const level = LEVELS[gameState.levelIndex];
  ui.levelBadge.textContent = `Level: ${level.label}`;
  ui.scoreDisplay.textContent = gameState.score;
  ui.progressLevelName.textContent = level.label;
}

function updateProgressBar() {
  const total = gameState.levelQuestions.length;
  const pct = Math.min((gameState.questionIndex) / total * 100, 100);
  ui.progressFill.style.width = `${pct}%`;
  ui.progressLabel.textContent = `Question ${Math.min(gameState.questionIndex + 1, total)}/${total}`;
}

function renderQuestion() {
  resetFeedback();
  gameState.locked = false;

  const q = gameState.levelQuestions[gameState.questionIndex];

  if (!q) {
    endGame();
    return;
  }

  ui.questionNumber.textContent = `Question #${gameState.questionIndex + 1}`;
  ui.questionEl.textContent = q.question;
  ui.hintEl.textContent = "Choose the correct answer below.";
  ui.answerButtonsEl.innerHTML = '';

  updateProgressBar();

  const shuffledAnswers = shuffle(q.answers);
  shuffledAnswers.forEach((answer) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'answer-btn';
    btn.textContent = answer;

    btn.addEventListener('click', () => {
      if (gameState.locked) return;
      gameState.locked = true;
      const isCorrect = answer === q.correct;
      selectAnswer(isCorrect, q.correct, q.answers, btn);
    });

    ui.answerButtonsEl.appendChild(btn);
  });

  startTimer();
}

// ===== SELECT ANSWER =====
function selectAnswer(isCorrect, correctAnswer, allAnswers, selectedBtn) {
  stopTimer();
  gameState.totalAnswered++;

  const level = LEVELS[gameState.levelIndex];

  const buttons = ui.answerButtonsEl.querySelectorAll('.answer-btn');
  buttons.forEach(btn => {
    btn.disabled = true;
    if (btn.textContent === correctAnswer) {
      btn.classList.add('correct-reveal');
    } else if (btn === selectedBtn && !isCorrect) {
      btn.classList.add('wrong-reveal');
    }
  });

  if (isCorrect) {
    gameState.score += level.points;
    gameState.correctCount++;
    gameState.overallCorrectCount++;
    ui.scoreDisplay.textContent = gameState.score;
    setFeedback('Correct!', 'correct');
  } else {
    setFeedback(`Wrong! Answer: ${correctAnswer}`, 'wrong');
  }

  gameState.overallTotalAnswered++;

  setTimeout(() => {
    gameState.locked = false;

    gameState.questionIndex++;

    if (gameState.questionIndex >= gameState.levelQuestions.length) {
      const completedLevelIndex = gameState.levelIndex;
      gameState.levelIndex++;
      gameState.questionIndex = 0;

      stopTimer();
      hideLevelComplete();
      showLevelComplete(completedLevelIndex);
      return;
    }

    renderQuestion();
  }, 1000);
}

// ===== TIMEOUT =====
function handleTimeout() {
  gameState.locked = true;
  gameState.totalAnswered++;
  gameState.overallTotalAnswered++;

  const q = gameState.levelQuestions[gameState.questionIndex];
  const correct = q ? q.correct : '';

  const buttons = ui.answerButtonsEl.querySelectorAll('.answer-btn');
  buttons.forEach(btn => {
    btn.disabled = true;
    if (btn.textContent === correct) {
      btn.classList.add('correct-reveal');
    }
  });

  setFeedback(`Time's up! Answer: ${correct}`, 'wrong');

  setTimeout(() => {
    gameState.locked = false;
    gameState.questionIndex++;

    if (gameState.questionIndex >= gameState.levelQuestions.length) {
      const completedLevelIndex = gameState.levelIndex;
      gameState.levelIndex++;
      gameState.questionIndex = 0;

      stopTimer();
      hideLevelComplete();
      showLevelComplete(completedLevelIndex);
      return;
    }

    renderQuestion();
  }, 1200);
}

// ===== LEVEL COMPLETE =====
function showLevelComplete(completedLevelIndex) {
  ui.quizBox.classList.add('hide');
  ui.levelCompleteBox.classList.remove('hide');

  const completedLevel = LEVELS[completedLevelIndex];
  ui.levelCompleteTitle.textContent = `Level ${completedLevel.label} Complete`;
  ui.levelCompleteSubtitle.textContent = `Score: ${gameState.score}`;

  ui.levelCompleteScores.innerHTML = `
    <span>Correct: ${gameState.correctCount}/${gameState.totalAnswered}</span>
    <span>Level Score: +${gameState.correctCount * completedLevel.points}</span>
  `;

  gameState.correctCount = 0;
  gameState.totalAnswered = 0;

  const isLastLevel = (completedLevelIndex >= LEVELS.length - 1);
  ui.nextLevelBtn.classList.toggle('hide', isLastLevel);

  if (isLastLevel) {
    ui.playAgainBtn.textContent = 'View Results';
  } else {
    ui.playAgainBtn.textContent = 'Finish';
  }
}

function hideLevelComplete() {
  ui.levelCompleteBox.classList.add('hide');
  ui.quizBox.classList.remove('hide');
}

// ===== END GAME =====
function endGame() {
  stopTimer();
  ui.quizBox.classList.add('hide');
  ui.levelCompleteBox.classList.add('hide');
  ui.scoreBox.classList.remove('hide');

  ui.finalScoreEl.textContent = gameState.score;
  ui.finalLevel.textContent = LEVELS[gameState.levelIndex]?.label || 'Finished';
  ui.finalCorrect.textContent = gameState.overallCorrectCount;
  ui.finalTotal.textContent = gameState.overallTotalAnswered;

  const maxScore = LEVELS.length * QUESTIONS_PER_LEVEL * LEVELS[LEVELS.length - 1].points;
  const ratio = gameState.score / maxScore;

  let grade, stars, emoji;
  if (ratio >= 0.9) {
    grade = 'S+'; stars = '3 Stars'; emoji = '🏆';
  } else if (ratio >= 0.75) {
    grade = 'A'; stars = '3 Stars'; emoji = '🥇';
  } else if (ratio >= 0.6) {
    grade = 'B'; stars = '2 Stars'; emoji = '🥈';
  } else if (ratio >= 0.4) {
    grade = 'C'; stars = '1 Star'; emoji = '🥉';
  } else {
    grade = 'D'; stars = 'None'; emoji = '💪';
  }

  ui.scoreGrade.textContent = grade;
  ui.scoreStars.textContent = stars;
  ui.scoreEmoji.textContent = emoji;

  const isHighScore = isNewHighScore(gameState.score);
  gameState.isNewHighScore = false;

  if (gameState.score > 0) {
    const entry = {
      score: gameState.score,
      level: LEVELS[Math.min(gameState.levelIndex, LEVELS.length - 1)]?.label || '-',
      date: new Date().toLocaleDateString('en-US'),
    };
    saveLeaderboard(entry);

    if (isHighScore) {
      gameState.isNewHighScore = true;
      showAchievement();
    }
  }

  renderLeaderboard(gameState.score);
}

// ===== ACHIEVEMENT =====
function showAchievement() {
  ui.achievementScore.textContent = gameState.score;
  ui.achievementOverlay.classList.remove('hide');
  spawnConfetti();
}

function hideAchievement() {
  ui.achievementOverlay.classList.add('hide');
  ui.confettiContainer.innerHTML = '';
}

function spawnConfetti() {
  const container = ui.confettiContainer;
  container.innerHTML = '';
  const colors = ['#667eea', '#764ba2', '#e74c3c', '#2ecc71', '#f39c12', '#3498db', '#e91e63'];

  for (let i = 0; i < 60; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.top = `${Math.random() * 20 - 20}%`;
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.width = `${Math.random() * 8 + 4}px`;
    piece.style.height = `${Math.random() * 8 + 4}px`;
    piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    piece.style.animationDuration = `${Math.random() * 2 + 1.5}s`;
    piece.style.animationDelay = `${Math.random() * 0.8}s`;
    container.appendChild(piece);
  }
}

// ===== START GAME =====
function startGame() {
  gameState.levelIndex = 0;
  gameState.questionIndex = 0;
  gameState.score = 0;
  gameState.correctCount = 0;
  gameState.totalAnswered = 0;
  gameState.overallCorrectCount = 0;
  gameState.overallTotalAnswered = 0;
  gameState.locked = false;
  gameState.isNewHighScore = false;

  ui.scoreBox.classList.add('hide');
  ui.quizBox.classList.remove('hide');
  ui.levelCompleteBox.classList.add('hide');
  hideAchievement();

  ui.timerProgress.style.stroke = '#667eea';
  ui.timerText.classList.remove('warning');

  initLevelQuestions();
  renderLevelAndMeta();
  renderQuestion();
}

// ===== EVENT LISTENERS =====
ui.restartBtn?.addEventListener('click', startGame);

ui.playAgainBtn?.addEventListener('click', () => {
  hideLevelComplete();
  endGame();
});

ui.nextLevelBtn?.addEventListener('click', () => {
  hideLevelComplete();
  initLevelQuestions();
  renderLevelAndMeta();
  renderQuestion();
});

ui.achievementCloseBtn?.addEventListener('click', hideAchievement);

ui.clearLeaderboardBtn?.addEventListener('click', () => {
  if (confirm('Clear all score history?')) {
    localStorage.removeItem(STORAGE_KEY);
    renderLeaderboard();
  }
});

// ===== INIT =====
renderLeaderboard();
startGame();
