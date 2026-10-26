import { useState } from 'react';
import './LikeButton.css';

/** 게시물 좋아요 상태를 전환하는 버튼입니다. */
function LikeButton({ isLiked: controlledIsLiked, likeCount = 0, onToggle }) {
  const [localIsLiked, setLocalIsLiked] = useState(false);
  const isControlled = controlledIsLiked !== undefined && typeof onToggle === 'function';
  const isLiked = isControlled ? controlledIsLiked : localIsLiked;
  const likeLabel = isLiked ? '좋아요 취소하기' : '좋아요';

  /** 좋아요 상태를 전환합니다. */
  function handleLikeToggle() {
    const nextIsLiked = !isLiked;
    if (!isControlled) setLocalIsLiked(nextIsLiked);
    onToggle?.(nextIsLiked);
  }

  return (
    <button
      type="button"
      onClick={handleLikeToggle}
      className={`like-button${isLiked ? ' is-active' : ''}`}
      aria-label={likeLabel}
      aria-pressed={isLiked}
    >
      <svg
        className="like-button__icon"
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z" />
      </svg>
      <span>{likeCount}</span>
    </button>
  );
}

export default LikeButton;
