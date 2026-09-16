import { useEffect, useRef, useState } from 'react';
import { dummyFriendLocations } from '../../../constants/dummy/dummyFriendLocations';
import NearbyFriendPing from '../NearbyFriendPing/NearbyFriendPing';
import createNearbyFriendPingElement from '../NearbyFriendPing/createNearbyFriendPingElement';
import './KakaoMap.css';

const KAKAO_MAP_SCRIPT_ID = 'kakao-map-sdk';
const DEFAULT_CENTER = { latitude: 35.8534, longitude: 128.4722 };

/** 카카오 지도 SDK를 불러와 친구 위치 마커를 표시합니다. */
function KakaoMap() {
  const mapContainerRef = useRef(null);
  const kakaoMapAppKey = import.meta.env.VITE_KAKAO_MAP_APP_KEY;
  const [hasMapLoadFailed, setHasMapLoadFailed] = useState(false);

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
              center: new kakao.maps.LatLng(DEFAULT_CENTER.latitude, DEFAULT_CENTER.longitude),
              level: 5,
            });

            dummyFriendLocations.forEach(({ nickname, latitude, longitude }) => {
              new kakao.maps.CustomOverlay({
                content: createNearbyFriendPingElement(nickname),
                map,
                position: new kakao.maps.LatLng(latitude, longitude),
                yAnchor: 1,
              });
            });
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
        existingScript.removeEventListener('load', initializeMap);
        existingScript.removeEventListener('error', handleMapLoadError);
      };
    }

    const script = document.createElement('script');
    script.id = KAKAO_MAP_SCRIPT_ID;
    script.async = true;
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoMapAppKey}&autoload=false`;
    script.addEventListener('load', initializeMap);
    script.addEventListener('error', handleMapLoadError);
    document.head.appendChild(script);

    return () => {
      isMounted = false;
      script.removeEventListener('load', initializeMap);
      script.removeEventListener('error', handleMapLoadError);
    };
  }, [kakaoMapAppKey]);

  if (!kakaoMapAppKey || hasMapLoadFailed) {
    return (
      <div className="kakao-map kakao-map--fallback" aria-label="친구 위치 지도 미리보기">
        {dummyFriendLocations.map(({ id, nickname, latitude, longitude }) => (
          <div
            className="kakao-map__fallback-ping"
            key={id}
            style={{ left: `${44 + (longitude - 128.46) * 1200}%`, top: `${56 - (latitude - 35.84) * 1350}%` }}
          >
            <NearbyFriendPing nickname={nickname} />
          </div>
        ))}
        <p>카카오맵 JavaScript 키를 설정하면 실제 지도가 표시됩니다.</p>
      </div>
    );
  }

  return <div className="kakao-map" ref={mapContainerRef} aria-label="친구 위치 지도" />;
}

export default KakaoMap;
