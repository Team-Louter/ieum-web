import './MyProfileInfo.css';
import profileImg from '../../../assets/images/profile.png';

/** 전달받은 프로필 데이터를 표시합니다. */
function MyProfileInfo({ profile = {} }) {
  const {
    introduction = '',
    postCount = 0,
    friendCount = 0,
    profileImage = profileImg,
  } = profile;
  const displayName = profile.nickname?.trim() || '닉네임 없음';
  const formatCount = (count) => String(Number(count) || 0);

  return (
    <div className="my-profile-info">
      <img
        src={profileImage || profileImg}
        alt={`${displayName || '사용자'} 프로필 사진`}
        onError={(event) => {
          event.currentTarget.onerror = null;
          event.currentTarget.src = profileImg;
        }}
      />
      <div className="my-profile-info__text">
        <p>{displayName}</p>
        <p>{introduction?.trim() || '내 소개가 없습니다'}</p>
        <div className="my-profile-info__stats">
          <p>게시물 {formatCount(postCount)}</p>
          <p>친구 {formatCount(friendCount)}</p>
        </div>
      </div>
    </div>
  );
}

export default MyProfileInfo;
