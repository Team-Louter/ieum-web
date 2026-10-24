import './ProfileActionButtons.css';

/** 다른 사용자 프로필에서 사용할 친구·채팅 버튼을 표시합니다. */
function ProfileActionButtons() {
  return (
    <div className="profile-action-buttons">
      <button>친구 추가하기</button>
      <button>채팅하기</button>
    </div>
  );
}

export default ProfileActionButtons;
