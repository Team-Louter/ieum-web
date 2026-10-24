import './MeetingInputBox.css';
import upload from '../../../assets/images/meeting-upload.png';

export default function MeetingInputBox({ values = {}, onChange }) {
  return(
    <div className="input-container">
      <label htmlFor="input-img" className="meeting-input-picture">
        <div className='meeting-input-picture-guide'>
          {typeof values.image === 'string' ? (
            <img className="meeting-input-picture-guide-image" src={values.image} alt="모임 미리보기" />
          ) : values.image ? (
            <p className="meeting-input-picture-guide-text">{values.image.name}</p>
          ) : (
            <>
              <img className='meeting-input-picture-guide-image' src={upload} alt=""/>
              <p className="meeting-input-picture-guide-text">모임 사진을 올려주세요</p>
            </>
          )}
        </div>
      </label>
      <input type="file" accept="image/*" hidden id='input-img' onChange={(event) => onChange?.('image', event.target.files?.[0] ?? null)} />
      <div className="meeting-input-subcontainer">
        <input className="meeting-input-name" placeholder='모임 이름을 입력해 주세요' value={values.title ?? ''} onChange={(event) => onChange?.('title', event.target.value)} required />
        <textarea className="meeting-input-info" placeholder='모임 소개를 입력해 주세요' value={values.description ?? ''} onChange={(event) => onChange?.('description', event.target.value)} required />
      </div>
    </div>
  );
}
