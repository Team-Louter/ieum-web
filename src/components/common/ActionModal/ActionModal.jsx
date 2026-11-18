import { createPortal } from 'react-dom';
import { useEffect, useRef } from 'react';
import './ActionModal.css';
import LoadingDots from '../LoadingDots/LoadingDots';

/**
 * 제목, 안내 문구, 닫기(X) 버튼과 버튼 두 개(주요 / 보조)가 있는 공용 모달입니다.
 * danger가 true면 주요 버튼이 빨간색(삭제 등 되돌릴 수 없는 동작)으로 보입니다.
 * Esc, 닫기(X), 바깥 영역을 누르면 onClose가 호출됩니다.
 */
function ActionModal({
  title,
  text,
  primaryLabel = '확인',
  secondaryLabel = '취소',
  onPrimary,
  onClose,
  isBusy = false,
  danger = false,
  children,
}) {
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(event) {
      if (event.key === 'Escape') onCloseRef.current?.();
    }
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return createPortal(
    <div
      className="action-modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <div
        className="action-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="action-modal-title"
      >
        <header className="action-modal__header">
          <h2 id="action-modal-title">{title}</h2>
          <button type="button" className="action-modal__close" aria-label="닫기" onClick={onClose}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <path d="M5 5l14 14M19 5L5 19" />
            </svg>
          </button>
        </header>
        {text && <p className="action-modal__text">{text}</p>}
        {children}
        <div className="action-modal__actions">
          <button
            type="button"
            className={`action-modal__button action-modal__button--primary${danger ? ' action-modal__button--danger' : ''}`}
            onClick={onPrimary}
            disabled={isBusy}
          >
            {isBusy ? (
              <>
                <span style={{ visibility: 'hidden' }}>{primaryLabel}</span>
                <span className="action-modal__busy">
                  <LoadingDots />
                </span>
              </>
            ) : (
              primaryLabel
            )}
          </button>
          <button type="button" className="action-modal__button" onClick={onClose}>
            {secondaryLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default ActionModal;
