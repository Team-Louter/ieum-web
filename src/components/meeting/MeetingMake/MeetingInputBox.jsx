import './MeetingInputBox.css';
import upload from '../../../assets/images/meeting-upload.png';

export default function MeetingInputBox() {
  return(
    <form className="input-container">
      <label htmlFor="input-img" className="meeting-input-picture">
        <div className='meeting-input-picture-guide'>
          <img className='meeting-input-picture-guide-image' src={upload} alt="업로드모양 이미지"/>
          <p className="meeting-input-picture-guide-text">모임 사진을 올려주세요</p>
        </div>
      </label>
      <input type="file" hidden id='input-img'></input>
      <div className="meeting-input-subcontainer">
        <input className="meeting-input-name" placeholder='모임 이름을 입력해 주세요'></input>
        <textarea className="meeting-input-info" placeholder='모임 소개를 입력해 주세요'></textarea>
      </div>
    </form>
  );
}
