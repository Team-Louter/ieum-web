import { useEffect, useState } from 'react';
import './MeetingInputBox.css';
import { getCurrentRegionName } from '../../../utils/kakaoRegion';
import upload from '../../../assets/images/meeting-upload.png';
import useImageCrop from '../../../hooks/useImageCrop';

export default function MeetingInputBox({ values = {}, onChange }) {
  const [preview, setPreview] = useState({ file: null, url: '' });
  const [isLocating, setIsLocating] = useState(false);
  const [regionError, setRegionError] = useState('');
  const { cropImage, cropModal } = useImageCrop({ aspect: 1 });

  /** 현재 위치를 지역 이름으로 바꿔 입력칸에 채웁니다. */
  async function handleCurrentRegion() {
    setIsLocating(true);
    setRegionError('');
    try {
      onChange?.('region', await getCurrentRegionName());
    } catch (error) {
      setRegionError(error?.message ?? '현재 위치를 확인하지 못했습니다.');
    } finally {
      setIsLocating(false);
    }
  }

  useEffect(() => () => {
    if (preview.url) URL.revokeObjectURL(preview.url);
  }, [preview.url]);
  async function changeImage(event) {
    const selected = event.target.files?.[0] ?? null;
    event.target.value = '';
    if (!selected) return;
    // 모임 사진은 정사각형으로 잘라 올립니다. 자르기를 취소하면 기존 사진을 그대로 둡니다.
    const file = await cropImage(selected);
    if (!file) return;
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
          placeholder="이름을 입력해 주세요"
          value={values.title ?? ''}
          onChange={(event) => onChange?.('title', event.target.value)}
          required
        />
        <div className="meeting-input-region-wrap">
          <input
            className="meeting-input-region"
            placeholder="지역을 입력해 주세요"
            value={values.region ?? ''}
            onChange={(event) => onChange?.('region', event.target.value)}
            required
          />
          <button
            className="meeting-input-region-button"
            type="button"
            onClick={handleCurrentRegion}
            disabled={isLocating}
          >
            {isLocating ? '확인 중' : '현재 위치'}
          </button>
          {regionError && (
            <p className="meeting-input-region-error" role="alert">
              {regionError}
            </p>
          )}
        </div>
        <textarea
          className="meeting-input-info"
          placeholder="소개를 입력해 주세요"
          value={values.description ?? ''}
          onChange={(event) => onChange?.('description', event.target.value)}
          required
        />
      </div>
      {cropModal}
    </div>
  );
}
