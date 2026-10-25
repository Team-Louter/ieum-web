import { useState } from 'react';
import goodImg from '../../../assets/images/good.png';

/** 게시물 좋아요 상태를 전환하는 버튼입니다. */
function LikeButton({ isLiked: controlledIsLiked, likeCount, onToggle }) {
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
    <button type="button" onClick={handleLikeToggle} className={isLiked ? 'is-active' : ''}>
      <img src={goodImg} alt="좋아요 아이콘"></img>
      <p>
        {likeLabel}
        {likeCount == null ? '' : ` ${likeCount}`}
      </p>
    </button>
  );
}

export default LikeButton;
