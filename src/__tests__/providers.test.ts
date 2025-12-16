import { describe, it, expect } from 'vitest';
import { buildPrompt } from '../providers/base';

describe('buildPrompt', () => {
  it('should build a basic prompt without context', () => {
    const prompt = buildPrompt({});
    expect(prompt).toContain('helping a user write their first post');
    expect(prompt).toContain('Keep it under 2-3 sentences');
  });

  it('should include user context in prompt', () => {
    const prompt = buildPrompt({
      userName: 'Alice',
      communityName: 'Test Community',
      communityTone: 'supportive',
    });

    expect(prompt).toContain("User's name: Alice");
    expect(prompt).toContain('Community: Test Community');
    expect(prompt).toContain('Tone: supportive');
  });

  it('should handle user history array', () => {
    const prompt = buildPrompt({
      userHistory: ['joined 6 months ago', 'active reader'],
    });

    expect(prompt).toContain('User background: joined 6 months ago, active reader');
  });

  it('should truncate long thread content', () => {
    const longContent = 'a'.repeat(1000);
    const prompt = buildPrompt({
      threadContent: longContent,
    });

    // Should be truncated to 500 chars
    expect(prompt).toContain('a'.repeat(500));
    expect(prompt).not.toContain('a'.repeat(501));
  });

  it('should use custom template when provided', () => {
    const prompt = buildPrompt(
      { userName: 'Bob', topic: 'cooking' },
      'Hello {{userName}}, let us talk about {{topic}}!'
    );

    expect(prompt).toBe('Hello Bob, let us talk about cooking!');
  });

  it('should prevent prototype pollution in custom templates', () => {
    const prompt = buildPrompt(
      { userName: 'Test' },
      'User: {{userName}}, Proto: {{__proto__}}, Constructor: {{constructor}}'
    );

    expect(prompt).toBe('User: Test, Proto: , Constructor: ');
  });

  it('should only access own properties in custom templates', () => {
    const context = { userName: 'Test' };
    const prompt = buildPrompt(context, '{{userName}} {{toString}}');

    // toString exists on prototype but should not be accessed
    expect(prompt).toBe('Test ');
  });

  it('should handle missing keys in custom templates gracefully', () => {
    const prompt = buildPrompt(
      { userName: 'Test' },
      'Hello {{userName}}, your ID is {{userId}}'
    );

    expect(prompt).toBe('Hello Test, your ID is ');
  });

  it('should handle array values in custom templates', () => {
    const prompt = buildPrompt(
      { tags: ['react', 'typescript', 'ai'] },
      'Tags: {{tags}}'
    );

    expect(prompt).toBe('Tags: react, typescript, ai');
  });
});
