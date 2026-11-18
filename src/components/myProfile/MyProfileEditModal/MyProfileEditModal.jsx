import './MyProfileEditModal.css';
import { useEffect, useRef, useState } from 'react';
import profileImg from '../../../assets/images/profile.png';
import SettingDialog from '../../setting/SettingDialog/SettingDialog';
import useImageCrop from '../../../hooks/useImageCrop';
import Button from '../../common/Button/Button';
import useSubmitOnce from '../../../hooks/useSubmitOnce';

function MyProfileEditModal({ profile = {}, onCancel, onConfirm, errorMessage = '' }) {
  const previewUrlRef = useRef('');
  const [previewImage, setPreviewImage] = useState('');
  const [croppedImage, setCroppedImage] = useState(null);
  // 기본 프로필 사진으로 되돌리기로 선택했는지 여부입니다.
  const [resetImage, setResetImage] = useState(false);
  const { cropImage, cropModal } = useImageCrop({ aspect: 1 });

  useEffect(
    () => () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    },
    [],
  );

  /** 고른 사진을 동그란 프로필에 맞게 자른 뒤 미리보기에 적용합니다. */
  async function handleProfileImageChange(event) {
    const selectedImage = event.target.files?.[0];
    event.target.value = '';
    if (!selectedImage) return;

    const cropped = await cropImage(selectedImage);
    if (!cropped) return;

    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = URL.createObjectURL(cropped);
    setPreviewImage(previewUrlRef.current);
    setCroppedImage(cropped);
    setResetImage(false);
  }

  /** 지금 사진 대신 기본 프로필 사진을 쓰도록 고릅니다. 저장해야 실제로 바뀝니다. */
  function handleResetImage() {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = '';
    setPreviewImage('');
    setCroppedImage(null);
    setResetImage(true);
  }

  const [handleSubmit, isSaving] = useSubmitOnce(submitProfile);

  async function submitProfile(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    await onConfirm?.({
      nickname: formData.get('nickname'),
      introduction: formData.get('introduction'),
      profileImage: croppedImage ?? undefined,
      resetProfileImage: resetImage && !croppedImage,
      profileImageUrl:
        profile.profileImageUrl ?? profile.profileImage ?? profile.profile_image ?? '',
    });
  }

  return (
    <>
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
                resetImage
                  ? profileImg
                  : previewImage ||
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
            <input
              type="file"
              accept="image/*"
              hidden
              id="profile-image-input"
              onChange={handleProfileImageChange}
            />
            <div className="profile-edit-modal__image-buttons">
              <label htmlFor="profile-image-input">
                <div id="profile-image-input-label">사진 수정</div>
              </label>
              {!resetImage && (previewImage || profile.profileImage || profile.profile_image || profile.profileImageUrl) && (
                <button type="button" id="profile-image-reset-button" onClick={handleResetImage}>
                  기본 이미지
                </button>
              )}
            </div>
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
          <Button
            className="setting-dialog__button setting-dialog__button--primary"
            type="submit"
            loading={isSaving}
            loadingText="저장 중"
          >
            수정하기
          </Button>
        </div>
      </form>
    </SettingDialog>
    {cropModal}
    </>
  );
}

export default MyProfileEditModal;
