import CommentModal from '../CommentModal/CommentModal';
import CommentItem from '../CommentItem/CommentItem';
import commentImg from '../../../assets/images/comment.png';
import profileImg from '../../../assets/images/profile.png';
import { dummyComments } from '../../../constants/dummy/dummyComments';
import './CommentButton.css';

/** 게시물별 댓글 모달을 열거나 닫는 버튼입니다. */
function CommentButton({ isOpen = false, onToggle }) {
  const commentModal =
    isOpen ? (
      <CommentModal onClose={onToggle}>
        {dummyComments.map(({ id, profileId, content }) => (
          <CommentItem key={id} profileImg={profileImg} profileId={profileId} comment={content} />
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
