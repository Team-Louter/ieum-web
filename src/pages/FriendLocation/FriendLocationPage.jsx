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
const FRIEND_REFRESH_MS = 30000;

/** 실제 기기 위치를 중심으로 친구 위치 지도와 주소를 표시합니다. */
function FriendLocationPage() {
  const [isMapReady, setIsMapReady] = useState(false);
  const [myProfileImage, setMyProfileImage] = useState('');
  const [friendLocations, setFriendLocations] = useState([]);
  const [isFriendsLoading, setIsFriendsLoading] = useState(true);
  const [isSharing, setIsSharing] = useState(null);
  const [isSharingSaving, setIsSharingSaving] = useState(false);
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
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  // 내 위치 공유 여부를 서버 설정에서 불러옵니다.
  useEffect(() => {
    let isMounted = true;
    locationApi
      .getSharing()
      .then((setting) => {
        if (isMounted) setIsSharing(Boolean(setting?.enabled));
      })
      .catch(() => {
        if (isMounted) setIsSharing(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  /** 내 위치 공유를 켜거나 끕니다. 끄면 서버에 올린 위치도 지웁니다. */
  const handleToggleSharing = useCallback(async () => {
    const next = !isSharing;
    setIsSharingSaving(true);
    try {
      const setting = await locationApi.setSharing(next);
      setIsSharing(Boolean(setting?.enabled ?? next));
      if (!next) await locationApi.stop().catch(() => {});
    } catch {
      // 저장에 실패하면 이전 상태를 그대로 둡니다.
    } finally {
      setIsSharingSaving(false);
    }
  }, [isSharing]);

  // 내 위치를 서버에 올리고, 위치를 공유 중인 친구들의 위치를 주기적으로 불러옵니다.
  const latitude = coordinates?.latitude;
  const longitude = coordinates?.longitude;
  useEffect(() => {
    let isMounted = true;

    async function syncLocations() {
      try {
        if (isSharing && latitude !== undefined && longitude !== undefined) {
          await locationApi.report(latitude, longitude).catch(() => {});
        }
        const friends = await locationApi.friends();
        if (isMounted) setFriendLocations(Array.isArray(friends) ? friends : []);
      } catch {
        if (isMounted) setFriendLocations([]);
      } finally {
        if (isMounted) setIsFriendsLoading(false);
      }
    }

    syncLocations();
    const timerId = window.setInterval(syncLocations, FRIEND_REFRESH_MS);
    return () => {
      isMounted = false;
      window.clearInterval(timerId);
    };
  }, [latitude, longitude, isSharing]);

  const friends = useMemo(
    () =>
      friendLocations.map((friend) => ({
        id: friend.userId,
        nickname: friend.nickname,
        profileImage: resolveApiAssetUrl(friend.profileImageUrl ?? ''),
        latitude: friend.latitude,
        longitude: friend.longitude,
      })),
    [friendLocations],
  );

  const locations = useMemo(
    () => [
      ...(coordinates
        ? [{ id: 'current-device', nickname: '내 위치', profileImage: myProfileImage, ...coordinates }]
        : []),
      ...friends,
    ],
    [coordinates, myProfileImage, friends],
  );
  const center = coordinates || DEFAULT_CENTER;
  const addressText = address || locationError || addressError;
  const isAddressPending = !addressText;

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
          <NearbyFriendList friends={friends} isLoading={isFriendsLoading} />
          <div className="friend-location-page__address" aria-live="polite">
            <div className="friend-location-page__address-label">
              <img src={mapIcon} alt="" />
              <span>내 현재 위치</span>
            </div>
            {isAddressPending ? (
              <div
                className="friend-location-page__address-loading"
                role="status"
                aria-busy="true"
                aria-label="현재 주소를 확인하는 중입니다."
              >
                <Skeleton text width="70%" />
              </div>
            ) : (
              <p>{addressText}</p>
            )}
            <button
              type="button"
              onClick={handleToggleSharing}
              disabled={isSharing === null || isSharingSaving}
              aria-pressed={Boolean(isSharing)}
            >
              {isSharing ? '위치 공유 끄기' : '위치 공유 켜기'}
            </button>
          </div>
        </div>
      </section>
    </Layout>
  );
}

export default FriendLocationPage;
