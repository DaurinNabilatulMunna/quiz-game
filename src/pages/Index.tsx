import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import GameCard from '@/components/GameCard';
import Timer from '@/components/Timer';
import ScoreDisplay from '@/components/ScoreDisplay';
import { GameState, Question, ScoreBreakdown } from '@/types/game';
import { questions } from '@/data/questions';
import { toast } from '@/hooks/use-toast';
import heroImage from '@/assets/hero-cards.jpg';

const QUESTION_TIME = 360; // 6 minutes
const FAST_COMPLETION_TIME = 180; // 3 minutes for bonus

const Index = () => {
  const [gameState, setGameState] = useState<GameState>({
    currentQuestion: 0,
    score: 0,
    timeLeft: QUESTION_TIME,
    wrongAttempts: 0,
    gamePhase: 'start',
    selectedCard: null,
    questions: [],
    questionStartTime: 0
  });

  const [lastScoreBreakdown, setLastScoreBreakdown] = useState<ScoreBreakdown | null>(null);

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const startGame = () => {
    const shuffledQuestions = shuffleArray(questions).slice(0, 6); // 6 questions per game
    setGameState({
      currentQuestion: 0,
      score: 0,
      timeLeft: QUESTION_TIME,
      wrongAttempts: 0,
      gamePhase: 'card-selection',
      selectedCard: null,
      questions: shuffledQuestions,
      questionStartTime: 0
    });
  };

  const selectCard = (cardIndex: number) => {
    if (gameState.gamePhase !== 'card-selection') return;
    
    setGameState(prev => ({
      ...prev,
      selectedCard: cardIndex,
      gamePhase: 'question',
      timeLeft: QUESTION_TIME,
      questionStartTime: Date.now()
    }));
  };

  const showAnswers = () => {
    setGameState(prev => ({
      ...prev,
      gamePhase: 'answers'
    }));
  };

  const calculateScore = (isCorrect: boolean, timeElapsed: number): ScoreBreakdown => {
    let basePoints = 5; // Default for timeout/no correct answer
    let timeBonus = 0;
    let wrongPenalty = 0;

    if (isCorrect) {
      if (gameState.wrongAttempts === 0) {
        basePoints = 10; // Perfect answer
      } else {
        basePoints = 8; // Correct after wrong attempts
        wrongPenalty = gameState.wrongAttempts; // 1 point per wrong attempt
      }
      
      // Time bonus if completed within 3 minutes
      if (timeElapsed <= FAST_COMPLETION_TIME) {
        timeBonus = 10;
      }
    }

    const total = basePoints + timeBonus - wrongPenalty;
    return { basePoints, timeBonus, wrongPenalty, total };
  };

  const selectAnswer = (answerIndex: number) => {
    if (gameState.gamePhase !== 'answers') return;

    const currentQ = gameState.questions[gameState.currentQuestion];
    const isCorrect = answerIndex === currentQ.correctAnswer;
    const timeElapsed = Math.floor((Date.now() - gameState.questionStartTime) / 1000);
    
    if (isCorrect) {
      const scoreBreakdown = calculateScore(true, timeElapsed);
      setLastScoreBreakdown(scoreBreakdown);
      
      toast({
        title: "Benar! 🎉",
        description: `+${scoreBreakdown.total} poin`,
        className: "correct-pulse"
      });

      setTimeout(() => {
        nextQuestion(scoreBreakdown.total);
      }, 1500);
    } else {
      const newWrongAttempts = gameState.wrongAttempts + 1;
      setGameState(prev => ({
        ...prev,
        wrongAttempts: newWrongAttempts
      }));
      
      toast({
        title: "Salah! ❌",
        description: "Coba lagi!",
        variant: "destructive",
        className: "incorrect-shake"
      });
    }
  };

  const handleTimeUp = () => {
    if (gameState.gamePhase === 'question') {
      showAnswers();
    } else if (gameState.gamePhase === 'answers') {
      const scoreBreakdown = calculateScore(false, QUESTION_TIME);
      setLastScoreBreakdown(scoreBreakdown);
      
      toast({
        title: "Waktu Habis! ⏰",
        description: `+${scoreBreakdown.total} poin`,
        variant: "destructive"
      });
      
      setTimeout(() => {
        nextQuestion(scoreBreakdown.total);
      }, 1500);
    }
  };

  const nextQuestion = (pointsToAdd: number) => {
    const isLastQuestion = gameState.currentQuestion >= gameState.questions.length - 1;
    
    if (isLastQuestion) {
      setGameState(prev => ({
        ...prev,
        score: prev.score + pointsToAdd,
        gamePhase: 'finished'
      }));
    } else {
      setGameState(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1,
        score: prev.score + pointsToAdd,
        wrongAttempts: 0,
        gamePhase: 'card-selection',
        selectedCard: null,
        timeLeft: QUESTION_TIME,
        questionStartTime: 0
      }));
    }
  };

  const resetGame = () => {
    setGameState({
      currentQuestion: 0,
      score: 0,
      timeLeft: QUESTION_TIME,
      wrongAttempts: 0,
      gamePhase: 'start',
      selectedCard: null,
      questions: [],
      questionStartTime: 0
    });
    setLastScoreBreakdown(null);
  };

  const currentQuestion = gameState.questions[gameState.currentQuestion];

  return (
    <div className="min-h-screen bg-game-bg text-foreground p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-uno-red via-uno-yellow via-uno-green to-uno-blue bg-clip-text text-transparent mb-2">
            UNO Education Game
          </h1>
          <p className="text-muted-foreground">Pilih kartu, jawab soal, kumpulkan poin!</p>
        </div>

        {/* Score Display */}
        {gameState.gamePhase !== 'start' && (
          <div className="mb-6">
            <ScoreDisplay 
              score={gameState.score}
              currentQuestion={gameState.currentQuestion + 1}
              totalQuestions={gameState.questions.length}
              breakdown={lastScoreBreakdown || undefined}
              className="max-w-sm mx-auto"
            />
          </div>
        )}

        {/* Start Screen */}
        {gameState.gamePhase === 'start' && (
          <div className="text-center space-y-8">
            <div className="relative w-full max-w-2xl mx-auto">
              <img 
                src={heroImage} 
                alt="UNO Education Game"
                className="w-full h-64 object-cover rounded-2xl shadow-2xl"
              />
              <div className="absolute inset-0 bg-black/20 rounded-2xl" />
            </div>
            <div className="space-y-6">
              <div className="bg-card rounded-xl p-6 text-card-foreground max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold mb-4">Cara Bermain:</h2>
                <ul className="text-left space-y-2">
                  <li>• Pilih salah satu dari 3 kartu</li>
                  <li>• Baca soal dengan waktu 6 menit</li>
                  <li>• Pilih jawaban yang benar dari 4 pilihan</li>
                  <li>• <strong>Poin 10:</strong> Jawab benar langsung</li>
                  <li>• <strong>Poin 8:</strong> Jawab benar setelah salah</li>
                  <li>• <strong>Poin 5:</strong> Waktu habis</li>
                  <li>• <strong>Bonus +10:</strong> Selesai dalam 3 menit</li>
                </ul>
              </div>
              <Button 
                onClick={startGame} 
                size="lg"
                className="bg-gradient-to-r from-uno-red to-uno-yellow hover:from-uno-yellow hover:to-uno-green text-white font-bold px-8 py-4 text-xl rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Mulai Bermain! 🎮
              </Button>
            </div>
          </div>
        )}

        {/* Card Selection */}
        {gameState.gamePhase === 'card-selection' && (
          <div className="text-center space-y-8">
            <h2 className="text-3xl font-bold">Pilih Kartumu!</h2>
            <div className="flex justify-center space-x-6">
              {[0, 1, 2].map((cardIndex) => (
                <GameCard
                  key={cardIndex}
                  color="back"
                  onClick={() => selectCard(cardIndex)}
                  className="transform hover:scale-110 transition-all duration-300"
                />
              ))}
            </div>
          </div>
        )}

        {/* Question Phase */}
        {gameState.gamePhase === 'question' && currentQuestion && (
          <div className="text-center space-y-8">
            <Timer 
              duration={QUESTION_TIME}
              onTimeUp={handleTimeUp}
              isRunning={true}
            />
            
            <div className="bg-card rounded-xl p-8 text-card-foreground max-w-3xl mx-auto shadow-xl">
              <h2 className="text-2xl font-bold mb-6">Soal Ke-{gameState.currentQuestion + 1}</h2>
              <p className="text-xl leading-relaxed">{currentQuestion.question}</p>
            </div>
            
            <Button 
              onClick={showAnswers}
              size="lg"
              className="bg-gradient-to-r from-uno-green to-uno-blue hover:from-uno-blue hover:to-uno-green text-white font-bold px-8 py-4 rounded-xl shadow-lg"
            >
              Lihat Pilihan Jawaban 
            </Button>
          </div>
        )}

        {/* Answer Phase */}
        {gameState.gamePhase === 'answers' && currentQuestion && (
          <div className="text-center space-y-8">
            <Timer 
              duration={gameState.timeLeft}
              onTimeUp={handleTimeUp}
              isRunning={true}
            />
            
            <div className="bg-card rounded-xl p-6 text-card-foreground max-w-2xl mx-auto mb-6">
              <h3 className="font-semibold mb-2">Soal:</h3>
              <p className="text-lg">{currentQuestion.question}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {currentQuestion.answers.map((answer, index) => (
                <Button
                  key={index}
                  onClick={() => selectAnswer(index)}
                  variant="outline"
                  className="h-auto p-6 text-lg font-medium bg-card hover:bg-accent text-card-foreground hover:text-accent-foreground border-2 hover:border-accent rounded-xl transition-all duration-300 hover:scale-105"
                >
                  <span className="block">
                    <span className="font-bold text-primary mr-2">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    {answer}
                  </span>
                </Button>
              ))}
            </div>
            
            {gameState.wrongAttempts > 0 && (
              <div className="text-sm text-destructive">
                Salah {gameState.wrongAttempts} kali. Poin akan dikurangi!
              </div>
            )}
          </div>
        )}

        {/* Finished Screen */}
        {gameState.gamePhase === 'finished' && (
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-primary">Permainan Selesai! 🎉</h2>
              <div className="text-6xl font-bold bg-gradient-to-r from-uno-yellow to-uno-green bg-clip-text text-transparent">
                {gameState.score} Poin
              </div>
              <p className="text-xl text-muted-foreground">
                Kamu menyelesaikan {gameState.questions.length} soal!
              </p>
            </div>
            
            <div className="bg-card rounded-xl p-6 text-card-foreground max-w-md mx-auto">
              <h3 className="font-bold mb-4">Hasil Akhir:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Soal:</span>
                  <span>{gameState.questions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Skor Akhir:</span>
                  <span className="font-bold text-primary">{gameState.score}</span>
                </div>
                <div className="flex justify-between">
                  <span>Rata-rata per soal:</span>
                  <span>{Math.round(gameState.score / gameState.questions.length)}</span>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={resetGame}
              size="lg"
              className="bg-gradient-to-r from-uno-blue to-uno-red hover:from-uno-red hover:to-uno-yellow text-white font-bold px-8 py-4 text-xl rounded-xl shadow-lg"
            >
              Main Lagi! 🔄
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
