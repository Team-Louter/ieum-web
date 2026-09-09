import CommentModal from '../CommentModal/CommentModal';
import CommentItem from '../CommentItem/CommentItem';
import commentImg from '../../../assets/images/comment.png';
import profileImg from '../../../assets/images/profile.png';
import './CommentButton.css';

/** 게시물별 댓글 모달을 열거나 닫는 버튼입니다. */
function CommentButton({ isOpen = false, onToggle }) {
  const commentModal =
    isOpen ? (
      <CommentModal onClose={onToggle}>
        <CommentItem profileImg={profileImg} profileId="아이디" comment="댓글" />
        <CommentItem profileImg={profileImg} profileId="아이디" comment="애국가 1절 동해물과 백두산이 마르고 닳도록 하느님이 보우하사 우리나라 만세 무궁화 삼천리 화려 강산 대한 사람 대한으로 길이 보전하세" />
        <CommentItem profileImg={profileImg} profileId="아이디" comment="댓글" />
        <CommentItem profileImg={profileImg} profileId="아이디" comment="댓글" />
        <CommentItem profileImg={profileImg} profileId="아이디" comment="댓글" />
        <CommentItem profileImg={profileImg} profileId="아이디" comment="댓글" />
        <CommentItem profileImg={profileImg} profileId="아이디" comment="댓글" />
        <CommentItem profileImg={profileImg} profileId="아이디" comment="댓글" />
        <CommentItem profileImg={profileImg} profileId="아이디" comment="댓글" />
        <CommentItem profileImg={profileImg} profileId="아이디" comment="댓글" />
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
