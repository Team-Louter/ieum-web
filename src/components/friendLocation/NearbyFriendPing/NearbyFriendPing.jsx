import './NearbyFriendPing.css';
import profileImg from '../../../assets/images/profile.png';

/** 친구 위치 핑의 미리보기 UI를 표시합니다. */
function NearbyFriendPing({ nickname = '친구', profileImage }) {
  return (
    <div className="nearby-friend-ping" aria-label={`${nickname}의 위치`}>
      <div className="nearby-friend-ping__circle">
        <img src={profileImage || profileImg} alt={`${nickname} 프로필 사진`} />
      </div>
      <div className="nearby-friend-ping__triangle" />
      <div className="nearby-friend-ping__tooltip">
        <p>{nickname}</p>
      </div>
    </div>
  );
}

export default NearbyFriendPing;
