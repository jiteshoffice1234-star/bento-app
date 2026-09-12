import { AIMessage, AppSettings } from '../types';

export class AIService {
  async sendMessage(messages: AIMessage[], settings: AppSettings): Promise<string> {
    if (!settings.aiProvider || !settings.aiApiKey) {
      return "Connect an AI provider in Settings to unlock intelligent planning.";
    }

    try {
      if (settings.aiProvider === 'openai' || settings.aiProvider === 'custom') {
        const baseUrl = settings.aiProvider === 'openai' 
          ? 'https://api.openai.com/v1/chat/completions'
          : 'YOUR_CUSTOM_URL'; // Should ideally be configurable

        const response = await fetch(baseUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${settings.aiApiKey}`
          },
          body: JSON.stringify({
            model: settings.aiModel || 'gpt-4o',
            messages: messages.map(m => ({
              role: m.role,
              content: m.content
            }))
          })
        });

        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || "No response generated.";
      }
      
      return "Unsupported AI provider.";
    } catch (error) {
      console.error("AI Service Error:", error);
      return "I encountered an error trying to process your request. Please check your API key and connection.";
    }
  }
}

export const aiService = new AIService();
