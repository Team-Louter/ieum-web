import './ProfileInfo.css';
import profileImg from '../../../assets/images/profile.png';

/** 다른 사용자 프로필의 기본 정보를 표시합니다. */
function ProfileInfo() {
  return (
    <div className="profile-info">
      <img src={profileImg} alt="프로필 사진" />
      <div className="profile-info__text">
        <p>아이디</p>
        <p>내 소개</p>
        <div className="profile-info__stats">
          <p>게시물 00</p>
          <p>친구 00</p>
        </div>
      </div>
    </div>
  );
}

export default ProfileInfo;
