import { useEffect, useRef, useState } from 'react';
import NearbyFriendPing from '../NearbyFriendPing/NearbyFriendPing';
import createNearbyFriendPingElement from '../NearbyFriendPing/createNearbyFriendPingElement';
import './KakaoMap.css';

const KAKAO_MAP_SCRIPT_ID = 'kakao-map-sdk';
const DEFAULT_CENTER = { latitude: 35.8534, longitude: 128.4722 };
// 마커 중심이 화면에서 이 거리(px) 안에 있으면 겹친 것으로 보고 하나로 묶습니다.
// 핀 크기(약 68×75px)보다 살짝 크게 잡아, 조금만 겹쳐도 묶입니다.
const GROUP_DISTANCE_PX = 72;

/** 화면 위 거리가 가까운 위치끼리 묶습니다. 지도를 확대하면 거리가 벌어져 자연스럽게 나뉩니다. */
function groupLocations(map, locations) {
  const projection = map.getProjection();
  const groups = [];

  locations.forEach((location) => {
    const point = projection.containerPointFromCoords(
      new window.kakao.maps.LatLng(location.latitude, location.longitude),
    );
    const group = groups.find(
      (item) => Math.hypot(item.point.x - point.x, item.point.y - point.y) < GROUP_DISTANCE_PX,
    );
    if (group) group.members.push(location);
    else groups.push({ point, members: [location] });
  });

  return groups;
}

/** 카카오 지도 SDK를 불러와 전달받은 위치 마커를 표시합니다. */
function KakaoMap({
  locations = [],
  center = DEFAULT_CENTER,
  level = 5,
  ariaLabel = '친구 위치 지도',
  onMapReady,
}) {
  const mapContainerRef = useRef(null);
  const kakaoMapAppKey = import.meta.env.VITE_KAKAO_MAP_APP_KEY;
  const [hasMapLoadFailed, setHasMapLoadFailed] = useState(false);
  // 지도는 한 번만 만들고, 친구 위치가 바뀔 때는 마커만 갱신합니다. (지도가 처음 위치로 돌아가는 현상 방지)
  const locationsRef = useRef(locations);
  const centerRef = useRef(center);
  const onMapReadyRef = useRef(onMapReady);
  const renderPingsRef = useRef(null);

  useEffect(() => {
    onMapReadyRef.current = onMapReady;
  }, [onMapReady]);

  useEffect(() => {
    locationsRef.current = locations;
    renderPingsRef.current?.();
  }, [locations]);

  useEffect(() => {
    if (!kakaoMapAppKey || !mapContainerRef.current) {
      return undefined;
    }

    let isMounted = true;

    /** 카카오 SDK 로드 실패 시 지도 미리보기로 전환합니다. */
    function handleMapLoadError() {
      if (isMounted) {
        setHasMapLoadFailed(true);
      }
    }

    /** 카카오 지도와 친구 위치 마커를 초기화합니다. */
    function initializeMap() {
      const { kakao } = window;

      if (!kakao?.maps) {
        handleMapLoadError();
        return;
      }

      try {
        kakao.maps.load(() => {
          if (!mapContainerRef.current || !isMounted) {
            return;
          }

          try {
            const map = new kakao.maps.Map(mapContainerRef.current, {
              center: new kakao.maps.LatLng(
                centerRef.current.latitude,
                centerRef.current.longitude,
              ),
              level,
            });

            // 같은 친구 구성의 마커는 줌을 바꿔도 다시 만들지 않고 그대로 둡니다. (깜박임 방지)
            const overlaysByKey = new Map();
            let openPing = null;

            function closeOpenPing() {
              openPing?.classList.remove('nearby-friend-ping--open');
              openPing = null;
            }

            /** 현재 확대 단계에 맞게 겹친 친구를 묶고, 구성이 달라진 마커만 바꿉니다. */
            function renderPings() {
              // 친구, 위치, 사진이 그대로면 같은 마커로 보고 다시 만들지 않습니다.
              const nextGroups = groupLocations(map, locationsRef.current).map(({ members }) => ({
                key: members
                  .map(
                    (member) =>
                      `${member.id}:${member.nickname}:${member.latitude}:${member.longitude}:${member.profileImage ?? ''}:${member.isProfileLoading ? 1 : 0}`,
                  )
                  .join('|'),
                members,
              }));
              const nextKeys = new Set(nextGroups.map(({ key }) => key));

              overlaysByKey.forEach(({ overlay, content }, key) => {
                if (nextKeys.has(key)) return;
                if (openPing === content) closeOpenPing();
                overlay.setMap(null);
                overlaysByKey.delete(key);
              });

              nextGroups.forEach(({ key, members }) => {
                if (overlaysByKey.has(key)) return;

                const [first] = members;
                const content = createNearbyFriendPingElement(
                  first.nickname,
                  first.profileImage,
                  first.isProfileLoading,
                  members.map((member) => member.nickname),
                );
                const overlay = new kakao.maps.CustomOverlay({
                  content,
                  map,
                  position: new kakao.maps.LatLng(
                    members.reduce((sum, member) => sum + member.latitude, 0) / members.length,
                    members.reduce((sum, member) => sum + member.longitude, 0) / members.length,
                  ),
                  yAnchor: 1,
                });

                // 묶음 마커는 눌러서 닉네임 목록을 열고 닫습니다. (터치 화면에서도 보이도록)
                if (members.length > 1) {
                  content.addEventListener('click', () => {
                    const shouldOpen = openPing !== content;
                    closeOpenPing();
                    if (shouldOpen) {
                      content.classList.add('nearby-friend-ping--open');
                      openPing = content;
                    }
                  });
                }
                overlaysByKey.set(key, { overlay, content });
              });
            }

            renderPingsRef.current = renderPings;
            renderPings();
            let renderedLevel = map.getLevel();
            kakao.maps.event.addListener(map, 'idle', () => {
              if (map.getLevel() !== renderedLevel) {
                renderedLevel = map.getLevel();
                renderPings();
              }
            });
            kakao.maps.event.addListener(map, 'click', closeOpenPing);
            onMapReadyRef.current?.();
          } catch {
            handleMapLoadError();
          }
        });
      } catch {
        handleMapLoadError();
      }
    }

    const existingScript = document.getElementById(KAKAO_MAP_SCRIPT_ID);

    if (existingScript) {
      if (window.kakao?.maps) {
        initializeMap();
      } else {
        existingScript.addEventListener('load', initializeMap, { once: true });
        existingScript.addEventListener('error', handleMapLoadError, { once: true });
      }

      return () => {
        isMounted = false;
        renderPingsRef.current = null;
        existingScript.removeEventListener('load', initializeMap);
        existingScript.removeEventListener('error', handleMapLoadError);
      };
    }

    const script = document.createElement('script');
    script.id = KAKAO_MAP_SCRIPT_ID;
    script.async = true;
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoMapAppKey}&autoload=false&libraries=services`;
    script.addEventListener('load', initializeMap);
    script.addEventListener('error', handleMapLoadError);
    document.head.appendChild(script);

    return () => {
      isMounted = false;
      renderPingsRef.current = null;
      script.removeEventListener('load', initializeMap);
      script.removeEventListener('error', handleMapLoadError);
    };
  }, [kakaoMapAppKey, level]);

  if (!kakaoMapAppKey || hasMapLoadFailed) {
    return (
      <div className="kakao-map kakao-map--fallback" aria-label={`${ariaLabel} 미리보기`}>
        {locations.map(({ id, nickname, latitude, longitude, profileImage, isProfileLoading }) => (
          <div
            className="kakao-map__fallback-ping"
            key={id}
            style={{
              left: `${44 + (longitude - 128.46) * 1200}%`,
              top: `${56 - (latitude - 35.84) * 1350}%`,
            }}
          >
            <NearbyFriendPing nickname={nickname} profileImage={profileImage} isProfileLoading={isProfileLoading} />
          </div>
        ))}
        <p>카카오맵 JavaScript 키를 설정하면 실제 지도가 표시됩니다.</p>
      </div>
    );
  }

  return <div className="kakao-map" ref={mapContainerRef} aria-label={ariaLabel} />;
}

export default KakaoMap;
