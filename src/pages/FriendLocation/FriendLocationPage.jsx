import { useCallback, useMemo, useState } from 'react';
import Layout from '../../components/common/Layout/Layout';
import KakaoMap from '../../components/friendLocation/KakaoMap/KakaoMap';
import NearbyFriendList from '../../components/friendLocation/NearbyFriendList/NearbyFriendList';
import { dummyFriendLocations } from '../../constants/dummy/dummyFriendLocations';
import useCurrentLocation from '../../hooks/useCurrentLocation';
import mapIcon from '../../assets/images/mapfriend.svg';
import './FriendLocationPage.css';

const DEFAULT_CENTER = { latitude: 35.8534, longitude: 128.4722 };

/** 실제 기기 위치를 중심으로 친구 위치 지도와 주소를 표시합니다. */
function FriendLocationPage() {
  const [isMapReady, setIsMapReady] = useState(false);
  const handleMapReady = useCallback(() => setIsMapReady(true), []);
  const { coordinates, address, isLoading, locationError, addressError, refresh } =
    useCurrentLocation(isMapReady);

  const handleLocationRefresh = useCallback(() => {
    setIsMapReady(false);
    refresh();
  }, [refresh]);

  const locations = useMemo(() => {
    if (!coordinates) {
      return dummyFriendLocations;
    }

    return [{ id: 'current-device', nickname: '내 위치', ...coordinates }, ...dummyFriendLocations];
  }, [coordinates]);
  const center = coordinates || DEFAULT_CENTER;
  const addressText =
    address ||
    locationError ||
    addressError ||
    (isLoading ? '현재 위치를 확인하는 중입니다.' : '현재 주소를 확인하는 중입니다.');

  return (
    <Layout className="friend-location-layout">
      <section className="friend-location-page" aria-label="친구 위치">
        <div className="friend-location-page__map-wrapper">
          {isLoading && !coordinates ? (
            <div className="friend-location-page__map-loading" role="status" aria-live="polite">
              <div className="friend-location-page__map-loading-card">
                <span className="app-loading-spinner" aria-hidden="true" />
                <span>현재 위치를 확인하는 중입니다.</span>
              </div>
            </div>
          ) : (
            <KakaoMap
              locations={locations}
              center={center}
              level={5}
              ariaLabel="내 현재 위치와 친구 위치 지도"
              onMapReady={handleMapReady}
            />
          )}
          <NearbyFriendList />
          <div className="friend-location-page__address" aria-live="polite">
            <div className="friend-location-page__address-label">
              <img src={mapIcon} alt="" />
              <span>내 현재 위치</span>
            </div>
            <p>{addressText}</p>
            <button type="button" onClick={handleLocationRefresh} disabled={isLoading}>
              {isLoading ? '확인 중' : '새로고침'}
            </button>
          </div>
        </div>
      </section>
    </Layout>
  );
}

export default FriendLocationPage;
