import { useState } from 'react';
import './MyProfileEditButtons.css';
import ProfileEditModal from '../ProfileEditModal/ProfileEditModal';

/** 내 프로필을 수정하는 버튼을 표시합니다. */
function MyProfileEditButtons() {
  const [isProfileEditModalOpen, setIsProfileEditModalOpen] = useState(false);

  /** 프로필 수정 모달을 엽니다. */
  function handleProfileEditClick() {
    setIsProfileEditModalOpen(true);
  }

  /** 프로필 수정 모달을 닫습니다. */
  function handleProfileEditModalClose() {
    setIsProfileEditModalOpen(false);
  }

  return (
    <>
      <div id="profile-info-button">
        <button type="button" onClick={handleProfileEditClick}>프로필 수정하기</button>
      </div>
      {isProfileEditModalOpen && (
        <ProfileEditModal
          onCancel={handleProfileEditModalClose}
          onConfirm={handleProfileEditModalClose}
        />
      )}
    </>
  );
}

export default MyProfileEditButtons;
