import './ProfileActionButtons.css';

/** 다른 사용자 프로필에서 사용할 친구·채팅 버튼을 표시합니다. */
function ProfileActionButtons({ onAddFriend, onChat }) {
  return (
    <div className="profile-action-buttons">
      <button type="button" onClick={onAddFriend}>
        친구 추가하기
      </button>
      <button type="button" onClick={onChat}>
        채팅하기
      </button>
    </div>
  );
}

export default ProfileActionButtons;
