import './MyProfileInfo.css';
import profileImg from '../../../assets/images/profile.png';

/** 전달받은 프로필 데이터를 표시합니다. */
function MyProfileInfo({ profile = {} }) {
  const {
    nickname = '',
    introduction = '',
    postCount = 0,
    friendCount = 0,
    profileImage = profileImg,
  } = profile;
  const loginId = profile.loginId ?? profile.id ?? '';

  return (
    <div className="my-profile-info">
      <img
        src={profileImage || profileImg}
        alt={`${loginId || '사용자'} 프로필 사진`}
        onError={(event) => {
          event.currentTarget.onerror = null;
          event.currentTarget.src = profileImg;
        }}
      />
      <div className="my-profile-info__text">
        <p>{loginId}</p>
        {nickname && nickname !== loginId && (
          <p className="my-profile-info__nickname">{nickname}</p>
        )}
        <p>{introduction}</p>
        <div className="my-profile-info__stats">
          <p>게시물 {postCount}</p>
          <p>친구 {friendCount}</p>
        </div>
      </div>
    </div>
  );
}

export default MyProfileInfo;
