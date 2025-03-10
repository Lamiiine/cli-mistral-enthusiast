import React, { useState, useRef, useEffect } from 'react';

interface TerminalInputProps {
  onSubmit: (command: string) => void;
  onTabCompletion?: (partialPath: string) => Promise<string[]>;
  isProcessing: boolean;
  commandHistory: string[];
  navigateHistory: (direction: 'up' | 'down') => void;
  currentPosition: number | null;
  clearTerminal: () => void;
  currentDirectory: string;
}

const TerminalInput: React.FC<TerminalInputProps> = ({ 
  onSubmit, 
  onTabCompletion,
  isProcessing, 
  commandHistory, 
  navigateHistory,
  currentPosition,
  clearTerminal,
  currentDirectory
}) => {
  const [command, setCommand] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
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

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle up/down arrows for history navigation
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      navigateHistory('up');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      navigateHistory('down');
    } else if (e.key === 'Tab') {
      e.preventDefault();
      
      if (onTabCompletion) {
        // Extract the last word as the partial path
        const words = command.trim().split(' ');
        const partialPath = words[words.length - 1] || '';
        
        // Get suggestions
        const completions = await onTabCompletion(partialPath);
        
        if (completions.length === 1) {
          // If only one completion, use it
          words[words.length - 1] = completions[0];
          setCommand(words.join(' '));
        } else if (completions.length > 1) {
          // Show multiple completions
          setSuggestions(completions);
          setShowSuggestions(true);
        }
      }
    } else if (e.key === 'Escape') {
      // Hide suggestions on Escape
      setShowSuggestions(false);
    }
  };

  // Get username from the path
  const username = currentDirectory.split('/')[2] || 'user';
  
  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="mt-2 flex items-start group">
        <span className="text-terminal-accent font-mono whitespace-nowrap mr-2">
          {username}@ubuntu:{currentDirectory.replace(`/home/${username}`, '~')}$
        </span>
        <input
          ref={inputRef}
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isProcessing}
          className="flex-1 bg-transparent border-none outline-none font-mono text-terminal-foreground placeholder-terminal-foreground/30 focus:ring-0 p-0"
          placeholder={isProcessing ? "Processing command..." : ""}
          autoFocus
          autoComplete="off"
          spellCheck="false"
        />
        <div className={`w-2.5 h-5 ml-1 ${isProcessing ? 'opacity-0' : 'animate-cursor-blink'}`}>
          <span className="bg-terminal-foreground/70 w-[1px] h-full inline-block"></span>
        </div>
      </form>
      
      {/* Suggestions panel */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute left-0 mt-1 bg-terminal-background border border-terminal-foreground/20 rounded p-2 z-10 max-h-32 overflow-y-auto">
          <div className="grid grid-cols-3 gap-2">
            {suggestions.map((suggestion, index) => (
              <div 
                key={index} 
                className="cursor-pointer hover:bg-terminal-foreground/10 px-2 py-1 rounded text-sm font-mono"
                onClick={() => {
                  // Apply the suggestion
                  const words = command.trim().split(' ');
                  words[words.length - 1] = suggestion;
                  setCommand(words.join(' '));
                  setShowSuggestions(false);
                  inputRef.current?.focus();
                }}
              >
                {suggestion}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TerminalInput;
