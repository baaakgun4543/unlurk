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
      const errorText = await response.text().catch(() => '');
      if (response.status === 404) {
        throw new Error(`Ollama model "${this.model}" not found. Run: ollama pull ${this.model}`);
      }
      throw new Error(`Ollama API error: ${response.status} ${errorText}`);
    }

    let data: unknown;
    try {
      data = await response.json();
    } catch {
      throw new Error('Failed to parse Ollama response');
    }

    const text = (data as { response?: string })?.response;

    if (typeof text !== 'string') {
      throw new Error('Invalid response format from Ollama');
    }

    return text.trim();
  }
}
