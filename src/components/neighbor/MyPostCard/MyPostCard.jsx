import { useState } from 'react';
import './MyPostCard.css';
import ConfirmationModal from '../../common/ConfirmationModal/ConfirmationModal';

/** 내 게시물 목록에서 한 게시물을 표시합니다. */
function MyPostCard({ post = {}, onDelete }) {
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  /** 삭제 확인 모달을 엽니다. */
  function handleDeleteClick(event) {
    event.stopPropagation();
    setIsConfirmationOpen(true);
  }

  /** 삭제 확인 모달을 닫습니다. */
  function handleConfirmationClose() {
    setIsConfirmationOpen(false);
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
      <button type="button" onClick={handleDeleteClick}>
        삭제하기
      </button>
      {isConfirmationOpen && (
        <ConfirmationModal onCancel={handleConfirmationClose} onConfirm={handleDeleteConfirm} />
      )}
    </div>
  );
}

export default MyPostCard;
