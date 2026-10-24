import profileImage from '../../../assets/images/profile.png';
import { dummyFriendLocations } from '../../../constants/dummy/dummyFriendLocations';
import './NearbyFriendList.css';

/** 현재 위치 주변에 있는 친구 목록을 표시합니다. */
function NearbyFriendList() {
  return (
    <aside className="nearby-friend-list">
      <h2>내 근처에 있는 친구</h2>
      <ul>
        {dummyFriendLocations.map(({ id, nickname }) => (
          <li key={id}>
            <img src={profileImage} alt="친구 프로필" />
            <span>{nickname}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default NearbyFriendList;
