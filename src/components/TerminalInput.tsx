
import React, { useState, useRef, useEffect } from 'react';

interface TerminalInputProps {
  onSubmit: (command: string) => void;
  isProcessing: boolean;
  commandHistory: string[];
  navigateHistory: (direction: 'up' | 'down') => void;
  currentPosition: number | null;
  clearTerminal: () => void;
}

const TerminalInput: React.FC<TerminalInputProps> = ({ 
  onSubmit, 
  isProcessing, 
  commandHistory, 
  navigateHistory,
  currentPosition,
  clearTerminal
}) => {
  const [command, setCommand] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    // Set the input value based on history position
    if (currentPosition !== null && commandHistory[currentPosition]) {
      setCommand(commandHistory[currentPosition]);
    }
  }, [currentPosition, commandHistory]);

  useEffect(() => {
    // Focus input on component mount
    if (inputRef.current) {
      inputRef.current.focus();
    }
    
    // Add event listener for key combinations
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+L to clear terminal
      if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        clearTerminal();
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [clearTerminal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (command.trim() && !isProcessing) {
      onSubmit(command);
      setCommand('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle up/down arrows for history navigation
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      navigateHistory('up');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      navigateHistory('down');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-2 flex items-center group">
      <span className="text-terminal-accent mr-2 font-mono">$</span>
      <input
        ref={inputRef}
        type="text"
        value={command}
        onChange={(e) => setCommand(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isProcessing}
        className="flex-1 bg-transparent border-none outline-none font-mono text-terminal-foreground placeholder-terminal-foreground/30 focus:ring-0 p-0"
        placeholder={isProcessing ? "Processing command..." : "Type a command..."}
        autoFocus
        autoComplete="off"
        spellCheck="false"
      />
      <div className={`w-2.5 h-5 ml-1 ${isProcessing ? 'opacity-0' : 'animate-cursor-blink'}`}>
        <span className="bg-terminal-foreground/70 w-[1px] h-full inline-block"></span>
      </div>
    </form>
  );
};

export default TerminalInput;
