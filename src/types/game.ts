export interface Question {
  id: number;
  question: string;
  answers: string[];
  correctAnswer: number; // index of correct answer
}

export interface GameState {
  currentQuestion: number;
  score: number;
  timeLeft: number;
  wrongAttempts: number;
  gamePhase: 'start' | 'card-selection' | 'question' | 'answers' | 'finished';
  selectedCard: number | null;
  questions: Question[];
  questionStartTime: number;
}

export interface ScoreBreakdown {
  basePoints: number;
  timeBonus: number;
  wrongPenalty: number;
  total: number;
}