import { ScoreBreakdown } from '@/types/game';

interface ScoreDisplayProps {
  score: number;
  currentQuestion: number;
  totalQuestions: number;
  breakdown?: ScoreBreakdown;
  className?: string;
}

const ScoreDisplay = ({ 
  score, 
  currentQuestion, 
  totalQuestions, 
  breakdown,
  className 
}: ScoreDisplayProps) => {
  return (
    <div className={`bg-card rounded-xl p-4 shadow-lg ${className}`}>
      <div className="text-center">
        <div className="text-3xl font-bold text-primary mb-2">{score}</div>
        <div className="text-sm text-muted-foreground mb-2">Total Poin</div>
        <div className="text-sm text-accent">
          Soal {currentQuestion} dari {totalQuestions}
        </div>
        
        {breakdown && (
          <div className="mt-4 pt-4 border-t border-border text-xs space-y-1">
            <div className="flex justify-between">
              <span>Poin Dasar:</span>
              <span className="text-game-correct">+{breakdown.basePoints}</span>
            </div>
            {breakdown.timeBonus > 0 && (
              <div className="flex justify-between">
                <span>Bonus Waktu:</span>
                <span className="text-game-correct">+{breakdown.timeBonus}</span>
              </div>
            )}
            {breakdown.wrongPenalty > 0 && (
              <div className="flex justify-between">
                <span>Penalty Salah:</span>
                <span className="text-destructive">-{breakdown.wrongPenalty}</span>
              </div>
            )}
            <div className="flex justify-between font-bold pt-1 border-t border-border">
              <span>Total:</span>
              <span>{breakdown.total}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScoreDisplay;