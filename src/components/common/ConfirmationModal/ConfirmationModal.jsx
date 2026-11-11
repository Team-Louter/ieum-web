import { useEffect } from 'react';
import './ConfirmationModal.css';
import closeIcon from '../../../assets/images/close.svg';

/** 삭제 같은 되돌릴 수 없는 작업을 확인하는 공용 모달입니다. 문구와 버튼 이름만 바꿔 재사용합니다. */
function ConfirmationModal({
  message = '정말로 게시물을 삭제하시겠습니까?',
  confirmLabel = '삭제하기',
  cancelLabel = '취소하기',
  danger = true,
  onCancel,
  onConfirm,
}) {
  useEffect(() => {
    /** Escape 키 입력 시 확인 모달을 닫습니다. */
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onCancel();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  /** 배경을 클릭했을 때 확인 모달을 닫습니다. */
  function handleBackdropClick(event) {
    if (event.target === event.currentTarget) {
      onCancel();
    }
  }

  return (
    <div className="confirmation-modal" onClick={handleBackdropClick} role="presentation">
      <section
        className="confirmation-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-modal-title"
      >
        <button type="button" onClick={onCancel}>
          <img src={closeIcon} alt="닫기 아이콘" />
        </button>
        <p id="confirmation-modal-title">{message}</p>
        <div className="confirmation-modal__button-group">
          <button type="button" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={danger ? '' : 'confirmation-modal__confirm--primary'}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}

export default ConfirmationModal;
