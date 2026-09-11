import './ProfileEditModal.css';
import { useEffect, useState } from 'react';
import closeIcon from '../../../assets/images/close.svg';
import profileImg from '../../../assets/images/profile.png';

function useInput() {
  const [input, setInput] = useState('');
  const onChange = (event) => {
    setInput(event.target.value);
  };

  return [input, onChange];
}

function ProfileEditModal({ onCancel, onConfirm }) {
  useEffect(() => {
    /** Escape 키 입력 시 프로필 수정 모달을 닫습니다. */
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onCancel();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  /** 배경을 클릭했을 때 프로필 수정 모달을 닫습니다. */
  function handleBackdropClick(event) {
    if (event.target === event.currentTarget) {
      onCancel();
    }
  }

  const [previewUrl, setPreviewUrl] = useState(profileImg);
  const [myNickname, onChangeMyNickname] = useInput();
  const [myIntroduce, onChangeMyIntroduce] = useInput();

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setPreviewUrl(URL.createObjectURL(file));
  };

  return (
    <div className="profile-edit-modal" onClick={handleBackdropClick} role="presentation">
      <section className="profile-edit-modal__panel" role="dialog" aria-modal="true" aria-labelledby="profile-edit-modal-title">
        <button type="button" onClick={onCancel}>
          <img src={closeIcon} alt="닫기 아이콘" />
        </button>
        {/* <p id="profile-edit-modal-title">프로필 수정하기</p> */}
        <form action="">
          <div id="input-container">
            <div id="profile-image-input-container">
              <img src={previewUrl} alt="프로필 사진" />
              <label htmlFor="profile-image-input">
                <div id="profile-image-input-label">프로필 사진 수정하기</div>
              </label>
              <input type="file" hidden id="profile-image-input" onChange={handleImageChange} />
            </div>
            <div>
              <div id="id-input-container">
                <p>아이디</p>
                <input type="text" id="nickname-input" value={myNickname} onChange={onChangeMyNickname} placeholder="아이디를 입력하세요." />
              </div>
              <div id="my-introduce-input-container">
                <p>내 소개</p>
                <textarea id="my-introduce-textarea" value={myIntroduce} onChange={onChangeMyIntroduce} placeholder="내 소개를 입력하세요." />
              </div>
            </div>
          </div>
          <div className="profile-edit-modal__button-group">
            <button type="button" onClick={onCancel}>
              취소하기
            </button>
            <button type="submit" onClick={onConfirm}>
              수정하기
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default ProfileEditModal;
