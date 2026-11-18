import Skeleton from '../common/Skeleton/Skeleton';
import EmptyState from '../common/EmptyState/EmptyState';

/** 오늘의 복약 예정 및 완료 상태를 목록으로 표시합니다. */
function GuardianMedicationList({ medications, isLoading = false, apiError = '' }) {
  const medicationItems = Array.isArray(medications) ? medications : [];

  return (
    <section
      className="guardian-info-card guardian-medication-list"
      aria-labelledby="guardian-medication-title"
    >
      <h2 id="guardian-medication-title" className="guardian-medication-list__title">
        복약 알림
      </h2>
      {medicationItems.length > 0 ? (
        <div
          className="guardian-medication-list__items"
          role="region"
          aria-label="복약 알림 목록"
          tabIndex={0}
        >
          {medicationItems.map(({ id, time, name, status }) => (
            <div className="guardian-medication-list__item" key={id}>
              <span
                className={`guardian-medication-list__time guardian-medication-list__time--${status}`}
              >
                {time}
              </span>
              <span
                className={`guardian-medication-list__name guardian-medication-list__name--${status}`}
              >
                {name}
              </span>
            </div>
          ))}
        </div>
      ) : isLoading ? (
        <div className="guardian-medication-list__items" role="status" aria-busy="true" aria-label="복약 알림을 불러오는 중입니다.">
          {[0, 1, 2].map((row) => (
            <div key={row} className="guardian-medication-list__item">
              <Skeleton text width="56px" height="18px" />
              <Skeleton text width="55%" height="18px" />
            </div>
          ))}
        </div>
      ) : apiError ? (
        <p
          className="guardian-medication-list__message guardian-medication-list__message--error"
          role="alert"
        >
          {apiError}
        </p>
      ) : (
        <EmptyState
          compact
          title="복약 일정을 등록해보세요"
          description="복약 일정이 등록되면 이곳에서 확인할 수 있어요."
        />
      )}
    </section>
  );
}

export default GuardianMedicationList;
