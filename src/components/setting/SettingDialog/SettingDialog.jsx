import { useEffect } from 'react';
import './SettingDialog.css';

function SettingDialog({ title, description, onClose, children, className = '' }) {
  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  return (
    <div
      className="setting-dialog-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <section className={`setting-dialog${className ? ` ${className}` : ''}`} role="dialog" aria-modal="true" aria-labelledby="setting-dialog-title">
        <header className="setting-dialog__header">
          <div>
            <h2 id="setting-dialog-title">{title}</h2>
            {description && <p>{description}</p>}
          </div>
          <button type="button" className="setting-dialog__close" onClick={onClose} aria-label="닫기">×</button>
        </header>
        <div className="setting-dialog__content">{children}</div>
      </section>
    </div>
  );
}

export default SettingDialog;
