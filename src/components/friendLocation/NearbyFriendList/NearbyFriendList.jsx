import profileImage from '../../../assets/images/profile.png';
import './NearbyFriendList.css';
import EmptyState from '../../common/EmptyState/EmptyState';

/** 현재 위치 주변에 있는 친구 목록을 표시합니다. */
function NearbyFriendList({ friends = [], status = 'ready' }) {
  const friendItems = Array.isArray(friends) ? friends : [];

  return (
    <aside className="nearby-friend-list">
      <h2>위치를 공유한 친구</h2>
      <ul>
        {friendItems.length > 0 ? (
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
                status === 'error' ? '친구 위치를 불러오지 못했습니다.' : '공유된 친구 위치가 없어요'}
            />
          </li>
        )}
      </ul>
    </aside>
  );
}

export default NearbyFriendList;
