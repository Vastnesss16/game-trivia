// 1. Data Pertanyaan (Bank Soal)
const questions = [
    {
        question: "Apa ibu kota Indonesia?",
        answers: ["Jakarta", "Bandung", "Surabaya", "Nusantara"],
        correct: "Nusantara"
    },
    {
        question: "Berapakah hasil dari 5 + 5?",
        answers: ["7", "10", "12", "15"],
        correct: "10"
    }
];

let currentQuestionIndex = 0;
let score = 0;

// 2. Element HTML
const questionElement = document.getElementById('question');
const answerButtonsElement = document.getElementById('answer-buttons');
const quizBox = document.getElementById('quiz-box');
const scoreBox = document.getElementById('score-box');
const finalScoreElement = document.getElementById('final-score');

// 3. Fungsi Memulai Game
function startGame() {
    currentQuestionIndex = 0;
    score = 0;
    quizBox.classList.remove('hide');
    scoreBox.classList.add('hide');
    showQuestion();
}

// 4. Fungsi Menampilkan Soal
function showQuestion() {
    resetState();
    let currentQuestion = questions[currentQuestionIndex];
    questionElement.innerText = currentQuestion.question;

    // Membuat tombol untuk setiap pilihan jawaban
    currentQuestion.answers.forEach(answer => {
        const button = document.createElement('button');
        button.innerText = answer;
        button.addEventListener('click', () => selectAnswer(answer, currentQuestion.correct));
        answerButtonsElement.appendChild(button);
    });
}

// Hapus tombol jawaban sebelumnya
function resetState() {
    while (answerButtonsElement.firstChild) {
        answerButtonsElement.removeChild(answerButtonsElement.firstChild);
    }
}

// 5. Fungsi Mengecek Jawaban
function selectAnswer(selected, correct) {
    if (selected === correct) {
        score += 10; // Tambah skor jika benar
    }
    
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        showQuestion(); // Lanjut soal berikutnya
    } else {
        showScore(); // Game selesai
    }
}

// 6. Menampilkan Skor Akhir
function showScore() {
    quizBox.classList.add('hide');
    scoreBox.classList.remove('hide');
    finalScoreElement.innerText = `Skor kamu: ${score}`;
}

// Jalankan game pertama kali
startGame();