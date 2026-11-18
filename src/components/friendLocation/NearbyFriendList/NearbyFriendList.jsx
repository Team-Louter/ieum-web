import profileImage from '../../../assets/images/profile.png';
import './NearbyFriendList.css';
import Skeleton from '../../common/Skeleton/Skeleton';
import EmptyState from '../../common/EmptyState/EmptyState';

/** 현재 위치 주변에 있는 친구 목록을 표시합니다. */
function NearbyFriendList({ friends = [], status = 'ready' }) {
  const friendItems = Array.isArray(friends) ? friends : [];

  return (
    <aside className="nearby-friend-list">
      <h2>위치를 공유한 친구</h2>
      <ul>
        {friendItems.length === 0 && status === 'loading' ? (
          [0, 1, 2].map((row) => (
            <li key={row} role="status" aria-busy="true" aria-label="친구 위치를 불러오는 중입니다.">
              <Skeleton circle width="36px" height="36px" />
              <Skeleton text width="90px" height="16px" />
            </li>
          ))
        ) : friendItems.length > 0 ? (
          friendItems.map(({ id, nickname, profileImage: friendImage }) => (
            <li key={id}>
              <img loading="lazy" decoding="async" src={friendImage || profileImage} alt="" />
              <span>{nickname}</span>
            </li>
          ))
        ) : (
          <li className="nearby-friend-list__empty">
            <EmptyState
              compact
              title={status === 'loading' ? '친구 위치를 불러오는 중입니다.' :
                status === 'error' ? '친구 위치를 불러오지 못했습니다.' : '친구가 위치를 공유하면 여기에 보여요'}
            />
          </li>
        )}
      </ul>
    </aside>
  );
}

export default NearbyFriendList;
