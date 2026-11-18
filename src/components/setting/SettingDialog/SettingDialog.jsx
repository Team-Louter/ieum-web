import { createPortal } from 'react-dom';
import { useEffect } from 'react';
import './SettingDialog.css';

function SettingDialog({
  title,
  description,
  onClose,
  children,
  className = '',
  backdropClassName = '',
}) {
  useEffect(() => {
    const closeOnEscape = (event) => {
      // 사진 자르기 창이 열려 있으면 그 창만 닫히도록 합니다.
      if (event.key === 'Escape' && !document.querySelector('.image-crop-modal')) onClose?.();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  // 다이얼로그를 body에 직접 띄우므로, 다크 모드는 설정 화면에서 읽어 와 클래스로 전달합니다.
  const isDark = Boolean(document.querySelector('.settings-layout--dark'));

  return createPortal(
    <div
      className={`setting-dialog-backdrop${isDark ? ' setting-dialog-backdrop--dark' : ''}${backdropClassName ? ` ${backdropClassName}` : ''}`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <section
        className={`setting-dialog${className ? ` ${className}` : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="setting-dialog-title"
      >
        <header className="setting-dialog__header">
          <div>
            <h2 id="setting-dialog-title">{title}</h2>
            {description && <p>{description}</p>}
          </div>
          <button
            type="button"
            className="setting-dialog__close"
            onClick={onClose}
            aria-label="닫기"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <path d="M5 5l14 14M19 5L5 19" />
            </svg>
          </button>
        </header>
        <div className="setting-dialog__content">{children}</div>
      </section>
    </div>,
    document.body,
  );
}

export default SettingDialog;
