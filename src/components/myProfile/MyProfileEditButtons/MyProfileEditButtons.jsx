import { useState } from 'react';
import './MyProfileEditButtons.css';
import MyProfileEditModal from '../MyProfileEditModal/MyProfileEditModal';

/** 내 프로필을 수정하는 버튼을 표시합니다. */
function MyProfileEditButtons({ profile = {}, onProfileUpdate }) {
  const [isMyProfileEditModalOpen, setIsMyProfileEditModalOpen] = useState(false);
  const [updateError, setUpdateError] = useState('');

  /** 프로필 수정 모달을 엽니다. */
  function handleProfileEditClick() {
    setUpdateError('');
    setIsMyProfileEditModalOpen(true);
  }

  /** 프로필 수정 모달을 닫습니다. */
  function handleMyProfileEditModalClose() {
    setIsMyProfileEditModalOpen(false);
  }

  async function handleProfileConfirm(updatedProfile) {
    try {
      await onProfileUpdate?.(updatedProfile);
      handleMyProfileEditModalClose();
    } catch (error) {
      setUpdateError(error?.message ?? '프로필을 수정하지 못했습니다.');
    }
  }

  return (
    <>
      <div className="my-profile-edit-buttons">
        <button type="button" onClick={handleProfileEditClick}>
          프로필 수정하기
        </button>
      </div>
      {isMyProfileEditModalOpen && (
        <MyProfileEditModal
          profile={profile}
          onCancel={handleMyProfileEditModalClose}
          onConfirm={handleProfileConfirm}
          errorMessage={updateError}
        />
      )}
    </>
  );
}

export default MyProfileEditButtons;
