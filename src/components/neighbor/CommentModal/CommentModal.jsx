import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import './CommentModal.css';
import closeImg from '../../../assets/images/close.svg';
import Button from '../../common/Button/Button';
import useSubmitOnce from '../../../hooks/useSubmitOnce';

/** 댓글 목록과 댓글 입력 영역을 표시하는 모달입니다. */
function CommentModal({ children, onClose, onSubmit }) {
  const [comment, setComment] = useState('');
  // 모달이 열려 있는 동안 뒤 화면이 스크롤되지 않게 합니다.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    /** Escape 키 입력 시 댓글 모달을 닫습니다. */
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const [handleSubmit, isSubmitting] = useSubmitOnce(submitComment);

  async function submitComment(event) {
    event.preventDefault();
    const trimmedComment = comment.trim();
    if (!trimmedComment) return;
    setComment('');
    await onSubmit?.(trimmedComment);
  }

  return createPortal(
    <div
      className="comment-modal"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <section className="comment-modal__panel" role="dialog" aria-modal="true" aria-label="댓글">
        <button
          type="button"
          onClick={onClose}
          className="comment-modal__close"
          aria-label="댓글 창 닫기"
        >
          <img src={closeImg} alt="닫기 아이콘" />
        </button>
        <div className="comment-modal__list">{children}</div>
        <form className="comment-modal__form" onSubmit={handleSubmit}>
          <input
            type="text"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="댓글 입력하기"
            className="comment-modal__input"
          />
          <Button type="submit" className="comment-modal__submit" loading={isSubmitting} loadingText="댓글 올리는 중">
            올리기
          </Button>
        </form>
      </section>
    </div>,
    document.body,
  );
}

export default CommentModal;
