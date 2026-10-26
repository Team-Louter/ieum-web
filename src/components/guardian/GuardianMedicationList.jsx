import EmptyState from '../common/EmptyState/EmptyState';

/** 오늘의 복약 예정 및 완료 상태를 목록으로 표시합니다. */
function GuardianMedicationList({ medications, isLoading = false, apiError = '' }) {
  const medicationItems = Array.isArray(medications) ? medications : [];

  return (
    <section
      className="guardian-info-card guardian-medication-list"
      aria-labelledby="guardian-medication-title"
    >
      <h2 id="guardian-medication-title" className="guardian-visually-hidden">
        오늘의 복약 현황
      </h2>
      {medicationItems.length > 0 ? (
        medicationItems.map(({ id, time, name, status }) => (
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
        ))
      ) : !isLoading && !apiError ? (
        <EmptyState
          compact
          title="오늘 복약 일정이 없어요"
          description="복약 일정이 등록되면 이곳에서 확인할 수 있어요."
        />
      ) : null}
    </section>
  );
}

export default GuardianMedicationList;
