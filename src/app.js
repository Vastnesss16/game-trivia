// src/app.js
import { triviaQuestions } from './questions.js';

// Menyimpan status game agar mudah dipantau
const gameState = {
    currentLevel: 'mudah',
    score: 0,
    currentIndex: 0,
    timer: 15 // Batas waktu per soal
};

// Fungsi game ditaruh di bawah sini...