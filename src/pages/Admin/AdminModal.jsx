import { useEffect, useRef } from 'react';

// 관리자 화면에서 등록·수정 폼을 띄우는 모달입니다. Esc나 닫기 버튼으로 닫습니다.
function AdminModal({ title, onClose, children }) {
  const dialogRef = useRef(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.querySelector('input, textarea')?.focus();

    function handleKeyDown(event) {
      if (event.key === 'Escape') onCloseRef.current();
    }
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="admin-modal-overlay">
      <div
        className="admin-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-modal-title"
        ref={dialogRef}
      >
        <header className="admin-modal__header">
          <h2 id="admin-modal-title">{title}</h2>
          <button type="button" className="admin-modal__close" aria-label="닫기" onClick={onClose}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <path d="M5 5l14 14M19 5L5 19" />
            </svg>
          </button>
        </header>
        {children}
      </div>
    </div>
  );
}

export default AdminModal;
