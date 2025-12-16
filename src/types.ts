export type LLMProvider = 'openai' | 'anthropic' | 'ollama' | 'custom';

export interface UnlurkConfig {
  // LLM Provider
  provider?: LLMProvider;
  apiKey?: string;
  model?: string;
  baseUrl?: string;

  // Custom provider
  generateFn?: (prompt: string, context: UnlurkContext) => Promise<string>;

  // Behavior
  trigger?: 'focus' | 'hover' | 'auto';
  delay?: number;
  showEditButton?: boolean;
  showPostButton?: boolean;

  // Styling
  theme?: 'light' | 'dark' | 'auto';
  position?: 'inline' | 'overlay';

  // Callbacks
  onDraftGenerated?: (draft: string, context: UnlurkContext) => void;
  onPost?: (text: string, wasEdited: boolean) => void;
  onError?: (error: Error) => void;
}

export interface UnlurkContext {
  // User info
  userId?: string;
  userName?: string;
  userHistory?: string[];

  // Page info
  currentPage?: string;
  currentThread?: string;
  threadTitle?: string;
  threadContent?: string;

  // Community info
  communityName?: string;
  communityTone?: 'supportive' | 'professional' | 'casual' | 'technical';

  // Custom context
  [key: string]: unknown;
}

export interface EnhanceOptions {
  context?: UnlurkContext;
  placeholder?: string;
  promptTemplate?: string;
}

export interface UnlurkInstance {
  element: HTMLElement;
  input: HTMLInputElement | HTMLTextAreaElement;
  context: UnlurkContext;
  draft: string | null;
  isGenerating: boolean;
  destroy: () => void;
  /** @internal */
  _cleanup?: () => void;
}
