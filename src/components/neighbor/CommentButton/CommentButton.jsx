import CommentModal from '../CommentModal/CommentModal';
import CommentItem from '../CommentItem/CommentItem';
import commentImg from '../../../assets/images/comment.png';
import profileImg from '../../../assets/images/profile.png';
import EmptyState from '../../common/EmptyState/EmptyState';
import './CommentButton.css';

/** 게시물별 댓글 모달을 열거나 닫는 버튼입니다. */
function CommentButton({
  isOpen = false,
  onToggle,
  comments = [],
  onSubmitComment,
  currentLoginId,
  onUpdateComment,
  onDeleteComment,
  isLoading = false,
  apiError = '',
}) {
  const commentItems = Array.isArray(comments) ? comments : [];
  const commentModal = isOpen ? (
    <CommentModal onClose={onToggle} onSubmit={onSubmitComment}>
      {commentItems.length > 0 ? (
        commentItems.map((comment, index) => (
          <CommentItem
            key={comment.id ?? index}
            profileImg={comment.profileImage ?? comment.profile_image ?? profileImg}
            profileId={comment.profileId ?? comment.author?.id ?? comment.nickname ?? ''}
            comment={comment.content ?? comment.text ?? ''}
            isMine={Boolean(currentLoginId) && (comment.profileId ?? '') === currentLoginId && comment.id != null}
            onUpdate={(content) => onUpdateComment?.(comment, content)}
            onDelete={() => onDeleteComment?.(comment)}
          />
        ))
      ) : !isLoading && !apiError ? (
        <EmptyState
          compact
          title="아직 댓글이 없어요"
          description="첫 댓글을 남겨 대화를 시작해 보세요."
        />
      ) : null}
    </CommentModal>
  ) : null;

  return (
    <>
      <button type="button" onClick={onToggle} aria-expanded={isOpen}>
        <img src={commentImg} alt="댓글 아이콘" />
        <p>댓글{commentItems.length > 0 ? ` ${commentItems.length}` : ''}</p>
      </button>
      {commentModal}
    </>
  );
}

export default CommentButton;
