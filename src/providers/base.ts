import type { UnlurkContext } from '../types';

export interface LLMProviderInterface {
  generate(prompt: string, context: UnlurkContext): Promise<string>;
}

export function buildPrompt(context: UnlurkContext, customTemplate?: string): string {
  if (customTemplate) {
    return customTemplate.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      const value = context[key];
      if (Array.isArray(value)) return value.join(', ');
      return String(value ?? '');
    });
  }

  const parts: string[] = [];

  parts.push('You are helping a user write their first post in an online community.');
  parts.push('Generate a short, authentic draft that the user might want to post.');
  parts.push('The draft should sound natural and personal, not like AI wrote it.');
  parts.push('Keep it under 2-3 sentences.');
  parts.push('');

  if (context.communityName) {
    parts.push(`Community: ${context.communityName}`);
  }

  if (context.communityTone) {
    parts.push(`Tone: ${context.communityTone}`);
  }

  if (context.userName) {
    parts.push(`User's name: ${context.userName}`);
  }

  if (context.userHistory?.length) {
    parts.push(`User background: ${context.userHistory.join(', ')}`);
  }

  if (context.currentPage) {
    parts.push(`Current page: ${context.currentPage}`);
  }

  if (context.threadTitle) {
    parts.push(`Thread title: ${context.threadTitle}`);
  }

  if (context.threadContent) {
    parts.push(`Thread content: ${context.threadContent.slice(0, 500)}`);
  }

  parts.push('');
  parts.push('Write a draft post that this user might naturally write:');

  return parts.join('\n');
}
