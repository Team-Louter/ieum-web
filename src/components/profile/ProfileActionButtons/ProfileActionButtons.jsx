import './ProfileActionButtons.css';

/** 다른 사용자 프로필에서 사용할 친구·채팅 버튼을 표시합니다. */
function ProfileActionButtons({ userId = null, currentUserId = null, onAddFriend, onStartChat }) {
  const isMine = userId != null && String(userId) === String(currentUserId);
  const disabled = userId == null || isMine;

  return (
    <div className="profile-action-buttons">
      <button type="button" disabled={disabled} onClick={() => onAddFriend?.(userId)}>
        친구 추가하기
      </button>
      <button type="button" disabled={disabled} onClick={() => onStartChat?.(userId)}>
        채팅하기
      </button>
    </div>
  );
}

export default ProfileActionButtons;
