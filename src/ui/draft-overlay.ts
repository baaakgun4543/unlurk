export interface DraftOverlayOptions {
  draft: string;
  theme: 'light' | 'dark' | 'auto';
  showEditButton: boolean;
  showPostButton: boolean;
  onEdit: () => void;
  onPost: () => void;
}

export function createDraftOverlay(options: DraftOverlayOptions): HTMLElement {
  const { draft, theme, showEditButton, showPostButton, onEdit, onPost } = options;

  const overlay = document.createElement('div');
  overlay.className = `unlurk-draft-overlay ${getThemeClass(theme)}`;

  const textEl = document.createElement('div');
  textEl.className = 'unlurk-draft-text';
  textEl.textContent = draft;
  overlay.appendChild(textEl);

  const actions = document.createElement('div');
  actions.className = 'unlurk-actions';

  if (showEditButton) {
    const editBtn = document.createElement('button');
    editBtn.className = 'unlurk-btn unlurk-btn-edit';
    editBtn.textContent = 'Edit';
    editBtn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      onEdit();
    };
    actions.appendChild(editBtn);
  }

  if (showPostButton) {
    const postBtn = document.createElement('button');
    postBtn.className = 'unlurk-btn unlurk-btn-post';
    postBtn.textContent = 'Post';
    postBtn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      onPost();
    };
    actions.appendChild(postBtn);
  }

  overlay.appendChild(actions);

  return overlay;
}

export function createLoadingOverlay(theme: 'light' | 'dark' | 'auto'): HTMLElement {
  const overlay = document.createElement('div');
  overlay.className = `unlurk-draft-overlay ${getThemeClass(theme)}`;

  const loading = document.createElement('div');
  loading.className = 'unlurk-loading';

  const spinner = document.createElement('div');
  spinner.className = 'unlurk-spinner';
  loading.appendChild(spinner);

  const text = document.createElement('span');
  text.textContent = 'Generating draft...';
  loading.appendChild(text);

  overlay.appendChild(loading);

  return overlay;
}

function getThemeClass(theme: 'light' | 'dark' | 'auto'): string {
  if (theme === 'dark') return 'dark';
  if (theme === 'light') return '';

  // Auto-detect
  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return '';
}
