import './CommentItem.css';

/** 작성자 정보와 댓글 내용을 표시합니다. */
function CommentItem({ profileImg, profileId, comment }) {
  return (
    <div className="comment">
      <div className="comment-profile-container">
        <img src={profileImg} alt="프로필 사진" />
        <p>{profileId}</p>
      </div>
      <p>{comment}</p>
    </div>
  );
}

export default CommentItem;
