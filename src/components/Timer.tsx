import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface TimerProps {
  duration: number; // in seconds
  onTimeUp: () => void;
  isRunning: boolean;
  onTimeUpdate?: (timeLeft: number) => void;
}

const Timer = ({ duration, onTimeUp, isRunning, onTimeUpdate }: TimerProps) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  useEffect(() => {
    if (!isRunning) return;

    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        onTimeUpdate?.(newTime);
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isRunning, onTimeUp, onTimeUpdate]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const percentage = (timeLeft / duration) * 100;

  const getTimerColor = () => {
    if (timeLeft <= 30) return 'stroke-destructive';
    if (timeLeft <= 60) return 'stroke-game-timer';
    return 'stroke-accent';
  };

  return (
    <div className="flex items-center justify-center">
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
          <path
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="2"
          />
          <path
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            className={cn('timer-ring', getTimerColor())}
            strokeWidth="3"
            strokeDasharray={`${percentage}, 100`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={cn(
            'text-lg font-bold',
            timeLeft <= 30 && 'text-destructive',
            timeLeft > 30 && timeLeft <= 60 && 'text-game-timer',
            timeLeft > 60 && 'text-accent'
          )}>
            {minutes}:{seconds.toString().padStart(2, '0')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timer;