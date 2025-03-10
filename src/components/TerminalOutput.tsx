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
      // Clean up the response text to remove explanations and excessive formatting
      let cleanText = item.content as string;
      
      // Extract just the command output from between backticks when present
      const codeBlockMatch = cleanText.match(/```\n([\s\S]*?)```/);
      if (codeBlockMatch) {
        cleanText = codeBlockMatch[1];
      }
      
      // Remove absolute paths that appear on their own line
      cleanText = cleanText.replace(/^\/(home|usr|etc|var)\/[a-zA-Z0-9_\/~.-]+$/gm, '');
      
      // Remove explanatory text
      cleanText = cleanText.replace(/^This (command|directory|file).*$/gm, '');
      cleanText = cleanText.replace(/^You can.*$/gm, '');
      cleanText = cleanText.replace(/^Remember.*$/gm, '');
      cleanText = cleanText.replace(/^For example.*$/gm, '');
      cleanText = cleanText.replace(/^That's the basic.*$/gm, '');
      cleanText = cleanText.replace(/^Here's.*$/gm, '');
      cleanText = cleanText.replace(/^If you want.*$/gm, '');
      
      // Set the cleaner text for display
      setIsTyping(true);
      const text = cleanText.trim();
      let index = 0;
      const typeInterval = setInterval(() => {
        if (index < text.length) {
          setDisplayedText(text.substring(0, index + 1));
          index++;
        } else {
          clearInterval(typeInterval);
          setIsTyping(false);
        }
      }, 5); // Fast typing speed
      
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
