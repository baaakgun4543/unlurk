import type { UnlurkConfig, UnlurkContext, EnhanceOptions, UnlurkInstance } from './types';
import { OpenAIProvider, AnthropicProvider, OllamaProvider, type LLMProviderInterface } from './providers';
import { createDraftOverlay, createLoadingOverlay, injectStyles } from './ui';

let globalConfig: UnlurkConfig = {
  trigger: 'focus',
  delay: 500,
  showEditButton: true,
  showPostButton: true,
  theme: 'auto',
  position: 'inline',
};

let provider: LLMProviderInterface | null = null;
const instances: Map<HTMLElement, UnlurkInstance> = new Map();

export function init(config: UnlurkConfig): void {
  globalConfig = { ...globalConfig, ...config };

  // Warn about API key exposure in browser
  if (typeof window !== 'undefined' && config.apiKey && config.provider) {
    console.warn(
      '[Unlurk] Warning: Using API keys directly in the browser exposes them to users. ' +
        'Consider using a backend proxy for production.'
    );
  }

  // Initialize provider based on config
  if (config.generateFn) {
    provider = {
      generate: config.generateFn,
    };
  } else if (config.provider === 'openai' && config.apiKey) {
    provider = new OpenAIProvider(config.apiKey, config.model, config.baseUrl);
  } else if (config.provider === 'anthropic' && config.apiKey) {
    provider = new AnthropicProvider(config.apiKey, config.model, config.baseUrl);
  } else if (config.provider === 'ollama') {
    provider = new OllamaProvider(config.model, config.baseUrl);
  }

  // Inject styles
  injectStyles();
}

export function enhance(
  selector: string | HTMLElement,
  options: EnhanceOptions = {}
): UnlurkInstance | null {
  const element =
    typeof selector === 'string' ? document.querySelector<HTMLElement>(selector) : selector;

  if (!element) {
    console.warn(`[Unlurk] Element not found: ${selector}`);
    return null;
  }

  // Find the input element
  const input =
    element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement
      ? element
      : element.querySelector<HTMLInputElement | HTMLTextAreaElement>('input, textarea');

  if (!input) {
    console.warn(`[Unlurk] No input element found in: ${selector}`);
    return null;
  }

  // Check if already enhanced
  if (instances.has(element)) {
    return instances.get(element)!;
  }

  const instance: UnlurkInstance = {
    element,
    input,
    context: options.context || {},
    draft: null,
    isGenerating: false,
    destroy: () => destroyInstance(element),
  };

  instances.set(element, instance);

  // Setup trigger
  setupTrigger(instance, options);

  return instance;
}

function setupTrigger(instance: UnlurkInstance, options: EnhanceOptions): void {
  const { trigger, delay } = globalConfig;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let observer: IntersectionObserver | null = null;

  const triggerGeneration = () => {
    if (instance.isGenerating || instance.draft) return;
    if (instance.input.value.trim()) return; // Don't generate if user already typed

    timeoutId = setTimeout(() => {
      generateDraft(instance, options);
    }, delay);
  };

  const cancelGeneration = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  const handleInput = () => {
    cancelGeneration();
    hideDraft(instance);
  };

  if (trigger === 'focus') {
    instance.input.addEventListener('focus', triggerGeneration);
    instance.input.addEventListener('blur', cancelGeneration);
  } else if (trigger === 'hover') {
    instance.element.addEventListener('mouseenter', triggerGeneration);
    instance.element.addEventListener('mouseleave', cancelGeneration);
  } else if (trigger === 'auto') {
    // Generate immediately when element is in viewport
    observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          triggerGeneration();
          observer?.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(instance.element);
  }

  // Cancel if user starts typing
  instance.input.addEventListener('input', handleInput);

  // Store cleanup function for proper disposal
  instance._cleanup = () => {
    cancelGeneration();
    observer?.disconnect();

    if (trigger === 'focus') {
      instance.input.removeEventListener('focus', triggerGeneration);
      instance.input.removeEventListener('blur', cancelGeneration);
    } else if (trigger === 'hover') {
      instance.element.removeEventListener('mouseenter', triggerGeneration);
      instance.element.removeEventListener('mouseleave', cancelGeneration);
    }

    instance.input.removeEventListener('input', handleInput);
  };
}

async function generateDraft(instance: UnlurkInstance, options: EnhanceOptions): Promise<void> {
  if (!provider) {
    console.warn('[Unlurk] No provider configured. Call Unlurk.init() first.');
    return;
  }

  instance.isGenerating = true;

  // Show loading state
  const loadingOverlay = createLoadingOverlay(globalConfig.theme!);
  showOverlay(instance, loadingOverlay);

  try {
    const prompt = options.promptTemplate || 'Generate a draft post.';
    const draft = await provider.generate(prompt, instance.context);

    instance.draft = draft;
    instance.isGenerating = false;

    // Remove loading, show draft
    loadingOverlay.remove();
    showDraft(instance, draft);

    globalConfig.onDraftGenerated?.(draft, instance.context);
  } catch (error) {
    instance.isGenerating = false;
    loadingOverlay.remove();

    const err = error instanceof Error ? error : new Error(String(error));
    console.error('[Unlurk] Generation failed:', err);
    globalConfig.onError?.(err);
  }
}

function showOverlay(instance: UnlurkInstance, overlay: HTMLElement): void {
  // Wrap input if not already wrapped
  let container = instance.element.closest('.unlurk-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'unlurk-container';
    instance.element.parentNode?.insertBefore(container, instance.element);
    container.appendChild(instance.element);
  }

  container.appendChild(overlay);
}

function showDraft(instance: UnlurkInstance, draft: string): void {
  const overlay = createDraftOverlay({
    draft,
    theme: globalConfig.theme!,
    showEditButton: globalConfig.showEditButton!,
    showPostButton: globalConfig.showPostButton!,
    onEdit: () => {
      // Put draft in input and let user edit
      instance.input.value = draft;
      hideDraft(instance);
      instance.input.focus();
    },
    onPost: () => {
      // Submit the draft
      instance.input.value = draft;
      hideDraft(instance);

      globalConfig.onPost?.(draft, false);

      // Try to submit the form
      const form = instance.input.closest('form');
      if (form) {
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      }
    },
  });

  showOverlay(instance, overlay);
}

function hideDraft(instance: UnlurkInstance): void {
  const container = instance.element.closest('.unlurk-container');
  const overlay = container?.querySelector('.unlurk-draft-overlay');
  overlay?.remove();
  instance.draft = null;
}

function destroyInstance(element: HTMLElement): void {
  const instance = instances.get(element);
  if (!instance) return;

  // Clean up event listeners and observers
  instance._cleanup?.();

  hideDraft(instance);

  // Unwrap from container
  const container = element.closest('.unlurk-container');
  if (container) {
    container.parentNode?.insertBefore(element, container);
    container.remove();
  }

  instances.delete(element);
}

export function destroy(): void {
  instances.forEach((_, element) => destroyInstance(element));
  instances.clear();
}

export function getInstances(): Map<HTMLElement, UnlurkInstance> {
  return new Map(instances);
}
