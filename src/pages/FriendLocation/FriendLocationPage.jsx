import { useCallback, useEffect, useMemo, useState } from 'react';
import Layout from '../../components/common/Layout/Layout';
import Skeleton from '../../components/common/Skeleton/Skeleton';
import KakaoMap from '../../components/friendLocation/KakaoMap/KakaoMap';
import NearbyFriendList from '../../components/friendLocation/NearbyFriendList/NearbyFriendList';
import { locationApi, profileApi, resolveApiAssetUrl } from '../../api/client';
import useCurrentLocation from '../../hooks/useCurrentLocation';
import mapIcon from '../../assets/images/mapfriend.svg';
import './FriendLocationPage.css';

const DEFAULT_CENTER = { latitude: 35.8534, longitude: 128.4722 };
// 서버는 15분 넘게 갱신되지 않은 위치를 친구 목록에서 빼므로, 그보다 자주 갱신합니다.
const FRIENDS_REFRESH_MS = 30 * 1000;
const MY_LOCATION_REFRESH_MS = 5 * 60 * 1000;

/** 실제 기기 위치를 중심으로 친구 위치 지도와 주소를 표시합니다. */
function FriendLocationPage({ role, currentUserId }) {
  const [isMapReady, setIsMapReady] = useState(false);
  const [myProfileImage, setMyProfileImage] = useState('');
  const [isMyProfileLoaded, setIsMyProfileLoaded] = useState(false);
  const [friends, setFriends] = useState([]);
  const [friendsStatus, setFriendsStatus] = useState('loading');
  const [sharingError, setSharingError] = useState('');
  const handleMapReady = useCallback(() => setIsMapReady(true), []);
  const { coordinates, address, isLoading, locationError, addressError } =
    useCurrentLocation(isMapReady);

  // 지도를 열 때마다 최신 프로필 사진을 받아 내 위치 핑에 반영합니다.
  useEffect(() => {
    let isMounted = true;
    profileApi
      .get()
      .then((profile) => {
        if (isMounted) setMyProfileImage(resolveApiAssetUrl(profile?.profileImageUrl ?? ''));
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setIsMyProfileLoaded(true);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    function loadFriends() {
      locationApi.listFriends({ signal }).then((response) => {
      if (signal.aborted) return;
      if (!Array.isArray(response)) throw new Error('친구 위치 응답 형식이 올바르지 않습니다.');
      setFriends(response
        .filter((friend) => friend?.userId != null &&
          Number.isFinite(friend.latitude) && Math.abs(friend.latitude) <= 90 &&
          Number.isFinite(friend.longitude) && Math.abs(friend.longitude) <= 180)
        .map((friend) => ({
          ...friend,
          id: friend.userId,
          nickname: friend.nickname || '친구',
          profileImage: resolveApiAssetUrl(friend.profileImageUrl ?? ''),
        })));
      setFriendsStatus('ready');
    }).catch(() => {
      // 처음 불러오기에 실패했을 때만 오류로 표시하고, 갱신 실패는 이전 목록을 유지합니다.
      if (!signal.aborted) setFriendsStatus((status) => (status === 'ready' ? status : 'error'));
    });
    }

    loadFriends();
    const intervalId = window.setInterval(loadFriends, FRIENDS_REFRESH_MS);
    return () => {
      window.clearInterval(intervalId);
      controller.abort();
    };
  }, [currentUserId]);

  useEffect(() => {
    if (role !== 'ROLE_SENIOR' || !coordinates) return undefined;
    const controller = new AbortController();
    const { signal } = controller;
    async function reportLocation() {
      try {
        const sharing = await locationApi.getSharing({ signal });
        if (!signal.aborted && sharing?.enabled === true) {
          const { latitude, longitude } = coordinates;
          await locationApi.report({ latitude, longitude }, { signal });
        }
        if (!signal.aborted) setSharingError('');
      } catch (error) {
        if (signal.aborted) return;
        const sharing = error.status === 403
          ? await locationApi.getSharing({ signal }).catch(() => null)
          : null;
        if (signal.aborted) return;
        setSharingError(sharing?.enabled === false
          ? '위치 공유가 꺼져 있어 내 위치를 공유하지 않았습니다.'
          : '내 위치를 공유하지 못했습니다. 위치 공유 설정을 확인해 주세요.');
      }
    }
    void reportLocation();
    // 화면을 열어 두는 동안에도 위치가 15분 기준에 걸려 사라지지 않게 주기적으로 다시 올립니다.
    const intervalId = window.setInterval(() => void reportLocation(), MY_LOCATION_REFRESH_MS);
    return () => {
      window.clearInterval(intervalId);
      controller.abort();
    };
  }, [coordinates, currentUserId, role]);

  const locations = useMemo(
    () =>
      coordinates
        ? [
            {
              id: 'current-device',
              nickname: '내 위치',
              profileImage: myProfileImage,
              isProfileLoading: !isMyProfileLoaded,
              ...coordinates,
            },
            ...friends,
          ]
        : friends,
    [coordinates, friends, myProfileImage, isMyProfileLoaded],
  );
  const center = coordinates ?? friends[0] ?? DEFAULT_CENTER;
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
            <div
              className="friend-location-page__map-loading"
              role="status"
              aria-busy="true"
              aria-label="현재 위치를 확인하는 중입니다."
            >
              <Skeleton width="100%" height="100%" style={{ borderRadius: 0 }} />
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
          <NearbyFriendList friends={friends} status={friendsStatus} />
          <div className="friend-location-page__address" aria-live="polite">
            <div className="friend-location-page__address-label">
              <img src={mapIcon} alt="" />
              <span>내 현재 위치</span>
            </div>
            <p>{addressText}</p>
            {sharingError && <p>{sharingError}</p>}
          </div>
        </div>
      </section>
    </Layout>
  );
}

export default FriendLocationPage;
