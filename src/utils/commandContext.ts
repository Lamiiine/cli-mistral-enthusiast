// Create a new file to maintain command context

let commandHistory: string[] = [];
const MAX_CONTEXT_LENGTH = 10; // Limit to avoid token overflow

export const addToCommandContext = (command: string, response: string) => {
  // Add the command and its response to history
  commandHistory.push(`$ ${command}\n${response}`);
  
  // Keep only the most recent commands
  if (commandHistory.length > MAX_CONTEXT_LENGTH) {
    commandHistory = commandHistory.slice(commandHistory.length - MAX_CONTEXT_LENGTH);
  }
};

export const getCommandContext = (): string => {
  return commandHistory.join('\n\n');
};

export const clearCommandContext = () => {
  commandHistory = [];
}; 