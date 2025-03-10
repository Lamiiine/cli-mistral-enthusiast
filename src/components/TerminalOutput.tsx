
import React, { useState, useEffect } from 'react';
import { OutputItem } from './Terminal';
import { Loader2 } from 'lucide-react';

interface TerminalOutputProps {
  item: OutputItem;
}

const TerminalOutput: React.FC<TerminalOutputProps> = ({ item }) => {
  const [isTyping, setIsTyping] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  
  // Handle typewriter effect for responses
  useEffect(() => {
    if (item.type === 'response' && typeof item.content === 'string') {
      setIsTyping(true);
      let index = 0;
      const text = item.content as string;
      const typeInterval = setInterval(() => {
        if (index < text.length) {
          setDisplayedText(text.substring(0, index + 1));
          index++;
        } else {
          clearInterval(typeInterval);
          setIsTyping(false);
        }
      }, 10); // Adjust typing speed here
      
      return () => clearInterval(typeInterval);
    }
  }, [item.type, item.content]);
  
  // Render different output types
  const renderContent = () => {
    if (item.type === 'loading') {
      return (
        <div className="flex items-center space-x-2 text-terminal-foreground/70 ml-6 my-1">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Processing command...</span>
        </div>
      );
    }
    
    if (item.type === 'command') {
      return (
        <div className="flex items-start font-mono">
          <span className="text-terminal-accent mr-2">$</span>
          <span className="break-all">{item.content}</span>
        </div>
      );
    }

    if (item.type === 'response' && typeof item.content === 'string') {
      return (
        <div className={`ml-6 my-1 font-mono text-sm ${isTyping ? 'typing-animation' : ''}`}>
          {isTyping ? displayedText : item.content}
        </div>
      );
    }
    
    if (item.type === 'error') {
      return (
        <div className="ml-6 my-1 text-terminal-error font-mono">
          {item.content}
        </div>
      );
    }
    
    return (
      <div className="ml-6 my-1">
        {item.content}
      </div>
    );
  };
  
  return (
    <div className={`mb-3 animate-slide-up opacity-90 hover:opacity-100 transition-opacity ${item.type === 'info' ? 'pb-2 border-b border-terminal-foreground/10' : ''}`}>
      {renderContent()}
      
      {/* Timestamp (hidden by default, could be toggled) */}
      {false && (
        <div className="text-terminal-foreground/40 text-xs mt-1 ml-6">
          {item.timestamp.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

export default TerminalOutput;
