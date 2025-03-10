export const cliKnowledge = {
  commands: {
    help: {
      description: "Display available commands",
      usage: "$ help",
      examples: ["$ help"]
    },
    clear: {
      description: "Clear terminal screen",
      usage: "$ clear",
      examples: ["$ clear", "Use Ctrl+L as shortcut"]
    },
    "api-key": {
      description: "Set Mistral API key",
      usage: "$ api-key YOUR_API_KEY",
      examples: ["$ api-key abc123xyz"]
    },
    mistral: {
      description: "Send prompt to Mistral AI",
      usage: "$ mistral [PROMPT]",
      examples: [
        "$ mistral Hello, how are you?",
        "$ mistral Write a Python function"
      ]
    },
    mkdir: {
      description: "Create a new directory",
      usage: "$ mkdir [directory_name]",
      examples: ["$ mkdir test", "$ mkdir my_folder"]
    },
    ls: {
      description: "List directory contents",
      usage: "$ ls [path]",
      examples: ["$ ls", "$ ls ./"]
    },
    cd: {
      description: "Change directory",
      usage: "$ cd [path]",
      examples: ["$ cd ..", "$ cd my_folder"]
    },
    pwd: {
      description: "Print working directory",
      usage: "$ pwd",
      examples: ["$ pwd"]
    },
    // ... other commands
  },
  errorMessages: {
    unknownCommand: "Command not found. Type '$ help' to see available commands.",
    apiKeyMissing: "Please set your API key first with: $ api-key YOUR_API_KEY",
    // ... other error messages
  }
}; 