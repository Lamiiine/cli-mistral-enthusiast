import { cliKnowledge } from './knowledgeBase';
import { FileSystemSimulator } from './fileSystem';

interface AgentResponse {
  response: string;
  context?: any;
  suggestedCommands?: string[];
}

export class CLIAgent {
  private context: Map<string, any> = new Map();
  private fs: FileSystemSimulator;

  constructor() {
    this.fs = new FileSystemSimulator();
  }

  async processInput(input: string): Promise<AgentResponse> {
    const [command, ...args] = input.trim().split(' ');
    
    // Handle system commands
    switch (command) {
      case 'mkdir':
        return {
          response: this.fs.mkdir(args[0]),
          context: { currentDir: this.fs.pwd() }
        };
      
      case 'ls':
        return {
          response: this.fs.ls(),
          context: { currentDir: this.fs.pwd() }
        };
      
      case 'cd':
        return {
          response: this.fs.cd(args[0]),
          context: { currentDir: this.fs.pwd() }
        };
      
      case 'pwd':
        return {
          response: this.fs.pwd(),
          context: { currentDir: this.fs.pwd() }
        };
    }

    // Handle existing commands
    if (command in cliKnowledge.commands) {
      return {
        response: `Command recognized: ${command}`,
        context: cliKnowledge.commands[command],
        suggestedCommands: cliKnowledge.commands[command].examples
      };
    }

    return {
      response: cliKnowledge.errorMessages.unknownCommand,
      suggestedCommands: Object.keys(cliKnowledge.commands).map(cmd => 
        `$ ${cmd} ${cliKnowledge.commands[cmd].usage.split(' ').slice(1).join(' ')}`
      )
    };
  }

  // Add method to enhance Mistral's context
  async enhanceMistralPrompt(originalPrompt: string): Promise<string> {
    return `
      Context: You are in a CLI environment with these available commands:
      ${JSON.stringify(Object.keys(cliKnowledge.commands))}
      
      User input: ${originalPrompt}
      
      Remember to:
      1. Format command examples with $ prefix
      2. Only suggest available commands
      3. Keep responses concise and terminal-friendly
    `;
  }
} 