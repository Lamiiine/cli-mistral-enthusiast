
import React from 'react';
import { fetchMistralResponse } from './mistralAPI';

export interface CommandResponse {
  message: string | React.ReactNode;
  error: boolean;
}

export const processCommand = async (command: string, apiKey: string): Promise<CommandResponse> => {
  const cmd = command.trim().toLowerCase();
  const args = command.trim().split(' ').slice(1).join(' ');
  
  // Basic commands
  if (cmd === 'help') {
    return {
      message: (
        <div className="space-y-2">
          <p className="font-bold text-terminal-accent">Available Commands:</p>
          <ul className="space-y-1 pl-2">
            <li><span className="text-terminal-accent">help</span> - Display this help message</li>
            <li><span className="text-terminal-accent">clear</span> - Clear the terminal (or use Ctrl+L)</li>
            <li><span className="text-terminal-accent">api-key [KEY]</span> - Set your Mistral API key</li>
            <li><span className="text-terminal-accent">mistral [PROMPT]</span> - Send a prompt to Mistral AI</li>
            <li><span className="text-terminal-accent">about</span> - About this CLI emulator</li>
            <li><span className="text-terminal-accent">echo [TEXT]</span> - Display text</li>
            <li><span className="text-terminal-accent">date</span> - Display current date and time</li>
          </ul>
        </div>
      ),
      error: false,
    };
  }
  
  if (cmd === 'clear') {
    // The actual clearing is handled in Terminal.tsx
    return { message: '', error: false };
  }
  
  if (cmd === 'about') {
    return {
      message: (
        <div className="space-y-2">
          <p className="font-bold text-terminal-accent">Mistral CLI Emulator</p>
          <p>A web-based terminal emulator for interacting with Mistral AI.</p>
          <p>Designed for the developer relations role application to showcase UI/UX skills and API integration capabilities.</p>
          <p>Built with React, TypeScript, Tailwind CSS, and a passion for elegant design.</p>
          <p className="text-terminal-accent/80 text-sm mt-2">Version 1.0.0</p>
        </div>
      ),
      error: false,
    };
  }
  
  if (cmd === 'date') {
    return {
      message: new Date().toString(),
      error: false,
    };
  }
  
  if (cmd.startsWith('echo ')) {
    return {
      message: args,
      error: false,
    };
  }
  
  // Mistral AI command
  if (cmd.startsWith('mistral ')) {
    if (!args) {
      return {
        message: "Error: Please provide a prompt for Mistral AI.",
        error: true,
      };
    }
    
    try {
      return await fetchMistralResponse(args, apiKey);
    } catch (error) {
      console.error('Error in Mistral command:', error);
      return {
        message: "Error: Failed to communicate with Mistral AI. Please try again.",
        error: true,
      };
    }
  }
  
  // Handle unknown commands
  return {
    message: `Command not found: ${cmd}. Type 'help' to see available commands.`,
    error: true,
  };
};
