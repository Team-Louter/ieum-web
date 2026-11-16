import { useState } from 'react';
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
  const images = contentImg ? [contentImg] : post.images?.length ? post.images : post.image ? [post.image] : [];
  const [imageIndex, setImageIndex] = useState(0);
  const currentIndex = Math.min(imageIndex, Math.max(images.length - 1, 0));
  const image = images[currentIndex];

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
          <p>{author.nickname ?? ''}</p>
        </div>
        <Link
          to={
            post.profileHref ??
            (author.userId != null ? `/profile?userId=${author.userId}` : '/profile')
          }
        >
          <p>프로필 보기</p>
        </Link>
      </div>
      {image ? (
        <div className="content-media">
          <img src={image} className="content-video" alt={post.title ?? '게시물 이미지'} />
          {images.length > 1 && (
            <>
              <button
                type="button"
                className="content-media__nav content-media__nav--prev"
                onClick={() => setImageIndex((index) => (index - 1 + images.length) % images.length)}
                aria-label="이전 사진"
              >
                ‹
              </button>
              <button
                type="button"
                className="content-media__nav content-media__nav--next"
                onClick={() => setImageIndex((index) => (index + 1) % images.length)}
                aria-label="다음 사진"
              >
                ›
              </button>
              <p className="content-media__count" aria-live="polite">
                {currentIndex + 1} / {images.length}
              </p>
            </>
          )}
        </div>
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
