import type { UnlurkContext } from '../types';
import type { LLMProviderInterface } from './base';
import { buildPrompt } from './base';

export class OpenAIProvider implements LLMProviderInterface {
  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor(apiKey: string, model = 'gpt-4o-mini', baseUrl = 'https://api.openai.com/v1') {
    this.apiKey = apiKey;
    this.model = model;
    this.baseUrl = baseUrl;
  }

  async generate(prompt: string, context: UnlurkContext): Promise<string> {
    const fullPrompt = buildPrompt(context);

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: fullPrompt },
          { role: 'user', content: prompt || 'Generate a draft post.' },
        ],
        max_tokens: 150,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      if (response.status === 429) {
        throw new Error('OpenAI rate limit exceeded. Please try again later.');
      }
      if (response.status === 401) {
        throw new Error('Invalid OpenAI API key.');
      }
      throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
    }

    let data: unknown;
    try {
      data = await response.json();
    } catch {
      throw new Error('Failed to parse OpenAI response');
    }

    const content = (data as { choices?: { message?: { content?: string } }[] })
      ?.choices?.[0]?.message?.content;

    if (typeof content !== 'string') {
      throw new Error('Invalid response format from OpenAI');
    }

    return content.trim();
  }
}
