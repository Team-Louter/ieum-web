import CommentModal from '../CommentModal/CommentModal';
import CommentItem from '../CommentItem/CommentItem';
import commentImg from '../../../assets/images/comment.png';
import profileImg from '../../../assets/images/profile.png';
import { dummyComments } from '../../../constants/dummy/dummyComments';
import './CommentButton.css';

/** 게시물별 댓글 모달을 열거나 닫는 버튼입니다. */
function CommentButton({
  isOpen = false,
  onToggle,
  comments = dummyComments,
  onSubmitComment,
}) {
  const commentModal =
    isOpen ? (
      <CommentModal onClose={onToggle} onSubmit={onSubmitComment}>
        {comments.map((comment, index) => (
          <CommentItem
            key={comment.id ?? index}
            profileImg={comment.profileImage ?? comment.profile_image ?? profileImg}
            profileId={comment.profileId ?? comment.author?.id ?? comment.nickname ?? ''}
            comment={comment.content ?? comment.text ?? ''}
          />
        ))}
      </CommentModal>
    ) : null;

  return (
    <>
      <button type="button" onClick={onToggle} aria-expanded={isOpen}>
        <img src={commentImg} alt="댓글 아이콘" />
        <p>댓글</p>
      </button>
      {commentModal}
    </>
  );
}

export default CommentButton;
