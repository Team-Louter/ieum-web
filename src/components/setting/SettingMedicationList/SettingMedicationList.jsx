import './SettingMedicationList.css';

function SettingMedicationList({ schedule = [], onDelete }) {
  const scheduleItems = schedule ?? [];

  if (!scheduleItems.length) {
    return <p className="setting-medication-list__empty">등록된 복약 정보가 없습니다.</p>;
  }

  return (
    <ul className="setting-medication-list">
      {scheduleItems.map(({ id, time, label, medicationName }) => (
        <li key={id ?? `${time}-${label}`}>
          <span className="setting-medication-list__time">{time}</span>
          <span className="setting-medication-list__name">{label ?? medicationName}</span>
          {onDelete && (
            <button
              type="button"
              className="setting-medication-list__delete"
              onClick={() => onDelete(id)}
              disabled={id == null}
            >
              삭제
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}

export default SettingMedicationList;
