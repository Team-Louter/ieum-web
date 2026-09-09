import { useState } from 'react';
import goodImg from '../../../assets/images/good.png';

/** 게시물 좋아요 상태를 전환하는 버튼입니다. */
function LikeButton() {
  const [isLiked, setIsLiked] = useState(false);
  const likeLabel = isLiked ? '좋아요 취소하기' : '좋아요';

  /** 좋아요 상태를 전환합니다. */
  function handleLikeToggle() {
    setIsLiked((currentIsLiked) => !currentIsLiked);
  }

  return (
    <button type="button" onClick={handleLikeToggle} className={isLiked ? 'is-active' : ''}>
      <img src={goodImg} alt="좋아요 아이콘"></img>
      <p>{likeLabel}</p>
    </button>
  );
}

export default LikeButton;
