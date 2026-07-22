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
  restartBtn: document.getElementById('restart-btn'),

  levelCompleteBox: document.getElementById('level-complete-box'),
  levelCompleteTitle: document.getElementById('level-complete-title'),
  levelCompleteSubtitle: document.getElementById('level-complete-subtitle'),
  playAgainBtn: document.getElementById('play-again-btn'),
  nextLevelBtn: document.getElementById('next-level-btn')
};

const LEVELS = [
  { key: 'mudah', label: 'Mudah', points: 10 },
  { key: 'sedang', label: 'Sedang', points: 15 },
  { key: 'sulit', label: 'Sulit', points: 20 }
];

const gameState = {
  levelIndex: 0,
  questionIndex: 0,
  score: 0,
  timeLeft: 15,
  timerId: null,
  locked: false,
  // kumpulan soal yang sudah dipilih untuk level saat ini (acak sekali saat level dimulai)
  // dan berisi tepat 10 soal yang akan ditampilkan
  levelQuestions: []
};

function getCurrentSet() {
  const level = LEVELS[gameState.levelIndex];
  return triviaQuestions[level.key] || [];
}

function initLevelQuestions() {
  const all = getCurrentSet();
  const picked = shuffle(all).slice(0, 10);
  gameState.levelQuestions = picked;
  gameState.questionIndex = 0;
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

function shuffle(array) {
  const a = array.slice();
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function renderQuestion() {
  resetFeedback();
  gameState.locked = false;

  const q = gameState.levelQuestions[gameState.questionIndex];

  if (!q) {
    endGame();
    return;
  }

  ui.questionEl.textContent = q.question;
  ui.hintEl.textContent = "Jawaban pilihan: pilih terjemahan bahasa Indonesianya.";
  ui.answerButtonsEl.innerHTML = '';

  const shuffledAnswers = shuffle(q.answers);
  shuffledAnswers.forEach((answer) => {
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

    if (gameState.questionIndex >= gameState.levelQuestions.length) {
      const completedLevelIndex = gameState.levelIndex;
      gameState.levelIndex += 1;
      gameState.questionIndex = 0;

      stopTimer();
      hideLevelComplete();
      showLevelComplete(completedLevelIndex);
      return;
    }

    renderQuestion();
    startTimer();
  }, 900);
}



function handleTimeout() {
  gameState.locked = true;

  const q = gameState.levelQuestions[gameState.questionIndex];
  const correct = q ? q.correct : '';


  setFeedback(`Waktu habis ⏲️. Jawaban yang benar: ${correct}`, 'wrong');

  setTimeout(() => {
    gameState.locked = false;
    gameState.questionIndex += 1;


    if (gameState.questionIndex >= gameState.levelQuestions.length) {
      const completedLevelIndex = gameState.levelIndex;
      gameState.levelIndex += 1;
      gameState.questionIndex = 0;

      stopTimer();
      hideLevelComplete();
      showLevelComplete(completedLevelIndex);
      return;
    }

    renderQuestion();
    startTimer();
  }, 950);
}

function showLevelComplete(completedLevelIndex) {
  ui.quizBox.classList.add('hide');
  ui.levelCompleteBox.classList.remove('hide');

  const completedLevel = LEVELS[completedLevelIndex];
  ui.levelCompleteTitle.textContent = `Level ${completedLevel.label} Selesai!`;
  ui.levelCompleteSubtitle.textContent = `Skor sementara: ${gameState.score}`;

  // Jika ini level terakhir (Sulit), sembunyikan tombol "Selanjutnya"
  const isLastLevel = (completedLevelIndex >= LEVELS.length - 1);
  ui.nextLevelBtn.classList.toggle('hide', isLastLevel);
}

function hideLevelComplete() {
  ui.levelCompleteBox.classList.add('hide');
  ui.quizBox.classList.remove('hide');
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

  initLevelQuestions();
  renderLevelAndMeta();
  renderQuestion();
  startTimer();
}


ui.restartBtn?.addEventListener('click', startGame);

ui.playAgainBtn?.addEventListener('click', () => {
  // Selesai: akhiri game dan tampilkan skor akhir
  hideLevelComplete();
  endGame();
});




ui.nextLevelBtn?.addEventListener('click', () => {
  // lanjut dari level sedang (karena levelIndex sudah di-increment saat selesai mudah)
  hideLevelComplete();
  initLevelQuestions();
  renderLevelAndMeta();

  renderQuestion();
  startTimer();
});





startGame();

