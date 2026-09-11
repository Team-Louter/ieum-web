import Layout from '../../components/common/Layout/Layout';
import KakaoMap from '../../components/friendLocation/KakaoMap/KakaoMap';
import NearbyFriendList from '../../components/friendLocation/NearbyFriendList/NearbyFriendList';
import './FriendLocationPage.css';

/** 친구의 위치를 지도와 목록으로 표시합니다. */
function FriendLocationPage() {
  return (
    <Layout className="friend-location-layout">
      <section className="friend-location-page">
        <div className="friend-location-page__map-wrapper">
          <KakaoMap />
          <NearbyFriendList />
          <p className="friend-location-page__address">대구광역시 달성군 구지면 창리로1길 93</p>
        </div>
      </section>
    </Layout>
  );
}

export default FriendLocationPage;
