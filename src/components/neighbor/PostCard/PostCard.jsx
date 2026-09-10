import './PostCard.css';
import LikeButton from '../LikeButton/LikeButton';
import CommentButton from '../CommentButton/CommentButton';
import profileImg from '../../../assets/images/profile.png';

/** 게시물의 작성자, 미디어, 반응 버튼을 표시합니다. */
function PostCard({ contentImg, isCommentOpen, onCommentToggle }) {
  const postTitle = '게시물 제목';
  const postText = '게시물 내용';

  return (
    <div className="content-container">
      <div className="content-profile-container">
        <div>
          <img src={profileImg} alt="프로필 사진" />
          <p>아이디</p>
        </div>
        <a href="#">
          <p>프로필 보기</p>
        </a>
      </div>
      {contentImg ? (
        <img src={contentImg} className="content-video" alt="게시물 이미지" />
      ) : (
        <div className="content-video content-placeholder" aria-label="게시물 미리보기" />
      )}
      <div className="content-info-icon-container">
        <LikeButton />
        <CommentButton isOpen={isCommentOpen} onToggle={onCommentToggle} />
      </div>
      <div className="content-info-p">
        <p>{postTitle}</p>
        <p>{postText}</p>
      </div>
    </div>
  );
}

export default PostCard;
