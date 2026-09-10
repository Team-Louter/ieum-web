import './MyProfileInfo.css';
import profileImg from '../../../assets/images/profile.png';

/** 프로필 기본 정보를 표시합니다. */
function MyProfileInfo() {
  return (
    <div id='profile-container'>
      <img src={profileImg} alt="프로필 사진" />
      <div id='profile-text-info'>
        <p>아이디</p>
        <p>내 소개</p>
        <div id='user-info'>
          <p>게시물 00</p>
          <p>친구 00</p>
        </div>
      </div>
    </div>
  );
}

export default MyProfileInfo;
