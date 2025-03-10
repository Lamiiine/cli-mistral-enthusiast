import React, { useState, useEffect, useRef } from 'react';
import TerminalInput from './TerminalInput';
import TerminalOutput from './TerminalOutput';
import { useCommandHistory } from '@/hooks/useCommandHistory';
import { processCommand } from '@/utils/terminalCommands';
import { toast } from '@/components/ui/use-toast';
import { clearCommandContext } from '@/utils/commandContext';

export type OutputItem = {
  id: string;
  type: 'command' | 'response' | 'error' | 'info' | 'loading';
  content: string | React.ReactNode;
  timestamp: Date;
};

const Terminal = () => {
  const [apiKey, setApiKey] = useState<string>(import.meta.env.VITE_MISTRAL_API_KEY || '');
  const [outputs, setOutputs] = useState<OutputItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentDirectory, setCurrentDirectory] = useState<string>('/home/user');
  const { history, addToHistory, navigateHistory, currentPosition } = useCommandHistory();
  const terminalRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Initial welcome message
  useEffect(() => {
    const welcomeMessage: OutputItem = {
      id: 'welcome-message',
      type: 'info',
      content: (
        <div className="space-y-1 animate-text-appear">
          <p className="text-terminal-accent font-bold">Ubuntu 22.04 LTS Terminal Emulator</p>
          <p>Type commands as you would in a regular Ubuntu terminal.</p>
          <p>Use <span className="text-terminal-accent">'clear'</span> to clear the screen.</p>
        </div>
      ),
      timestamp: new Date(),
    };
    
    // Only show API key message if needed
    if (!apiKey) {
      welcomeMessage.content = (
        <div className="space-y-1 animate-text-appear">
          <p className="text-terminal-accent font-bold">Welcome to Ubuntu Terminal Emulator</p>
          <p>Please set your API key first with: <span className="text-terminal-accent">'api-key YOUR_API_KEY'</span></p>
        </div>
      );
    }
    
    setOutputs([welcomeMessage]);
  }, [apiKey]);

  // Scroll to bottom when outputs change
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [outputs]);

  const handleCommand = async (command: string) => {
    if (!command.trim()) return;
    
    // Add command to history and display
    addToHistory(command);
    const commandOutput: OutputItem = {
      id: `command-${Date.now()}`,
      type: 'command',
      content: command,
      timestamp: new Date(),
    };
    
    setOutputs(prev => [...prev, commandOutput]);
    setIsProcessing(true);

    try {
      // Handle API key setting 
      if (command.startsWith('api-key ')) {
        const key = command.replace('api-key ', '').trim();
        setApiKey(key);
        
        const response: OutputItem = {
          id: `response-${Date.now()}`,
          type: 'info',
          content: 'API key set successfully. You can now use the "mistral" command.',
          timestamp: new Date(),
        };
        
        setOutputs(prev => [...prev, response]);
        toast({
          title: "API Key Set",
          description: "Your Mistral API key has been set successfully.",
        });
      } else if (command.trim() === 'clear') {
        clearTerminal();
        clearCommandContext(); // Clear the command context when clearing the terminal
      } else {
        // Process the command and get the response
        const loadingId = `loading-${Date.now()}`;
        setOutputs(prev => [...prev, {
          id: loadingId,
          type: 'loading',
          content: 'Processing...',
          timestamp: new Date(),
        }]);
        
        const response = await processCommand(command, apiKey);
        
        // Clean up response content to make it more terminal-like
        let cleanedContent = response.message;
        if (typeof cleanedContent === 'string') {
          // Extract content from code blocks (triple backticks)
          const codeBlockRegex = /```(?:\w*\n)?([\s\S]*?)```/g;
          const codeMatches = [...cleanedContent.matchAll(codeBlockRegex)];
          
          if (codeMatches.length > 0) {
            // If we have code blocks, extract only their content
            cleanedContent = codeMatches.map(match => {
              // Clean up any $ prefix from command output
              return match[1].trim()
                .replace(/^\$ .*$/gm, '') // Remove lines starting with $
                .replace(/^user@ubuntu:.*\$ *$/gm, ''); // Remove Ubuntu prompt lines
            }).join('\n');
          } else {
            // Remove explanatory text patterns that don't belong in a terminal
            cleanedContent = cleanedContent
              .replace(/^Here's how .*$/gm, '')
              .replace(/^You can .*$/gm, '')
              .replace(/^To .*$/gm, '')
              .replace(/^This command .*$/gm, '')
              .replace(/^The command .*$/gm, '')
              .replace(/^In a real Ubuntu terminal.*$/gm, '')
              .replace(/^For more information.*$/gm, '')
              .replace(/^Remember .*$/gm, '')
              .replace(/.*explanation.*$/gm, '')
              .replace(/^\$ .*$/gm, '') // Remove lines starting with $
              .replace(/^user@ubuntu:.*\$ *$/gm, '') // Remove Ubuntu prompt lines
              .trim();
          }
        }
        
        // Update CD command handling to process the directory properly
        if (command.trim().startsWith('cd ') && !response.error) {
          // Extract directory path for cd command - improve the regex to be more precise
          const pathRegex = /(?:^|\n)\/[a-zA-Z0-9_/~.-]+(?:\n|$)/m;
          const match = pathRegex.exec(response.message.toString());
          if (match) {
            const newPath = match[0].trim();
            console.log('Extracted path:', newPath); // For debugging
            setCurrentDirectory(newPath);
            
            // Remove the path from the response to avoid duplication
            if (typeof cleanedContent === 'string') {
              cleanedContent = cleanedContent.replace(pathRegex, '').trim();
            }
          } else {
            console.log('No path match found in:', response.message.toString()); // Debug when no match
          }
        }
        
        // Remove loading indicator and add the response
        setOutputs(prev => {
          const filtered = prev.filter(item => item.id !== loadingId);
          return [...filtered, {
            id: `response-${Date.now()}`,
            type: response.error ? 'error' : 'response',
            content: cleanedContent,
            timestamp: new Date(),
          }];
        });
      }
    } catch (error) {
      console.error('Command error:', error);
      setOutputs(prev => [...prev, {
        id: `error-${Date.now()}`,
        type: 'error',
        content: 'An unexpected error occurred while processing your command.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTabCompletion = async (partialPath: string) => {
    if (!apiKey) return;
    
    setIsProcessing(true);
    
    try {
      // Create a tab completion command
      const tabCommand = `compgen -f "${partialPath}" || echo "No matches found"`;
      const response = await processCommand(tabCommand, apiKey);
      
      // Return the completions (this will be handled by the TerminalInput component)
      setIsProcessing(false);
      return response.error ? [] : response.message.toString().split('\n').filter(Boolean);
    } catch (error) {
      setIsProcessing(false);
      return [];
    }
  };

  const clearTerminal = () => {
    setOutputs([]);
  };

  return (
    <div className="w-full bg-terminal-background/80 backdrop-blur-md text-terminal-foreground rounded-lg overflow-hidden border border-terminal-foreground/10 shadow-lg transition-all duration-300 hover:shadow-xl">
      {/* Terminal header */}
      <div className="flex items-center px-4 py-2 bg-terminal-background/95 border-b border-terminal-foreground/5">
        <div className="flex space-x-2 mr-4">
          <span className="h-3 w-3 rounded-full bg-red-500 opacity-70"></span>
          <span className="h-3 w-3 rounded-full bg-yellow-500 opacity-70"></span>
          <span className="h-3 w-3 rounded-full bg-green-500 opacity-70"></span>
        </div>
        <div className="flex-1 text-center text-xs font-medium opacity-60">terminal ~ {currentDirectory}</div>
        <div className="text-xs opacity-60">{new Date().toLocaleTimeString()}</div>
      </div>
      
      {/* Terminal body */}
      <div 
        ref={terminalRef}
        className="p-4 h-[400px] md:h-[500px] overflow-y-auto terminal-scrollbar"
      >
        {outputs.map((output) => (
          <TerminalOutput 
            key={output.id} 
            item={output} 
          />
        ))}
        <div ref={bottomRef} />
        
        <TerminalInput 
          onSubmit={handleCommand}
          onTabCompletion={handleTabCompletion}
          isProcessing={isProcessing}
          commandHistory={history}
          navigateHistory={navigateHistory}
          currentPosition={currentPosition}
          clearTerminal={clearTerminal}
          currentDirectory={currentDirectory}
        />
      </div>
    </div>
  );
};

export default Terminal;
