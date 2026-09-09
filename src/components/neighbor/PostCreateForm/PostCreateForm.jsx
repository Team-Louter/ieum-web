import './PostCreateForm.css';
import uploadIcon from '../../../assets/images/upload.svg';

/** 게시물 미디어와 내용을 입력받는 폼입니다. */
function PostCreateForm() {
  return (
    <form>
      <div id='content-info-input'>
        <label htmlFor="input-image" id="input-image-label">
          <img src={uploadIcon} alt="업로드 아이콘" />
          <p>동영상 또는 사진을 올려주세요.</p>
        </label>
        <input type="file" id="input-image" hidden />
        <div id="content-text-input">
          <input type="text" id="content-title" placeholder="제목을 입력해주세요" />
          <textarea id="content" placeholder="내용을 입력해주세요."></textarea>
        </div>
      </div>
      <button type="submit" id="make-content-btn">
        게시물 만들기
      </button>
    </form>
  );
}

export default PostCreateForm;
