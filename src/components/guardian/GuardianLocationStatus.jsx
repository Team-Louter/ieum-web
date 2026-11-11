import mapIcon from '../../assets/images/mapfriend.svg';

/** 현재 기기의 위치 확인 결과와 집과의 거리를 표시합니다. */
function GuardianLocationStatus({
  address,
  isLoading,
  isOutside,
  locationError,
  elderName = '어르신',
  onRefresh,
  statusMessage,
}) {
  return (
    <section
      className={`guardian-info-card guardian-location-status${isOutside ? ' guardian-location-status--warning' : ''}${isOutside == null ? ' guardian-location-status--unknown' : ''}`}
      aria-labelledby="guardian-location-title"
      aria-live="polite"
    >
      <div className="guardian-location-status__heading">
        <h2 id="guardian-location-title">{elderName} 현재 위치 확인</h2>
        <button
          className="guardian-location-status__refresh"
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          aria-label="현재 기기 위치 새로고침"
        >
          {isLoading ? '확인 중' : '새로고침'}
        </button>
      </div>
      <p className="guardian-location-status__address">
        <img src={mapIcon} alt="" />
        <span>{address}</span>
      </p>
      <strong>{statusMessage}</strong>
      {locationError && <p className="guardian-location-status__error">{locationError}</p>}
    </section>
  );
}

export default GuardianLocationStatus;
