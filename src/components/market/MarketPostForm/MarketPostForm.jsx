import { useEffect, useRef, useState } from 'react';
import './MarketPostForm.css'
import uploadIcon from '../../../assets/images/upload.svg';

/** 게시물 미디어와 내용을 입력받는 폼입니다. */
function MarketPostCreateForm({ initialValues = {}, onSubmit }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [title, setTitle] = useState(initialValues.title ?? '');
  const [price, setPrice] = useState(initialValues.price ?? '');
  const [content, setContent] = useState(initialValues.content ?? '');
  const [region, setRegion] = useState(initialValues.region ?? '');
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const fileInputRef = useRef(null);
  const previewUrlRef = useRef('');

  useEffect(() => () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
  }, []);

  function handleFileChange(event) {
    const [nextFile] = event.target.files;
    if (!nextFile) return;
    if (!nextFile.type.startsWith('image/') && !nextFile.type.startsWith('video/')) {
      setSelectedFile(null);
      setErrors((currentErrors) => ({ ...currentErrors, media: '이미지 또는 동영상 파일만 선택할 수 있습니다.' }));
      event.target.value = '';
      return;
    }
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const nextPreviewUrl = URL.createObjectURL(nextFile);
    previewUrlRef.current = nextPreviewUrl;
    setSelectedFile(nextFile);
    setPreviewUrl(nextPreviewUrl);
    setErrors((currentErrors) => ({ ...currentErrors, media: '' }));
  }

  function handleFileSelectClick() {
    if (!fileInputRef.current) return;
    fileInputRef.current.value = '';
    fileInputRef.current.click();
  }

  /** 필수 입력값을 확인하고 유효하지 않은 항목에 오류 문구를 표시합니다. */
  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = {
      media: selectedFile ? '' : '필수 입력 정보입니다.',
      title: title.trim() ? '' : '필수 입력 정보입니다.',
      price: !price.trim()
        ? '필수 입력 정보입니다.'
        : /^\d+$/.test(price.trim())
          ? ''
          : '가격은 숫자만 입력해 주세요.',
      content: content.trim() ? '' : '필수 입력 정보입니다.',
      region: region.trim() ? '' : '거주 지역을 입력해 주세요.',
    };

    setErrors(nextErrors);
    setSubmitError('');

    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }

    try {
      await onSubmit?.({ title: title.trim(), price: price.trim(), content: content.trim(), region: region.trim(), media: selectedFile });
    } catch (error) {
      setSubmitError(error?.message ?? '게시물을 등록하지 못했습니다.');
    }
  }

  return (
    <form className="market-post-create-form" onSubmit={handleSubmit}>
      <div className="market-post-create-form__content">
        <div className="market-post-create-form__media-wrapper">
          <button type="button" className="market-post-create-form__media-label" onClick={handleFileSelectClick}>
            {previewUrl ? (
              selectedFile.type.startsWith('image/') ? (
                <img className="market-post-create-form__preview" src={previewUrl} alt="선택한 이미지 미리보기" />
              ) : (
                <video className="market-post-create-form__preview" src={previewUrl} controls onClick={(event) => event.stopPropagation()} />
              )
            ) : (
              <>
                <img src={uploadIcon} alt="" />
                <p>동영상 또는 사진을 올려주세요.</p>
              </>
            )}
          </button>
          {previewUrl && (
            <button type="button" className="market-post-create-form__change-button" onClick={handleFileSelectClick}>
              파일 변경
            </button>
          )}
          <p className="market-post-create-form__error" role={errors.media ? 'alert' : undefined}>
            {errors.media}
          </p>
        </div>
        <input ref={fileInputRef} type="file" id="market-post-media" accept="image/*,video/*" hidden onChange={handleFileChange} />
        <div className="market-post-create-form__text-fields">
          <div>
            <input type="text" placeholder="제목을 입력해주세요" value={title} onChange={(event) => setTitle(event.target.value)} />
            <p className="market-post-create-form__error" role={errors.title ? 'alert' : undefined}>
              {errors.title}
            </p>
          </div>
          <div>
            <input type="text" inputMode="numeric" placeholder="가격을 입력해주세요 (숫자만 입력해주세요)" value={price} onChange={(event) => setPrice(event.target.value)} />
            <p className="market-post-create-form__error" role={errors.price ? 'alert' : undefined}>
              {errors.price}
            </p>
          </div>
          <div>
            <input type="text" placeholder="거주 지역을 입력해 주세요" value={region} onChange={(event) => setRegion(event.target.value)} />
            <p className="market-post-create-form__error" role={errors.region ? 'alert' : undefined}>
              {errors.region}
            </p>
          </div>
          <div>
            <textarea placeholder="내용을 입력해주세요." value={content} onChange={(event) => setContent(event.target.value)} />
            <p className="market-post-create-form__error" role={errors.content ? 'alert' : undefined}>
              {errors.content}
            </p>
          </div>
        </div>
      </div>
      <button type="submit" className="market-post-create-form__submit">
        게시물 만들기
      </button>
      {submitError && <p className="market-post-create-form__submit-error" role="alert">{submitError}</p>}
    </form>
  );
}

export default MarketPostCreateForm;
