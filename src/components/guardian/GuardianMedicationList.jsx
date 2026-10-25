/** 오늘의 복약 예정 및 완료 상태를 목록으로 표시합니다. */
function GuardianMedicationList({ medications }) {
  return (
    <section
      className="guardian-info-card guardian-medication-list"
      aria-labelledby="guardian-medication-title"
    >
      <h2 id="guardian-medication-title" className="guardian-visually-hidden">
        오늘의 복약 현황
      </h2>
      {medications.map(({ id, time, name, status }) => (
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
    </section>
  );
}

export default GuardianMedicationList;
