import './PostCard.css';
import LikeButton from '../LikeButton/LikeButton';
import CommentButton from '../CommentButton/CommentButton';
import profileImg from '../../../assets/images/profile.png';
import { Link } from 'react-router-dom';

/** 게시물의 작성자, 미디어, 반응 버튼을 표시합니다. */
function PostCard({
  post = {},
  contentImg,
  isCommentOpen,
  onCommentToggle,
  onLikeToggle,
  onSubmitComment,
  currentLoginId,
  onUpdateComment,
  onDeleteComment,
  isLoading = false,
  apiError = '',
}) {
  const author = post.author ?? {};
  const image = contentImg ?? post.image;

  return (
    <div className="content-container">
      <div className="content-profile-container">
        <div>
          <img
            src={author.profileImage || author.profile_image || author.profileImageUrl || profileImg}
            alt="프로필 사진"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = profileImg;
            }}
          />
          <p>{author.id ?? author.nickname ?? ''}</p>
        </div>
        <Link to={post.profileHref ?? '/profile'}>
          <p>프로필 보기</p>
        </Link>
      </div>
      {image ? (
        <img src={image} className="content-video" alt={post.title ?? '게시물 이미지'} />
      ) : (
        <div className="content-video content-placeholder" aria-label="게시물 미리보기" />
      )}
      <div className="content-info-icon-container">
        <LikeButton
          isLiked={post.isLiked}
          likeCount={post.likeCount}
          onToggle={onLikeToggle}
        />
        <CommentButton
          isOpen={isCommentOpen}
          onToggle={onCommentToggle}
          comments={post.comments}
          onSubmitComment={onSubmitComment}
          currentLoginId={currentLoginId}
          onUpdateComment={onUpdateComment}
          onDeleteComment={onDeleteComment}
          isLoading={isLoading}
          apiError={apiError}
        />
      </div>
      <div className="content-info-p">
        <p>{post.title ?? ''}</p>
        <p>{post.content ?? ''}</p>
      </div>
    </div>
  );
}

export default PostCard;
