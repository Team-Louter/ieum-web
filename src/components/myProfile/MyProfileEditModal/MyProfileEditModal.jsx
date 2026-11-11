import './MyProfileEditModal.css';
import { useEffect, useRef, useState } from 'react';
import profileImg from '../../../assets/images/profile.png';
import SettingDialog from '../../setting/SettingDialog/SettingDialog';

function MyProfileEditModal({ profile = {}, onCancel, onConfirm, errorMessage = '' }) {
  const previewUrlRef = useRef('');
  const [previewImage, setPreviewImage] = useState('');

  useEffect(
    () => () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    },
    [],
  );

  function handleProfileImageChange(event) {
    const selectedImage = event.target.files?.[0];
    if (!selectedImage) return;

    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = URL.createObjectURL(selectedImage);
    setPreviewImage(previewUrlRef.current);
  }

  function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const selectedProfileImage = formData.get('profileImage');
    onConfirm?.({
      nickname: formData.get('nickname'),
      introduction: formData.get('introduction'),
      profileImage: selectedProfileImage?.size ? selectedProfileImage : undefined,
      profileImageUrl:
        profile.profileImageUrl ?? profile.profileImage ?? profile.profile_image ?? '',
    });
  }

  return (
    <SettingDialog
      title="프로필 수정"
      onClose={onCancel}
      className="profile-edit-modal-dialog"
    >
      <form onSubmit={handleSubmit}>
        <div id="input-container">
          <div id="profile-image-input-container">
            <img
              src={
                previewImage ||
                profile.profileImage ||
                profile.profile_image ||
                profile.profileImageUrl ||
                profileImg
              }
              alt="프로필 사진"
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = profileImg;
              }}
            />
            <label htmlFor="profile-image-input">
              <div id="profile-image-input-label">프로필 사진 수정하기</div>
            </label>
            <input
              type="file"
              accept="image/*"
              hidden
              id="profile-image-input"
              name="profileImage"
              onChange={handleProfileImageChange}
            />
          </div>
          <div>
            <div id="id-input-container">
              <p>닉네임</p>
              <input
                type="text"
                id="nickname-input"
                name="nickname"
                defaultValue={profile.nickname ?? profile.id ?? ''}
              />
            </div>
            <div id="my-introduce-input-container">
              <p>내 소개</p>
              <textarea
                id="my-introduce-textarea"
                name="introduction"
                defaultValue={profile.introduction ?? ''}
              />
            </div>
          </div>
        </div>
        {errorMessage && (
          <p className="profile-edit-modal__error" role="alert">
            {errorMessage}
          </p>
        )}
        <div className="setting-dialog__actions profile-edit-modal__button-group">
          <button className="setting-dialog__button" type="button" onClick={onCancel}>
            취소하기
          </button>
          <button
            className="setting-dialog__button setting-dialog__button--primary"
            type="submit"
          >
            수정하기
          </button>
        </div>
      </form>
    </SettingDialog>
  );
}

export default MyProfileEditModal;
