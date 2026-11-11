import profileImage from '../../../assets/images/profile.png';
import './NearbyFriendList.css';
import EmptyState from '../../common/EmptyState/EmptyState';

/** 현재 위치 주변에 있는 친구 목록을 표시합니다. */
function NearbyFriendList({ friends = [] }) {
  const friendItems = Array.isArray(friends) ? friends : [];

  return (
    <aside className="nearby-friend-list">
      <h2>내 근처에 있는 친구</h2>
      <ul>
        {friendItems.length > 0 ? (
          friendItems.map(({ id, nickname }) => (
            <li key={id}>
              <img src={profileImage} alt="친구 프로필" />
              <span>{nickname}</span>
            </li>
          ))
        ) : (
          <li className="nearby-friend-list__empty">
            <EmptyState
              compact
              title="주변에 친구가 없어요"
              description="친구가 위치 공유를 시작하면 이곳에 표시돼요."
            />
          </li>
        )}
      </ul>
    </aside>
  );
}

export default NearbyFriendList;
