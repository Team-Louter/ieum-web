import { useEffect, useRef, useState } from 'react';
import './PostCreateForm.css';
import uploadIcon from '../../../assets/images/upload.svg';
import Button from '../../common/Button/Button';
import useImageCrop from '../../../hooks/useImageCrop';

const MAX_IMAGES = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/png'];
// 게시물 카드에 보이는 사진 비율(가로÷세로)입니다.
const POST_IMAGE_ASPECT = 4 / 5;

/** 게시물 사진(최대 5장)과 내용을 입력받는 폼입니다. */
function PostCreateForm({ initialValues = {}, onSubmit }) {
  const [images, setImages] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [title, setTitle] = useState(initialValues.title ?? '');
  const [content, setContent] = useState(initialValues.content ?? '');
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const fileInputRef = useRef(null);
  const imagesRef = useRef([]);
  const { cropImage, cropModal } = useImageCrop({ aspect: POST_IMAGE_ASPECT });

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(
    () => () => imagesRef.current.forEach((image) => URL.revokeObjectURL(image.url)),
    [],
  );

  function setMediaError(message) {
    setErrors((currentErrors) => ({ ...currentErrors, media: message }));
  }

  /** 고른 사진을 한 장씩 자른 뒤 목록에 더합니다. */
  async function handleFileChange(event) {
    const selectedFiles = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (selectedFiles.length === 0) return;

    const availableSlots = MAX_IMAGES - imagesRef.current.length;
    const nextFiles = selectedFiles.slice(0, Math.max(availableSlots, 0));
    let message = '';

    if (selectedFiles.length > nextFiles.length) {
      message = `사진은 최대 ${MAX_IMAGES}장까지 올릴 수 있습니다.`;
    }

    const added = [];
    for (const file of nextFiles) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        message = 'JPG 또는 PNG 사진만 올릴 수 있습니다. 동영상은 올릴 수 없습니다.';
        continue;
      }

      const cropped = await cropImage(file);
      if (!cropped) continue;
      if (cropped.size > 5 * 1024 * 1024) {
        message = '사진은 5MB 이하로 올려주세요.';
        continue;
      }
      added.push({ file: cropped, url: URL.createObjectURL(cropped) });
    }

    if (added.length > 0) {
      const nextImages = [...imagesRef.current, ...added];
      imagesRef.current = nextImages;
      setImages(nextImages);
      setActiveIndex(nextImages.length - 1);
    }
    setMediaError(message);
  }

  function handleFileSelectClick() {
    if (!fileInputRef.current || images.length >= MAX_IMAGES) return;
    fileInputRef.current.click();
  }

  function handleRemove(index) {
    const nextImages = images.filter((_, itemIndex) => itemIndex !== index);
    URL.revokeObjectURL(images[index].url);
    imagesRef.current = nextImages;
    setImages(nextImages);
    setActiveIndex((current) => Math.min(current > index ? current - 1 : current, nextImages.length - 1));
    setMediaError('');
  }

  /** 필수 입력값을 확인하고 유효하지 않은 항목에 오류 문구를 표시합니다. */
  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = {
      media: images.length > 0 ? '' : '필수 입력 정보입니다.',
      title: title.trim() ? '' : '필수 입력 정보입니다.',
      content: content.trim() ? '' : '필수 입력 정보입니다.',
    };

    setErrors(nextErrors);
    setSubmitError('');

    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }

    try {
      await onSubmit?.({
        title: title.trim(),
        content: content.trim(),
        media: images.map((image) => image.file),
      });
    } catch (error) {
      setSubmitError(error?.message ?? '게시물을 등록하지 못했습니다.');
    }
  }

  const activeImage = images[activeIndex] ?? images[0];

  return (
    <form className="neighbor-post-create-form" onSubmit={handleSubmit}>
      <div className="neighbor-post-create-form__content">
        <div className="neighbor-post-create-form__media-wrapper">
          <button
            type="button"
            className="neighbor-post-create-form__media-label"
            onClick={handleFileSelectClick}
            aria-label="사진 선택"
          >
            {activeImage ? (
              <img
                className="neighbor-post-create-form__preview"
                src={activeImage.url}
                alt="선택한 이미지 미리보기"
              />
            ) : (
              <>
                <img src={uploadIcon} alt="" />
                <p>사진을 올려주세요. (최대 {MAX_IMAGES}장)</p>
              </>
            )}
          </button>
          {images.length > 0 && (
            <ul className="neighbor-post-create-form__thumbnails" aria-label="선택한 사진 목록">
              {images.map((image, index) => (
                <li
                  key={image.url}
                  className={index === activeIndex ? 'is-active' : undefined}
                >
                  <button
                    type="button"
                    className="neighbor-post-create-form__thumbnail"
                    onClick={() => setActiveIndex(index)}
                    aria-label={`${index + 1}번째 사진 보기`}
                  >
                    <img src={image.url} alt="" />
                  </button>
                  <button
                    type="button"
                    className="neighbor-post-create-form__thumbnail-remove"
                    onClick={() => handleRemove(index)}
                    aria-label={`${index + 1}번째 사진 삭제`}
                  >
                    ×
                  </button>
                </li>
              ))}
              {images.length < MAX_IMAGES && (
                <li>
                  <button
                    type="button"
                    className="neighbor-post-create-form__thumbnail-add"
                    onClick={handleFileSelectClick}
                  >
                    + {images.length}/{MAX_IMAGES}
                  </button>
                </li>
              )}
            </ul>
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
          multiple
          hidden
          onChange={handleFileChange}
        />
        <div className="neighbor-post-create-form__text-fields">
          <div>
            <input
              type="text"
              placeholder="제목을 입력해주세요."
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
      <Button type="submit" className="neighbor-post-create-form__submit">
        게시물 만들기
      </Button>
      {submitError && (
        <p className="neighbor-post-create-form__submit-error" role="alert">
          {submitError}
        </p>
      )}
      {cropModal}
    </form>
  );
}

export default PostCreateForm;
