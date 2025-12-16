import type { UnlurkContext } from '../types';
import type { LLMProviderInterface } from './base';
import { buildPrompt } from './base';

export class AnthropicProvider implements LLMProviderInterface {
  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor(apiKey: string, model = 'claude-3-haiku-20240307', baseUrl = 'https://api.anthropic.com') {
    this.apiKey = apiKey;
    this.model = model;
    this.baseUrl = baseUrl;
  }

  async generate(prompt: string, context: UnlurkContext): Promise<string> {
    const fullPrompt = buildPrompt(context);

    const response = await fetch(`${this.baseUrl}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 150,
        system: fullPrompt,
        messages: [{ role: 'user', content: prompt || 'Generate a draft post.' }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    return data.content[0]?.text?.trim() ?? '';
  }
}
