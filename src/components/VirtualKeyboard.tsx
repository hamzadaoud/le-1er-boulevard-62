import React from 'react';
import { Button } from './ui/button';
import { Delete } from 'lucide-react';

interface VirtualKeyboardProps {
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
  isPassword?: boolean;
}

const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({ 
  onKeyPress, 
  onBackspace, 
  isPassword = false 
}) => {
  const letters = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm']
  ];

  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  const symbols = ['@', '.', '-', '_'];

  return (
    <div className="w-full max-w-2xl mx-auto p-2 sm:p-4 bg-card rounded-lg border">
      {/* Numbers Row */}
      <div className="flex justify-center gap-0.5 sm:gap-1 mb-2 sm:mb-3">
        {numbers.map((num) => (
          <Button
            key={num}
            variant="outline"
            size="sm"
            className="h-8 w-8 sm:h-10 sm:w-10 text-xs sm:text-sm p-0"
            onClick={() => onKeyPress(num)}
          >
            {num}
          </Button>
        ))}
      </div>

      {/* Letter Rows */}
      {letters.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center gap-0.5 sm:gap-1 mb-1 sm:mb-2">
          {row.map((letter) => (
            <Button
              key={letter}
              variant="outline"
              size="sm"
              className="h-8 w-8 sm:h-10 sm:w-10 text-xs sm:text-sm p-0"
              onClick={() => onKeyPress(letter)}
            >
              {letter.toUpperCase()}
            </Button>
          ))}
        </div>
      ))}

      {/* Symbols and Space Row */}
      <div className="flex justify-center gap-0.5 sm:gap-1 mb-1 sm:mb-2 flex-wrap">
        {symbols.map((symbol) => (
          <Button
            key={symbol}
            variant="outline"
            size="sm"
            className="h-8 w-10 sm:h-10 sm:w-12 text-xs sm:text-sm p-0"
            onClick={() => onKeyPress(symbol)}
          >
            {symbol}
          </Button>
        ))}
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-16 sm:h-10 sm:w-20 text-xs sm:text-sm p-0"
          onClick={() => onKeyPress(' ')}
        >
          Space
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-12 sm:h-10 sm:w-16 text-xs sm:text-sm p-0"
          onClick={onBackspace}
        >
          <Delete size={14} className="sm:w-4 sm:h-4" />
        </Button>
      </div>
    </div>
  );
};

export default VirtualKeyboard;