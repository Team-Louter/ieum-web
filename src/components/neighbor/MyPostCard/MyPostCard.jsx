import { createPortal } from 'react-dom';
import { useRef, useState } from 'react';
import './MyPostCard.css';
import ConfirmationModal from '../../common/ConfirmationModal/ConfirmationModal';
import CardMoreMenu from '../../common/CardMoreMenu/CardMoreMenu';

const MAX_IMAGES = 5;

/** 서버가 준 사진 주소(수정 때 되돌려 보내는 값)와 화면에 보일 주소를 짝지어 돌려줍니다. */
function getExistingImages(post) {
  const rawUrls =
    Array.isArray(post.imageUrls) && post.imageUrls.length > 0
      ? post.imageUrls
      : post.imageUrl
        ? [post.imageUrl]
        : [];
  const shownUrls = Array.isArray(post.images) ? post.images : [];
  return rawUrls.map((raw, index) => ({ raw, src: shownUrls[index] ?? raw }));
}

/** 내 게시물 목록에서 한 게시물을 표시합니다. */
function MyPostCard({ post = {}, onDelete, onUpdate }) {
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(post.title ?? '');
  const [content, setContent] = useState(post.content ?? '');
  const [editError, setEditError] = useState('');
  const [keptImages, setKeptImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const fileInputRef = useRef(null);

  /** 삭제 확인 모달을 엽니다. */
  function handleDeleteClick(event) {
    event.stopPropagation();
    setIsConfirmationOpen(true);
  }

  /** 삭제 확인 모달을 닫습니다. */
  function handleConfirmationClose() {
    setIsConfirmationOpen(false);
  }

  /** 수정 창을 엽니다. 현재 제목·내용을 채워 둡니다. */
  function handleEditClick(event) {
    event.stopPropagation();
    setTitle(post.title ?? '');
    setContent(post.content ?? '');
    setEditError('');
    setKeptImages(getExistingImages(post));
    setNewImages([]);
    setIsEditing(true);
  }

  function closeEditor() {
    newImages.forEach((image) => URL.revokeObjectURL(image.url));
    setNewImages([]);
    setIsEditing(false);
  }

  function handleFilesChange(event) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    const room = MAX_IMAGES - keptImages.length - newImages.length;
    let message = files.length > room ? `사진은 최대 ${MAX_IMAGES}장까지 올릴 수 있습니다.` : '';
    const added = [];
    for (const file of files.slice(0, Math.max(room, 0))) {
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        message = 'JPG 또는 PNG 사진만 올릴 수 있습니다.';
      } else if (file.size > 5 * 1024 * 1024) {
        message = '사진은 5MB 이하로 올려주세요.';
      } else {
        added.push({ file, url: URL.createObjectURL(file) });
      }
    }
    setNewImages((current) => [...current, ...added]);
    setEditError(message);
  }

  function removeNewImage(index) {
    URL.revokeObjectURL(newImages[index].url);
    setNewImages((current) => current.filter((_, itemIndex) => itemIndex !== index));
    setEditError('');
  }

  async function handleEditSubmit(event) {
    event.preventDefault();
    const originalCount = getExistingImages(post).length;
    const imagesChanged = newImages.length > 0 || keptImages.length !== originalCount;
    if (imagesChanged && keptImages.length + newImages.length === 0) {
      setEditError('사진은 최소 1장 필요합니다.');
      return;
    }
    const values = { title: title.trim(), content: content.trim() };
    if (imagesChanged) {
      values.keptImageUrls = keptImages.map((image) => image.raw);
      values.newImages = newImages.map((image) => image.file);
    }
    try {
      await onUpdate?.(post, values);
      closeEditor();
    } catch (error) {
      setEditError(error?.message ?? '게시물을 수정하지 못했습니다.');
    }
  }

  function handleDeleteConfirm() {
    onDelete?.(post.id);
    handleConfirmationClose();
  }

  const cardStyle = post.image
    ? {
        backgroundImage: `url("${post.image}")`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
      }
    : undefined;

  return (
    <div className="my-content" style={cardStyle} aria-label={post.title || '내 게시물'}>
      <CardMoreMenu
        label="게시물 메뉴"
        items={[
          onUpdate && { label: '수정하기', onClick: handleEditClick },
          onDelete && post.canDelete === true && { label: '삭제하기', onClick: handleDeleteClick, danger: true },
        ].filter(Boolean)}
      />
      {isEditing && createPortal(
        <div className="my-content-edit" role="presentation" onClick={(event) => event.stopPropagation()}>
          <form className="my-content-edit__panel" onSubmit={handleEditSubmit}>
            <header className="my-content-edit__header">
              <h2>게시물 수정</h2>
              <button
                type="button"
                className="my-content-edit__close"
                aria-label="닫기"
                onClick={closeEditor}
              >
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                  <path d="M5 5l14 14M19 5L5 19" />
                </svg>
              </button>
            </header>
            <ul className="my-content-edit__images" aria-label="게시물 사진">
              {keptImages.map((image, index) => (
                <li key={image.raw}>
                  <img src={image.src} alt="" />
                  <button
                    type="button"
                    aria-label={`${index + 1}번째 사진 삭제`}
                    onClick={() => setKeptImages((current) => current.filter((item) => item !== image))}
                  >
                    ×
                  </button>
                </li>
              ))}
              {newImages.map((image, index) => (
                <li key={image.url}>
                  <img src={image.url} alt="" />
                  <button
                    type="button"
                    aria-label={`새 사진 ${index + 1} 삭제`}
                    onClick={() => removeNewImage(index)}
                  >
                    ×
                  </button>
                </li>
              ))}
              {keptImages.length + newImages.length < MAX_IMAGES && (
                <li>
                  <button
                    type="button"
                    className="my-content-edit__image-add"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    + {keptImages.length + newImages.length}/{MAX_IMAGES}
                  </button>
                </li>
              )}
            </ul>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              multiple
              hidden
              onChange={handleFilesChange}
            />
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="제목"
              aria-label="제목"
              required
            />
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="내용"
              aria-label="내용"
              rows={5}
              required
            />
            {editError && <p role="alert">{editError}</p>}
            <div className="my-content-edit__actions">
              <button type="submit">저장</button>
              <button type="button" onClick={closeEditor}>
                취소
              </button>
            </div>
          </form>
        </div>,
        document.body,
      )}
      {isConfirmationOpen && (
        <ConfirmationModal
          title="게시물 삭제"
          message="정말로 게시물을 삭제하시겠습니까?"
          onCancel={handleConfirmationClose}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
}

export default MyPostCard;
