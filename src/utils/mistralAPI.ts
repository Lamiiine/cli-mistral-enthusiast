
import { toast } from '@/components/ui/use-toast';

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
  systemPrompt = "You are a helpful AI assistant in a CLI environment. Keep responses concise and well-formatted for terminal display."
): Promise<{ message: string; error: boolean }> => {
  if (!apiKey) {
    return {
      message: "Error: API key not set. Please set your Mistral API key with the command: api-key YOUR_API_KEY",
      error: true,
    };
  }

  try {
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ];

    const response = await fetch(MISTRAL_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'mistral-tiny',  // Using the free tier model
        messages,
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Mistral API error:', errorData);
      
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
      }
      
      return {
        message: `Error: ${errorData.error?.message || 'An error occurred while communicating with Mistral API.'}`,
        error: true,
      };
    }

    const data: MistralResponse = await response.json();
    const aiResponse = data.choices[0]?.message.content || "No response from Mistral.";
    
    return {
      message: aiResponse,
      error: false,
    };
  } catch (error) {
    console.error('Error fetching from Mistral API:', error);
    return {
      message: "Error: Failed to connect to Mistral API. Please check your internet connection and try again.",
      error: true,
    };
  }
};
