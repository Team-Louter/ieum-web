import { useCallback, useEffect, useState } from 'react';

function getGeolocationErrorMessage(error) {
  if (error.code === 1) {
    return '위치 권한을 허용하면 현재 위치를 확인할 수 있습니다.';
  }

  if (error.code === 3) {
    return '위치 확인 시간이 초과되었습니다. 다시 시도해 주세요.';
  }

  return '기기의 현재 위치를 확인할 수 없습니다.';
}

/** 브라우저의 현재 위치를 가져오고 카카오 지도 서비스로 도로명 주소를 변환합니다. */
function useCurrentLocation(isMapReady) {
  const geolocationSupported = typeof navigator !== 'undefined' && Boolean(navigator.geolocation);
  const [coordinates, setCoordinates] = useState(null);
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(geolocationSupported);
  const [locationError, setLocationError] = useState(
    geolocationSupported ? '' : '이 브라우저에서는 현재 위치를 확인할 수 없습니다.',
  );
  const [addressError, setAddressError] = useState('');

  const handleLocationSuccess = useCallback(({ coords }) => {
    setCoordinates({ latitude: coords.latitude, longitude: coords.longitude });
    setIsLoading(false);
  }, []);

  const handleLocationFailure = useCallback((error) => {
    setLocationError(getGeolocationErrorMessage(error));
    setIsLoading(false);
  }, []);

  const requestCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(handleLocationSuccess, handleLocationFailure, {
      enableHighAccuracy: true,
      maximumAge: 30_000,
      timeout: 15_000,
    });
  }, [handleLocationFailure, handleLocationSuccess]);

  const refresh = useCallback(() => {
    setCoordinates(null);
    setAddress('');
    setLocationError('');
    setAddressError('');

    if (!navigator.geolocation) {
      setIsLoading(false);
      setLocationError('이 브라우저에서는 현재 위치를 확인할 수 없습니다.');
      return;
    }

    setIsLoading(true);
    requestCurrentLocation();
  }, [requestCurrentLocation]);

  useEffect(() => {
    requestCurrentLocation();
  }, [requestCurrentLocation]);

  useEffect(() => {
    if (!coordinates || !isMapReady) {
      return undefined;
    }

    let isMounted = true;
    const geocoder = window.kakao?.maps?.services?.Geocoder;
    const kakaoStatus = window.kakao?.maps?.services?.Status;

    if (!geocoder || !kakaoStatus) {
      const errorTimer = window.setTimeout(() => {
        if (isMounted) {
          setAddressError('주소 변환 서비스를 사용할 수 없습니다.');
        }
      }, 0);
      return () => {
        isMounted = false;
        window.clearTimeout(errorTimer);
      };
    }

    new geocoder().coord2Address(coordinates.longitude, coordinates.latitude, (results, status) => {
      if (!isMounted) {
        return;
      }

      const result = results?.[0];
      const resolvedAddress = result?.road_address?.address_name || result?.address?.address_name;

      if (status === kakaoStatus.OK && resolvedAddress) {
        setAddress(resolvedAddress);
        setAddressError('');
      } else {
        setAddressError('현재 주소를 확인할 수 없습니다.');
      }
    });

    return () => {
      isMounted = false;
    };
  }, [coordinates, isMapReady]);

  return { coordinates, address, isLoading, locationError, addressError, refresh };
}

export default useCurrentLocation;
