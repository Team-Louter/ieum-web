import { useState } from 'react';
import './NearbyFriendPing.css';
import profileImg from '../../../assets/images/profile.png';
import Skeleton from '../../common/Skeleton/Skeleton';

/** 친구 위치 핑의 미리보기 UI를 표시합니다. 사진이 준비될 때까지 회색 원을 보여줍니다. */
function NearbyFriendPing({ nickname = '친구', profileImage, isProfileLoading = false }) {
  const [loadedSrc, setLoadedSrc] = useState('');
  const src = profileImage || profileImg;
  const showSkeleton = isProfileLoading || loadedSrc !== src;

  return (
    <div className="nearby-friend-ping" aria-label={`${nickname}의 위치`}>
      <div className="nearby-friend-ping__circle">
        {showSkeleton && <Skeleton circle className="nearby-friend-ping__skeleton" />}
        {!isProfileLoading && (
          <img
            src={src}
            alt={`${nickname} 프로필 사진`}
            style={showSkeleton ? { display: 'none' } : undefined}
            onLoad={() => setLoadedSrc(src)}
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = profileImg;
              setLoadedSrc(src);
            }}
          />
        )}
      </div>
      <div className="nearby-friend-ping__triangle" />
      <div className="nearby-friend-ping__tooltip">
        <p>{nickname}</p>
      </div>
    </div>
  );
}

export default NearbyFriendPing;
