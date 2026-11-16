import { useCallback, useEffect, useMemo, useState } from 'react';
import Layout from '../../components/common/Layout/Layout';
import KakaoMap from '../../components/friendLocation/KakaoMap/KakaoMap';
import GuardianLocationStatus from '../../components/guardian/GuardianLocationStatus';
import GuardianMedicationList from '../../components/guardian/GuardianMedicationList';
import GuardianStatusBanner from '../../components/guardian/GuardianStatusBanner';
import useCurrentLocation from '../../hooks/useCurrentLocation';
import mapIcon from '../../assets/images/mapfriend.svg';
import './GuardianPage.css';

function getDistanceInMeters(firstPoint, secondPoint) {
  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  const latitudeDelta = toRadians(secondPoint.latitude - firstPoint.latitude);
  const longitudeDelta = toRadians(secondPoint.longitude - firstPoint.longitude);
  const firstLatitude = toRadians(firstPoint.latitude);
  const secondLatitude = toRadians(secondPoint.latitude);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(firstLatitude) * Math.cos(secondLatitude) * Math.sin(longitudeDelta / 2) ** 2;

  return 6_371_000 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function findAddressCoordinates(address) {
  return new Promise((resolve) => {
    const geocoder = window.kakao?.maps?.services?.Geocoder;

    if (!geocoder) {
      resolve(null);
      return;
    }

    new geocoder().addressSearch(address, (results, status) => {
      const kakaoStatus = window.kakao?.maps?.services?.Status;
      const result = results?.[0];

      if (status !== kakaoStatus?.OK || !result) {
        resolve(null);
        return;
      }

      resolve({ latitude: Number(result.y), longitude: Number(result.x) });
    });
  });
}

/**
 * 보호자 상태 화면을 표시합니다.
 * guardian / medications는 API 응답 데이터로 교체할 수 있고,
 * 현재 기기 위치는 브라우저 위치 권한을 사용합니다.
 */
function GuardianPage({
  guardian = {},
  medications = [],
  elders = [],
  onLocationRefresh,
  isLoading = false,
  apiError = '',
}) {
  const [selectedElderId, setSelectedElderId] = useState(() =>
    elders[0] ? String(elders[0].id) : '',
  );
  const selectedElder =
    elders.find((elder) => String(elder.id) === selectedElderId) ?? elders[0] ?? null;
  const guardianSource = selectedElder ?? guardian ?? {};
  const guardianData = {
    ...guardianSource,
    elderName:
      guardianSource.elderName?.trim() || '어르신',
    homeAddress: guardianSource.homeAddress?.trim() || '',
    homeCoordinates: guardianSource.homeCoordinates ?? null,
    homeRadiusMeters: guardianSource.homeRadiusMeters ?? 100,
    lastLoginText: guardianSource.lastLoginText?.trim() || '',
    statusMessage: guardianSource.statusMessage?.trim() || '',
  };
  const selectedMedications = selectedElder ? selectedElder.medications : medications;
  const medicationItems = Array.isArray(selectedMedications) ? selectedMedications : [];
  const [isKakaoMapReady, setIsKakaoMapReady] = useState(false);
  const [resolvedHome, setResolvedHome] = useState(null);
  const homeLocation =
    guardianData.homeCoordinates ??
    (resolvedHome?.address === guardianData.homeAddress ? resolvedHome.coordinates : null);
  const handleMapReady = useCallback(() => setIsKakaoMapReady(true), []);
  const {
    coordinates: deviceCoordinates,
    address: currentAddress,
    isLoading: isLoadingLocation,
    locationError,
    addressError,
    refresh: refreshLocation,
  } = useCurrentLocation(isKakaoMapReady);

  useEffect(() => {
    if (!isKakaoMapReady) {
      return undefined;
    }

    let isMounted = true;

    if (guardianData.homeCoordinates || !guardianData.homeAddress) return undefined;

    findAddressCoordinates(guardianData.homeAddress).then((resolvedHome) => {
      if (isMounted && resolvedHome) {
        setResolvedHome({ address: guardianData.homeAddress, coordinates: resolvedHome });
      }
    });

    return () => {
      isMounted = false;
    };
  }, [guardianData.homeAddress, guardianData.homeCoordinates, isKakaoMapReady]);

  const isOutsideHome = deviceCoordinates
    ? homeLocation
      ? getDistanceInMeters(deviceCoordinates, homeLocation) >
        (guardianData.homeRadiusMeters ?? 100)
      : null
    : null;
  const mapLocations = useMemo(
    () =>
      deviceCoordinates
        ? [{ id: 'current-device', nickname: '현재 기기', ...deviceCoordinates }]
        : [],
    [deviceCoordinates],
  );
  const mapCenter = deviceCoordinates || homeLocation || undefined;
  const locationMessage = deviceCoordinates
    ? isOutsideHome === null
      ? '집 위치를 확인할 수 없습니다.'
      : `현재 기기가 집${isOutsideHome ? ' 밖' : ''}에 있습니다.`
    : locationError
      ? '위치 확인을 완료하지 못했습니다.'
      : '현재 기기의 위치를 확인하는 중입니다.';
  const addressLabel =
    currentAddress ||
    (addressError
      ? '현재 주소를 확인할 수 없습니다.'
      : locationError
        ? '위치 확인 후 주소를 표시합니다.'
        : '현재 위치 주소를 확인하는 중입니다.');

  return (
    <Layout className="guardian-layout">
      <section className="guardian-page" aria-labelledby="guardian-page-title">
        <h1 id="guardian-page-title" className="guardian-visually-hidden">
          보호자 기능
        </h1>
        <div
          className={`guardian-page__content${elders.length > 1 ? ' guardian-page__content--elder-tabs' : ''}`}
        >
          {elders.length > 1 && (
            <div className="guardian-page__elder-tabs" role="group" aria-label="어르신 선택">
              {elders.map((elder) => {
                const elderId = String(elder.id);
                const isSelected = String(selectedElder?.id) === elderId;

                return (
                  <button
                    key={elderId}
                    className={`guardian-page__elder-tab${isSelected ? ' guardian-page__elder-tab--active' : ''}`}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setSelectedElderId(elderId)}
                  >
                    {elder.elderName || '어르신'}
                  </button>
                );
              })}
            </div>
          )}

          <GuardianStatusBanner
            lastLoginText={guardianData.lastLoginText}
            message={guardianData.statusMessage}
          />

          <div className="guardian-page__summary">
            <GuardianMedicationList
              medications={medicationItems}
              isLoading={isLoading}
              apiError={apiError}
            />
            <GuardianLocationStatus
              address={addressLabel}
              isLoading={isLoadingLocation}
              isOutside={isOutsideHome}
              locationError={locationError}
              elderName={guardianData.elderName}
              onRefresh={() => {
                refreshLocation();
                onLocationRefresh?.();
              }}
              statusMessage={locationMessage}
            />
          </div>

          <div className="guardian-page__map" aria-label="현재 기기 위치 지도">
            <KakaoMap
              locations={mapLocations}
              center={mapCenter}
              level={5}
              ariaLabel="현재 기기 위치 지도"
              onMapReady={handleMapReady}
            />
            <p className="guardian-page__map-address">
              <img src={mapIcon} alt="" />
              {addressLabel}
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}

export default GuardianPage;
