import './SettingMedicationList.css';
import EmptyState from '../../common/EmptyState/EmptyState';

function SettingMedicationList({
  schedule = [],
  onDelete,
  onCheck,
  isLoading = false,
  apiError = '',
}) {
  const scheduleItems = Array.isArray(schedule) ? schedule : [];

  if (!scheduleItems.length) {
    if (isLoading || apiError) return null;

    return (
      <EmptyState
        compact
        className="setting-medication-list__empty"
        title="복약 정보를 등록해보세요"
        description="복약 정보를 추가하면 이곳에서 확인할 수 있어요."
      />
    );
  }

  return (
    <ul className="setting-medication-list">
      {scheduleItems.map(({ id, time, label, medicationName, taken, checkDate, isPreviousDose }) => {
        const isTaken = Boolean(taken);

        return (
        <li key={id ?? `${time}-${label}`}>
          <span className="setting-medication-list__time">{time}</span>
          <span className="setting-medication-list__name">{label ?? medicationName}</span>
          {onCheck && (
            <button
              type="button"
              className={`setting-medication-list__check${isTaken ? ' is-taken' : ''}`}
              onClick={() => onCheck(id, checkDate)}
              disabled={id == null || isTaken}
            >
              {isTaken ? (isPreviousDose ? '어제 복용 확인' : '복용 완료') : isPreviousDose ? '어제 복용 체크' : '복용 확인'}
            </button>
          )}
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
        );
      })}
    </ul>
  );
}

export default SettingMedicationList;
