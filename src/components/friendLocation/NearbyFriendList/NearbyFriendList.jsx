import profileImage from '../../../assets/images/profile.png';
import './NearbyFriendList.css';
import EmptyState from '../../common/EmptyState/EmptyState';
import Skeleton from '../../common/Skeleton/Skeleton';

/** 현재 위치 주변에 있는 친구 목록을 표시합니다. */
function NearbyFriendList({ friends = [], isLoading = false }) {
  const friendItems = Array.isArray(friends) ? friends : [];

  return (
    <aside className="nearby-friend-list">
      <h2>내 근처에 있는 친구</h2>
      <ul {...(isLoading && friendItems.length === 0 ? { role: 'status', 'aria-busy': true, 'aria-label': '주변 친구를 불러오는 중입니다.' } : {})}>
        {isLoading && friendItems.length === 0 ? (
          Array.from({ length: 4 }, (_, index) => (
            <li key={index} aria-hidden="true">
              <Skeleton circle width={38} height={38} />
              <Skeleton text width={110} />
            </li>
          ))
        ) : friendItems.length > 0 ? (
          friendItems.map(({ id, nickname, profileImage: friendImage }) => (
            <li key={id}>
              <img src={friendImage || profileImage} alt="친구 프로필" />
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
