/** 어르신의 최근 접속 상태와 보호자 안내 문구를 표시합니다. */
function GuardianStatusBanner({ lastLoginText, message, isWarning }) {
  return (
    <section className={`guardian-status-banner${isWarning ? ' guardian-status-banner--warning' : ''}`} aria-live="polite">
      <p>{lastLoginText}</p>
      <strong>{message}</strong>
    </section>
  );
}

export default GuardianStatusBanner;
