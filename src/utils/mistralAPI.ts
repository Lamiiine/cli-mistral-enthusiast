import { toast } from '@/components/ui/use-toast';
import { getCommandContext, addToCommandContext } from './commandContext';

// API endpoint for Mistral
const MISTRAL_API_ENDPOINT = 'https://api.mistral.ai/v1/chat/completions';

interface MistralResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const fetchMistralResponse = async (
  prompt: string,
  apiKey: string,
  systemPrompt = `You are an Ubuntu Linux terminal emulator. CRITICAL RULES:
1. ONLY output the EXACT command result as seen in a real Ubuntu terminal
2. NO explanations, descriptions, or markdown formatting outside code blocks
3. Put ALL command output in a single triple backtick code block with NO language specifier
4. For directory navigation, include ONLY the absolute path on a separate line
5. NEVER add commentary before or after the output
6. NEVER explain what the command does
7. NEVER use phrases like "In a real Ubuntu terminal..." or "The output would be..."
8. For tab completion, show ONLY matching file/directory names WITHOUT any explanation
9. Keep error messages EXACTLY as they would appear in Ubuntu
10. For 'ls', 'pwd', or similar commands, just output the results WITHOUT explanation
11. Return ONLY the terminal output, nothing else
12. START in /home/user directory`
): Promise<{ message: string; error: boolean }> => {
  if (!apiKey) {
    return {
      message: "Error: API key not set. Please set your Mistral API key with the command: api-key YOUR_API_KEY",
      error: true,
    };
  }

  try {
    const context = getCommandContext();
    const userPrompt = context ? 
      `Previous terminal session:\n${context}\n\nNew command: ${prompt}` : 
      prompt;
    
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    console.log('Sending request to Mistral API with key:', apiKey.substring(0, 4) + '...');
    
    const requestBody = {
      model: 'mistral-tiny',  // Using the free tier model
      messages,
      temperature: 0.7,
      max_tokens: 1000
    };
    
    console.log('Request body:', JSON.stringify(requestBody));

    const response = await fetch(MISTRAL_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Mistral API error response:', errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        console.error('Could not parse error as JSON:', e);
      }
      
      // Handle common error cases
      if (response.status === 401) {
        return {
          message: "Error: Invalid API key. Please check your API key and try again.",
          error: true,
        };
      } else if (response.status === 429) {
        return {
          message: "Error: Rate limit exceeded. Please try again later.",
          error: true,
        };
      } else if (response.status === 403) {
        return {
          message: "Error: Access forbidden. Your API key may not have the required permissions.",
          error: true,
        };
      }
      
      return {
        message: `Error: ${errorData?.error?.message || errorText || 'An error occurred while communicating with Mistral API.'}`,
        error: true,
      };
    }

    const responseText = await response.text();
    console.log('Response text:', responseText);
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse response as JSON:', e);
      return {
        message: "Error: Received invalid response from Mistral API.",
        error: true,
      };
    }
    
    const aiResponse = data.choices[0]?.message.content || "No response from Mistral.";
    
    addToCommandContext(prompt, aiResponse);
    
    return {
      message: aiResponse,
      error: false,
    };
  } catch (error) {
    console.error('Error fetching from Mistral API:', error);
    return {
      message: `Error: Failed to connect to Mistral API. ${error.message || 'Please check your internet connection and try again.'}`,
      error: true,
    };
  }
};
