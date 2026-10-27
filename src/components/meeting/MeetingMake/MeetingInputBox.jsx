import { useEffect, useState } from 'react';
import './MeetingInputBox.css';
import upload from '../../../assets/images/meeting-upload.png';

export default function MeetingInputBox({ values = {}, onChange }) {
  const [preview, setPreview] = useState({ file: null, url: '' });
  useEffect(() => () => {
    if (preview.url) URL.revokeObjectURL(preview.url);
  }, [preview.url]);
  function changeImage(event) {
    const file = event.target.files?.[0] ?? null;
    setPreview({ file, url: file ? URL.createObjectURL(file) : '' });
    onChange?.('image', file);
  }
  const imageUrl = typeof values.image === 'string' ? values.image : preview.file === values.image ? preview.url : '';
  return (
    <div className="input-container">
      <label htmlFor="input-img" className="meeting-input-picture">
        <div className="meeting-input-picture-guide">
          {imageUrl ? (
            <img
              className="meeting-input-picture-guide-image meeting-input-picture-guide-image--preview"
              src={imageUrl}
              alt="모임 미리보기"
            />
          ) : values.image ? (
            <p className="meeting-input-picture-guide-text">{values.image.name}</p>
          ) : (
            <>
              <img className="meeting-input-picture-guide-image" src={upload} alt="" />
              <p className="meeting-input-picture-guide-text">모임 사진을 올려주세요</p>
            </>
          )}
        </div>
      </label>
      <input
        type="file"
        accept="image/jpeg,image/png"
        hidden
        id="input-img"
        onChange={changeImage}
      />
      <div className="meeting-input-subcontainer">
        <input
          className="meeting-input-name"
          placeholder="모임 이름을 입력해 주세요"
          value={values.title ?? ''}
          onChange={(event) => onChange?.('title', event.target.value)}
          required
        />
        <input
          className="meeting-input-region"
          placeholder="모임 지역을 입력해 주세요"
          value={values.region ?? ''}
          onChange={(event) => onChange?.('region', event.target.value)}
          required
        />
        <textarea
          className="meeting-input-info"
          placeholder="모임 소개를 입력해 주세요"
          value={values.description ?? ''}
          onChange={(event) => onChange?.('description', event.target.value)}
          required
        />
      </div>
    </div>
  );
}
