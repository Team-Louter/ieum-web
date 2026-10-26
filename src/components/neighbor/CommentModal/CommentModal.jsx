import { useEffect, useState } from 'react';
import './CommentModal.css';
import closeImg from '../../../assets/images/close.svg';

/** 댓글 목록과 댓글 입력 영역을 표시하는 모달입니다. */
function CommentModal({ children, onClose, onSubmit }) {
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
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

  async function handleSubmit(event) {
    event.preventDefault();
    const trimmedComment = comment.trim();
    if (!trimmedComment || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      await onSubmit?.(trimmedComment);
      setComment('');
    } catch (failure) {
      setError(failure.message ?? '댓글을 등록하지 못했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="comment-modal" aria-label="댓글">
      <div className="comment-modal__panel">
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
          <button type="submit" disabled={submitting} className="comment-modal__submit">
            올리기
          </button>
        </form>
        {error && <p role="alert">{error}</p>}
      </div>
    </section>
  );
}

export default CommentModal;
