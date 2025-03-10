
import React, { useState, useEffect, useRef } from 'react';
import TerminalInput from './TerminalInput';
import TerminalOutput from './TerminalOutput';
import { useCommandHistory } from '@/hooks/useCommandHistory';
import { processCommand } from '@/utils/terminalCommands';
import { toast } from '@/components/ui/use-toast';

export type OutputItem = {
  id: string;
  type: 'command' | 'response' | 'error' | 'info' | 'loading';
  content: string | React.ReactNode;
  timestamp: Date;
};

const Terminal = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [outputs, setOutputs] = useState<OutputItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
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
          <p className="text-terminal-accent font-bold">Welcome to Mistral CLI Emulator</p>
          <p>Type <span className="text-terminal-accent">'help'</span> to see available commands.</p>
          <p>To interact with Mistral AI, first set your API key with: <span className="text-terminal-accent">'api-key YOUR_API_KEY'</span></p>
        </div>
      ),
      timestamp: new Date(),
    };
    setOutputs([welcomeMessage]);
  }, []);

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
        
        // Remove loading indicator and add the response
        setOutputs(prev => {
          const filtered = prev.filter(item => item.id !== loadingId);
          return [...filtered, {
            id: `response-${Date.now()}`,
            type: response.error ? 'error' : 'response',
            content: response.message,
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
        <div className="flex-1 text-center text-xs font-medium opacity-60">mistral-cli ~ user@mistral</div>
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
          isProcessing={isProcessing}
          commandHistory={history}
          navigateHistory={navigateHistory}
          currentPosition={currentPosition}
          clearTerminal={clearTerminal}
        />
      </div>
    </div>
  );
};

export default Terminal;
