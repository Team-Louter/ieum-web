import './ProfileInfo.css';
import profileImg from '../../../assets/images/profile.png';

/** 전달받은 다른 사용자 프로필 데이터를 표시합니다. */
function ProfileInfo({ profile = {} }) {
  const {
    id = '',
    nickname = '',
    introduction = '',
    postCount = 0,
    friendCount = 0,
    profileImage = profileImg,
  } = profile;

  return (
    <div className="profile-info">
      <img
        src={profileImage || profileImg}
        alt={`${id || '사용자'} 프로필 사진`}
        onError={(event) => {
          event.currentTarget.onerror = null;
          event.currentTarget.src = profileImg;
        }}
      />
      <div className="profile-info__text">
        <p>{nickname || id}</p>
        <p>{introduction}</p>
        <div className="profile-info__stats">
          <p>게시물 {postCount}</p>
          <p>친구 {friendCount}</p>
        </div>
      </div>
    </div>
  );
}

export default ProfileInfo;
