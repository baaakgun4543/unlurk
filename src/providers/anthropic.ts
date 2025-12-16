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
      const errorText = await response.text().catch(() => '');
      if (response.status === 429) {
        throw new Error('Anthropic rate limit exceeded. Please try again later.');
      }
      if (response.status === 401) {
        throw new Error('Invalid Anthropic API key.');
      }
      throw new Error(`Anthropic API error: ${response.status} ${errorText}`);
    }

    let data: unknown;
    try {
      data = await response.json();
    } catch {
      throw new Error('Failed to parse Anthropic response');
    }

    const text = (data as { content?: { text?: string }[] })?.content?.[0]?.text;

    if (typeof text !== 'string') {
      throw new Error('Invalid response format from Anthropic');
    }

    return text.trim();
  }
}
