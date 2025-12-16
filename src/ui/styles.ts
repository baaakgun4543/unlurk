export const UNLURK_STYLES = `
.unlurk-container {
  position: relative;
  width: 100%;
}

.unlurk-draft-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  border-radius: inherit;
  display: flex;
  flex-direction: column;
  padding: 12px;
  box-sizing: border-box;
  animation: unlurk-fade-in 0.2s ease-out;
}

.unlurk-draft-overlay.dark {
  background: rgba(30, 30, 30, 0.95);
  color: #fff;
}

.unlurk-draft-text {
  flex: 1;
  font-size: inherit;
  line-height: 1.5;
  color: inherit;
  margin-bottom: 8px;
  white-space: pre-wrap;
}

.unlurk-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.unlurk-btn {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  border: none;
}

.unlurk-btn-edit {
  background: transparent;
  color: #666;
  border: 1px solid #ddd;
}

.unlurk-btn-edit:hover {
  background: #f5f5f5;
  border-color: #ccc;
}

.unlurk-btn-post {
  background: #2563eb;
  color: #fff;
}

.unlurk-btn-post:hover {
  background: #1d4ed8;
}

.unlurk-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #888;
  font-size: 13px;
}

.unlurk-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #e5e5e5;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: unlurk-spin 0.8s linear infinite;
}

.unlurk-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #2563eb;
  color: #fff;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 600;
}

@keyframes unlurk-fade-in {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes unlurk-spin {
  to {
    transform: rotate(360deg);
  }
}

/* Dark theme */
.unlurk-draft-overlay.dark .unlurk-btn-edit {
  color: #aaa;
  border-color: #444;
}

.unlurk-draft-overlay.dark .unlurk-btn-edit:hover {
  background: #333;
  border-color: #555;
}
`;

export function injectStyles(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById('unlurk-styles')) return;

  const style = document.createElement('style');
  style.id = 'unlurk-styles';
  style.textContent = UNLURK_STYLES;
  document.head.appendChild(style);
}
