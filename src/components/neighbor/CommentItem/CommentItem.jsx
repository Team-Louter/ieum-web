import { useState } from 'react';
import './CommentItem.css';

/** 작성자 정보와 댓글 내용을 표시합니다. 내 댓글이면 수정·삭제할 수 있습니다. */
function CommentItem({ profileImg, profileId, comment, isMine = false, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(comment);

  async function handleSubmit(event) {
    event.preventDefault();
    const content = draft.trim();
    if (!content || content === comment) {
      setIsEditing(false);
      return;
    }
    await onUpdate?.(content);
    setIsEditing(false);
  }

  return (
    <div className="comment">
      <div className="comment-profile-container">
        <img src={profileImg} alt="프로필 사진" />
        <p>{profileId}</p>
      </div>
      {isEditing ? (
        <form className="comment__edit" onSubmit={handleSubmit}>
          <input
            type="text"
            value={draft}
            maxLength={2000}
            onChange={(event) => setDraft(event.target.value)}
            aria-label="댓글 수정"
          />
          <button type="submit">저장</button>
          <button type="button" onClick={() => setIsEditing(false)}>
            취소
          </button>
        </form>
      ) : (
        <p>{comment}</p>
      )}
      {isMine && !isEditing && (
        <div className="comment__actions">
          <button
            type="button"
            onClick={() => {
              setDraft(comment);
              setIsEditing(true);
            }}
          >
            수정
          </button>
          <button type="button" onClick={() => onDelete?.()}>
            삭제
          </button>
        </div>
      )}
    </div>
  );
}

export default CommentItem;
