import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  forwardRef,
  type TextareaHTMLAttributes,
  type InputHTMLAttributes,
} from 'react';
import type { UnlurkContext, UnlurkConfig } from 'unlurk';

export interface UnlurkInputProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onSubmit'> {
  context?: UnlurkContext;
  config?: Partial<UnlurkConfig>;
  onPost?: (text: string, wasEdited: boolean) => void;
  onDraftGenerated?: (draft: string) => void;
  promptTemplate?: string;
  as?: 'textarea' | 'input';
}

interface DraftState {
  text: string | null;
  isGenerating: boolean;
  isVisible: boolean;
}

export const UnlurkInput = forwardRef<
  HTMLTextAreaElement | HTMLInputElement,
  UnlurkInputProps
>(function UnlurkInput(
  {
    context = {},
    config = {},
    onPost,
    onDraftGenerated,
    promptTemplate,
    as = 'textarea',
    className,
    style,
    onFocus,
    onBlur,
    onChange,
    value: controlledValue,
    defaultValue,
    ...props
  },
  ref
) {
  const [draft, setDraft] = useState<DraftState>({
    text: null,
    isGenerating: false,
    isVisible: false,
  });
  const [internalValue, setInternalValue] = useState(defaultValue?.toString() || '');
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const providerRef = useRef<{ generate: (prompt: string, ctx: UnlurkContext) => Promise<string> } | null>(null);

  const value = controlledValue !== undefined ? controlledValue.toString() : internalValue;

  // Initialize provider on mount
  useEffect(() => {
    const initProvider = async () => {
      try {
        const unlurk = await import('unlurk');
        // Access the internal provider - this is a simplified approach
        // In production, we'd expose a proper API for this
        providerRef.current = {
          generate: async (prompt: string, ctx: UnlurkContext) => {
            // Use the configured provider from Unlurk
            const { OpenAIProvider, AnthropicProvider, OllamaProvider } = await import('unlurk');

            if (config.generateFn) {
              return config.generateFn(prompt, ctx);
            }

            let provider;
            if (config.provider === 'openai' && config.apiKey) {
              provider = new (OpenAIProvider as any)(config.apiKey, config.model, config.baseUrl);
            } else if (config.provider === 'anthropic' && config.apiKey) {
              provider = new (AnthropicProvider as any)(config.apiKey, config.model, config.baseUrl);
            } else if (config.provider === 'ollama') {
              provider = new (OllamaProvider as any)(config.model, config.baseUrl);
            } else {
              throw new Error('No provider configured');
            }

            return provider.generate(prompt, ctx);
          },
        };
      } catch (err) {
        console.error('[UnlurkInput] Failed to initialize:', err);
      }
    };

    initProvider();
  }, [config]);

  const generateDraft = useCallback(async () => {
    if (!providerRef.current || draft.isGenerating || draft.text || value.trim()) {
      return;
    }

    setDraft((prev) => ({ ...prev, isGenerating: true, isVisible: true }));

    try {
      const generatedText = await providerRef.current.generate(
        promptTemplate || 'Generate a draft post.',
        context
      );

      setDraft({
        text: generatedText,
        isGenerating: false,
        isVisible: true,
      });

      onDraftGenerated?.(generatedText);
    } catch (err) {
      console.error('[UnlurkInput] Generation failed:', err);
      setDraft({ text: null, isGenerating: false, isVisible: false });
    }
  }, [context, draft.isGenerating, draft.text, onDraftGenerated, promptTemplate, value]);

  const handleFocus = useCallback(
    (e: React.FocusEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      onFocus?.(e as React.FocusEvent<HTMLTextAreaElement>);

      const trigger = config.trigger || 'focus';
      const delay = config.delay ?? 500;

      if (trigger === 'focus') {
        timeoutRef.current = setTimeout(generateDraft, delay);
      }
    },
    [config.delay, config.trigger, generateDraft, onFocus]
  );

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      onBlur?.(e as React.FocusEvent<HTMLTextAreaElement>);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    },
    [onBlur]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      onChange?.(e as React.ChangeEvent<HTMLTextAreaElement>);
      setInternalValue(e.target.value);

      // Hide draft when user types
      if (draft.isVisible) {
        setDraft({ text: null, isGenerating: false, isVisible: false });
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    },
    [draft.isVisible, onChange]
  );

  const handleEdit = useCallback(() => {
    if (draft.text) {
      setInternalValue(draft.text);
      setDraft({ text: null, isGenerating: false, isVisible: false });
    }
  }, [draft.text]);

  const handlePost = useCallback(() => {
    if (draft.text) {
      onPost?.(draft.text, false);
      setDraft({ text: null, isGenerating: false, isVisible: false });
      setInternalValue('');
    }
  }, [draft.text, onPost]);

  const theme = config.theme || 'auto';
  const isDark =
    theme === 'dark' ||
    (theme === 'auto' &&
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-color-scheme: dark)').matches);

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    ...style,
  };

  const overlayStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: isDark ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
    borderRadius: 'inherit',
    display: 'flex',
    flexDirection: 'column',
    padding: 12,
    boxSizing: 'border-box',
    color: isDark ? '#fff' : 'inherit',
    animation: 'unlurk-fade-in 0.2s ease-out',
  };

  const actionsStyle: React.CSSProperties = {
    display: 'flex',
    gap: 8,
    justifyContent: 'flex-end',
    marginTop: 8,
  };

  const buttonBaseStyle: React.CSSProperties = {
    padding: '6px 12px',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    border: 'none',
  };

  const InputComponent = as === 'input' ? 'input' : 'textarea';

  return (
    <div style={containerStyle} className="unlurk-container">
      <InputComponent
        ref={ref as any}
        className={className}
        style={{ width: '100%', boxSizing: 'border-box' }}
        value={value}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        {...(props as any)}
      />

      {draft.isVisible && (
        <div style={overlayStyle}>
          {draft.isGenerating ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                flex: 1,
                color: '#888',
                fontSize: 13,
              }}
            >
              <span
                style={{
                  width: 16,
                  height: 16,
                  border: '2px solid #e5e5e5',
                  borderTopColor: '#2563eb',
                  borderRadius: '50%',
                  animation: 'unlurk-spin 0.8s linear infinite',
                }}
              />
              <span>Generating draft...</span>
            </div>
          ) : (
            <>
              <div style={{ flex: 1, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                {draft.text}
              </div>
              <div style={actionsStyle}>
                {config.showEditButton !== false && (
                  <button
                    type="button"
                    onClick={handleEdit}
                    style={{
                      ...buttonBaseStyle,
                      background: 'transparent',
                      color: isDark ? '#aaa' : '#666',
                      border: `1px solid ${isDark ? '#444' : '#ddd'}`,
                    }}
                  >
                    Edit
                  </button>
                )}
                {config.showPostButton !== false && (
                  <button
                    type="button"
                    onClick={handlePost}
                    style={{
                      ...buttonBaseStyle,
                      background: '#2563eb',
                      color: '#fff',
                    }}
                  >
                    Post
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}

      <style>{`
        @keyframes unlurk-fade-in {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes unlurk-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
});

export { UnlurkInput as default };

// Re-export types from main package
export type { UnlurkContext, UnlurkConfig } from 'unlurk';
