import { useState } from 'react';
import './MyPostCard.css';
import ConfirmationModal from '../../common/ConfirmationModal/ConfirmationModal';

/** 내 게시물 목록에서 한 게시물을 표시합니다. */
function MyPostCard({ post = {}, onDelete, onUpdate }) {
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(post.title ?? '');
  const [content, setContent] = useState(post.content ?? '');
  const [editError, setEditError] = useState('');

  /** 삭제 확인 모달을 엽니다. */
  function handleDeleteClick(event) {
    event.stopPropagation();
    setIsConfirmationOpen(true);
  }

  /** 삭제 확인 모달을 닫습니다. */
  function handleConfirmationClose() {
    setIsConfirmationOpen(false);
  }

  /** 수정 창을 엽니다. 현재 제목·내용을 채워 둡니다. */
  function handleEditClick(event) {
    event.stopPropagation();
    setTitle(post.title ?? '');
    setContent(post.content ?? '');
    setEditError('');
    setIsEditing(true);
  }

  async function handleEditSubmit(event) {
    event.preventDefault();
    try {
      await onUpdate?.(post, { title: title.trim(), content: content.trim() });
      setIsEditing(false);
    } catch (error) {
      setEditError(error?.message ?? '게시물을 수정하지 못했습니다.');
    }
  }

  function handleDeleteConfirm() {
    onDelete?.(post.id);
    handleConfirmationClose();
  }

  const cardStyle = post.image
    ? {
        backgroundImage: `url("${post.image}")`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
      }
    : undefined;

  return (
    <div className="my-content" style={cardStyle} aria-label={post.title || '내 게시물'}>
      {onUpdate && (
        <button type="button" className="my-content__edit" onClick={handleEditClick}>
          수정하기
        </button>
      )}
      <button type="button" onClick={handleDeleteClick}>
        삭제하기
      </button>
      {isEditing && (
        <div className="my-content-edit" role="presentation" onClick={(event) => event.stopPropagation()}>
          <form className="my-content-edit__panel" onSubmit={handleEditSubmit}>
            <h2>게시물 수정</h2>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="제목"
              aria-label="제목"
              required
            />
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="내용"
              aria-label="내용"
              rows={5}
              required
            />
            {editError && <p role="alert">{editError}</p>}
            <div className="my-content-edit__actions">
              <button type="button" onClick={() => setIsEditing(false)}>
                취소
              </button>
              <button type="submit">저장</button>
            </div>
          </form>
        </div>
      )}
      {isConfirmationOpen && (
        <ConfirmationModal onCancel={handleConfirmationClose} onConfirm={handleDeleteConfirm} />
      )}
    </div>
  );
}

export default MyPostCard;
