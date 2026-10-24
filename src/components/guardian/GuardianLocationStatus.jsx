import mapIcon from '../../assets/images/mapfriend.svg';

/** 어르신의 마지막 확인 위치와 외출 상태를 표시합니다. */
function GuardianLocationStatus({ address, statusMessage, isWarning }) {
  return (
    <section className={`guardian-info-card guardian-location-status${isWarning ? ' guardian-location-status--warning' : ''}`} aria-labelledby="guardian-location-title">
      <h2 id="guardian-location-title">어르신 현재 위치 확인</h2>
      <p className="guardian-location-status__address">
        <img src={mapIcon} alt="" />
        {address}
      </p>
      <strong>{statusMessage}</strong>
    </section>
  );
}

export default GuardianLocationStatus;
