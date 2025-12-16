import type { UnlurkContext } from '../types';
import type { LLMProviderInterface } from './base';
import { buildPrompt } from './base';

export class OllamaProvider implements LLMProviderInterface {
  private model: string;
  private baseUrl: string;

  constructor(model = 'llama3.2', baseUrl = 'http://localhost:11434') {
    this.model = model;
    this.baseUrl = baseUrl;
  }

  async generate(prompt: string, context: UnlurkContext): Promise<string> {
    const fullPrompt = buildPrompt(context);

    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        prompt: `${fullPrompt}\n\n${prompt || 'Generate a draft post.'}`,
        stream: false,
        options: {
          temperature: 0.8,
          num_predict: 150,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data = await response.json();
    return data.response?.trim() ?? '';
  }
}
