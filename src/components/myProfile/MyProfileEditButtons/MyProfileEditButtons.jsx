import { useState } from 'react';
import './MyProfileEditButtons.css';
import MyProfileEditModal from '../MyProfileEditModal/MyProfileEditModal';

/** 내 프로필을 수정하는 버튼을 표시합니다. */
function MyProfileEditButtons() {
  const [isMyProfileEditModalOpen, setIsMyProfileEditModalOpen] = useState(false);

  /** 프로필 수정 모달을 엽니다. */
  function handleProfileEditClick() {
    setIsMyProfileEditModalOpen(true);
  }

  /** 프로필 수정 모달을 닫습니다. */
  function handleMyProfileEditModalClose() {
    setIsMyProfileEditModalOpen(false);
  }

  return (
    <>
      <div className="my-profile-edit-buttons">
        <button type="button" onClick={handleProfileEditClick}>프로필 수정하기</button>
      </div>
      {isMyProfileEditModalOpen && (
        <MyProfileEditModal
          onCancel={handleMyProfileEditModalClose}
          onConfirm={handleMyProfileEditModalClose}
        />
      )}
    </>
  );
}

export default MyProfileEditButtons;
