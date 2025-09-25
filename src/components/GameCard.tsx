import { useState } from 'react';
import { cn } from '@/lib/utils';

interface GameCardProps {
  isFlipped?: boolean;
  color?: 'red' | 'yellow' | 'green' | 'blue' | 'back';
  children?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

const GameCard = ({ 
  isFlipped = false, 
  color = 'back', 
  children, 
  onClick, 
  className,
  disabled = false 
}: GameCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={cn(
        'uno-card',
        `uno-card-${color}`,
        'flex items-center justify-center',
        disabled && 'pointer-events-none opacity-50',
        className
      )}
      onClick={!disabled ? onClick : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={cn(
        'card-flip w-full h-full',
        isFlipped && 'flipped'
      )}>
        <div className="card-face flex items-center justify-center text-white font-bold text-xl">
          {color === 'back' ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent mx-auto mb-2 flex items-center justify-center text-2xl">
                ?
              </div>
              <div className="text-sm">UNO</div>
            </div>
          ) : (
            children
          )}
        </div>
        <div className="card-face card-back flex items-center justify-center text-card-foreground">
          {children}
        </div>
      </div>
    </div>
  );
};

export default GameCard;