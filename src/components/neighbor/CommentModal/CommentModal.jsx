import './CommentModal.css';
import closeImg from '../../../assets/images/close.png';

/** 댓글 목록과 댓글 입력 영역을 표시하는 모달입니다. */
function CommentModal({ children, onClose }) {
  return (
    <section className="comment-modal" aria-label="댓글">
      <div className="comment-modal__panel">
        <button type="button" onClick={onClose} className="comment-modal__close" aria-label="댓글 창 닫기">
          <img src={closeImg} alt="닫기 아이콘" />
        </button>
        <div className="comment-modal__list">{children}</div>
        <form className="comment-modal__form">
          <input type="text" placeholder="댓글 입력하기" className="comment-modal__input" />
          <button type="button" className="comment-modal__submit">
            올리기
          </button>
        </form>
      </div>
    </section>
  );
}

export default CommentModal;
