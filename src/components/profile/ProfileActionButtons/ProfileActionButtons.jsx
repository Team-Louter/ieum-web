import './ProfileActionButtons.css';

/** 프로필 관련 주요 동작 버튼을 표시합니다. */
function ProfileActionButtons() {
  return (
    <div id='profile-info-button'>
      <button type="button">친구 추가하기</button>
      <button type="button">채팅하기</button>
    </div>
  );
}

export default ProfileActionButtons;
