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
    <div className="w-full max-w-lg mx-auto p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border shadow-sm">
      {/* Numbers Row */}
      <div className="flex justify-center gap-1 mb-2">
        {numbers.map((num) => (
          <Button
            key={num}
            variant="outline"
            size="sm"
            className="h-7 w-7 text-xs p-0 font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            onClick={() => onKeyPress(num)}
          >
            {num}
          </Button>
        ))}
      </div>

      {/* Letter Rows */}
      {letters.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center gap-1 mb-2">
          {row.map((letter) => (
            <Button
              key={letter}
              variant="outline"
              size="sm"
              className="h-7 w-7 text-xs p-0 font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              onClick={() => onKeyPress(letter)}
            >
              {letter.toUpperCase()}
            </Button>
          ))}
        </div>
      ))}

      {/* Bottom Row - Symbols, Space, Delete */}
      <div className="flex justify-center items-center gap-1">
        {/* Symbols */}
        <div className="flex gap-1">
          {symbols.map((symbol) => (
            <Button
              key={symbol}
              variant="outline"
              size="sm"
              className="h-7 w-8 text-xs p-0 font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              onClick={() => onKeyPress(symbol)}
            >
              {symbol}
            </Button>
          ))}
        </div>
        
        {/* Space */}
        <Button
          variant="outline"
          size="sm"
          className="h-7 w-20 text-xs p-0 font-medium hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
          onClick={() => onKeyPress(' ')}
        >
          ESPACE
        </Button>
        
        {/* Delete */}
        <Button
          variant="outline"
          size="sm"
          className="h-7 w-10 text-xs p-0 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          onClick={onBackspace}
        >
          <Delete size={12} />
        </Button>
      </div>
    </div>
  );
};

export default VirtualKeyboard;
