import { useEffect } from 'react';
import './ConfirmationModal.css';
import closeIcon from '../../../assets/images/close.svg';

/** 게시물 삭제 여부를 확인하는 모달을 표시합니다. */
function ConfirmationModal({ onCancel, onConfirm }) {
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
        <p id="confirmation-modal-title">정말로 게시물을 삭제하시겠습니까?</p>
        <div className="confirmation-modal__button-group">
          <button type="button" onClick={onCancel}>
            취소하기
          </button>
          <button type="button" onClick={onConfirm}>
            삭제하기
          </button>
        </div>
      </section>
    </div>
  );
}

export default ConfirmationModal;
