import { useEffect, useRef, useState } from 'react';
import './PostCreateForm.css';
import uploadIcon from '../../../assets/images/upload.svg';

/** 게시물 미디어와 내용을 입력받는 폼입니다. */
function PostCreateForm({ initialValues = {}, onSubmit }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [title, setTitle] = useState(initialValues.title ?? '');
  const [content, setContent] = useState(initialValues.content ?? '');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const previewUrlRef = useRef('');

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  /** 선택한 파일이 JPEG 또는 PNG 이미지인지 확인하고 미리보기를 준비합니다. */
  function handleFileChange(event) {
    const [nextFile] = event.target.files;

    if (!nextFile) {
      return;
    }

    if (!['image/jpeg', 'image/png'].includes(nextFile.type) || nextFile.size > 5 * 1024 * 1024) {
      setSelectedFile(null);
      setErrors((currentErrors) => ({
        ...currentErrors,
        media: '5MB 이하 JPEG 또는 PNG 사진을 선택해 주세요.',
      }));
      event.target.value = '';
      return;
    }

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }

    const nextPreviewUrl = URL.createObjectURL(nextFile);
    previewUrlRef.current = nextPreviewUrl;
    setSelectedFile(nextFile);
    setPreviewUrl(nextPreviewUrl);
    setErrors((currentErrors) => ({ ...currentErrors, media: '' }));
  }

  /** 파일 선택 창을 열어 이미 선택한 파일도 교체할 수 있게 합니다. */
  function handleFileSelectClick() {
    if (!fileInputRef.current) {
      return;
    }

    fileInputRef.current.value = '';
    fileInputRef.current.click();
  }

  /** 필수 입력값을 확인하고 유효하지 않은 항목에 오류 문구를 표시합니다. */
  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) return;

    const nextErrors = {
      media: '',
      title: title.trim() ? '' : '필수 입력 정보입니다.',
      content: content.trim() ? '' : '필수 입력 정보입니다.',
    };

    setErrors(nextErrors);

    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit?.({
        title: title.trim(),
        content: content.trim(),
        media: selectedFile,
      });
    } catch (failure) {
      setErrors((current) => ({
        ...current,
        submit: failure.message ?? '게시물을 등록하지 못했습니다.',
      }));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="neighbor-post-create-form" onSubmit={handleSubmit}>
      <div className="neighbor-post-create-form__content">
        <div className="neighbor-post-create-form__media-wrapper">
          <button
            type="button"
            className="neighbor-post-create-form__media-label"
            onClick={handleFileSelectClick}
          >
            {previewUrl ? (
              selectedFile.type.startsWith('image/') ? (
                <img
                  className="neighbor-post-create-form__preview"
                  src={previewUrl}
                  alt="선택한 이미지 미리보기"
                />
              ) : (
                <video
                  className="neighbor-post-create-form__preview"
                  src={previewUrl}
                  controls
                  onClick={(event) => event.stopPropagation()}
                />
              )
            ) : (
              <>
                <img src={uploadIcon} alt="" />
                <p>사진을 올려주세요. (선택, JPEG·PNG 5MB 이하)</p>
              </>
            )}
          </button>
          {previewUrl && (
            <button
              type="button"
              className="neighbor-post-create-form__change-button"
              onClick={handleFileSelectClick}
            >
              파일 변경
            </button>
          )}
          <p className="neighbor-post-create-form__error" role={errors.media ? 'alert' : undefined}>
            {errors.media}
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          id="neighbor-post-media"
          accept="image/jpeg,image/png"
          hidden
          onChange={handleFileChange}
        />
        <div className="neighbor-post-create-form__text-fields">
          <div>
            <input
              type="text"
              placeholder="제목을 입력해주세요."
              maxLength={100}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
            <p
              className="neighbor-post-create-form__error"
              role={errors.title ? 'alert' : undefined}
            >
              {errors.title}
            </p>
          </div>
          <div>
            <textarea
              placeholder="내용을 입력해주세요."
              maxLength={5000}
              value={content}
              onChange={(event) => setContent(event.target.value)}
            />
            <p
              className="neighbor-post-create-form__error"
              role={errors.content ? 'alert' : undefined}
            >
              {errors.content}
            </p>
          </div>
        </div>
      </div>
      <p role="alert">{errors.submit}</p>
      <button disabled={submitting} type="submit" className="neighbor-post-create-form__submit">
        게시물 만들기
      </button>
    </form>
  );
}

export default PostCreateForm;
