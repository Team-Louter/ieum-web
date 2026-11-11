const KAKAO_MAP_SCRIPT_ID = 'kakao-map-sdk';

/** 카카오 지도 SDK(services 포함)를 한 번만 불러옵니다. */
function loadKakaoServices() {
  const appKey = import.meta.env.VITE_KAKAO_MAP_APP_KEY;
  if (!appKey) return Promise.reject(new Error('지도 서비스를 사용할 수 없습니다.'));

  return new Promise((resolve, reject) => {
    function ready() {
      if (!window.kakao?.maps) {
        reject(new Error('지도 서비스를 불러오지 못했습니다.'));
        return;
      }
      window.kakao.maps.load(() => resolve(window.kakao));
    }

    if (window.kakao?.maps) {
      ready();
      return;
    }

    let script = document.getElementById(KAKAO_MAP_SCRIPT_ID);
    if (!script) {
      script = document.createElement('script');
      script.id = KAKAO_MAP_SCRIPT_ID;
      script.async = true;
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false&libraries=services`;
      document.head.appendChild(script);
    }
    script.addEventListener('load', ready, { once: true });
    script.addEventListener(
      'error',
      () => reject(new Error('지도 서비스를 불러오지 못했습니다.')),
      { once: true },
    );
  });
}

function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('이 브라우저에서는 현재 위치를 확인할 수 없습니다.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, (error) => {
      reject(
        new Error(
          error.code === 1
            ? '위치 권한을 허용해 주세요.'
            : '현재 위치를 확인하지 못했습니다. 다시 시도해 주세요.',
        ),
      );
    }, { enableHighAccuracy: true, maximumAge: 30_000, timeout: 15_000 });
  });
}

/** 현재 위치를 "시/도 시/군/구 읍/면/동" 형태의 지역 이름으로 변환합니다. */
export async function getCurrentRegionName() {
  const [{ coords }, kakao] = await Promise.all([getCurrentPosition(), loadKakaoServices()]);
  const geocoder = new kakao.maps.services.Geocoder();

  return new Promise((resolve, reject) => {
    geocoder.coord2RegionCode(coords.longitude, coords.latitude, (results, status) => {
      const region = results?.find((item) => item.region_type === 'H') ?? results?.[0];
      if (status !== kakao.maps.services.Status.OK || !region) {
        reject(new Error('현재 지역을 확인하지 못했습니다.'));
        return;
      }
      resolve(
        [region.region_1depth_name, region.region_2depth_name, region.region_3depth_name]
          .filter(Boolean)
          .join(' '),
      );
    });
  });
}
