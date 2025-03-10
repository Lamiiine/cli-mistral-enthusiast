import React from 'react';
import { fetchMistralResponse } from './mistralAPI';

export interface CommandResponse {
  message: string | React.ReactNode;
  error: boolean;
}

export const processCommand = async (command: string, apiKey: string): Promise<CommandResponse> => {
  const cmd = command.trim().split(' ')[0].toLowerCase();
  
  // Handle a few system commands locally
  if (cmd === 'clear') {
    // The actual clearing is handled in Terminal.tsx
    return { message: '', error: false };
  }
  
  if (cmd === 'api-key') {
    const key = command.trim().split(' ').slice(1).join(' ');
    if (!key) {
      return {
        message: "Please provide an API key: api-key YOUR_API_KEY",
        error: true,
      };
    }
    return {
      message: "API key set successfully. You can now use the terminal.",
      error: false,
    };
  }
  
  // Special case for tab completion
  if (command.includes('compgen -f')) {
    // This is a special command for handling tab completion
    const { message, error } = await fetchMistralResponse(command, apiKey);
    return {
      message: message,
      error: error
    };
  }
  
  // Route everything else to Mistral
  if (apiKey) {
    // Keep track of command history to maintain context
    const { message, error } = await fetchMistralResponse(command, apiKey);
    
    return {
      message: (
        <div className="font-mono whitespace-pre-wrap">
          {message}
        </div>
      ),
      error: error,
    };
  } else {
    return {
      message: "Please set your API key first with: api-key YOUR_API_KEY",
      error: true,
    };
  }
};
