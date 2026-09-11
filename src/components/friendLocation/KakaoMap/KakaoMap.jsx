import { useEffect, useRef } from 'react';
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

  useEffect(() => {
    if (!kakaoMapAppKey || !mapContainerRef.current) {
      return undefined;
    }

    /** 카카오 지도와 친구 위치 마커를 초기화합니다. */
    function initializeMap() {
      const { kakao } = window;

      kakao.maps.load(() => {
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
      });
    }

    const existingScript = document.getElementById(KAKAO_MAP_SCRIPT_ID);

    if (existingScript) {
      initializeMap();
      return undefined;
    }

    const script = document.createElement('script');
    script.id = KAKAO_MAP_SCRIPT_ID;
    script.async = true;
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoMapAppKey}&autoload=false`;
    script.addEventListener('load', initializeMap);
    document.head.appendChild(script);

    return () => script.removeEventListener('load', initializeMap);
  }, [kakaoMapAppKey]);

  if (!kakaoMapAppKey) {
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
