import './SettingMedicationList.css';

function SettingMedicationList({ schedule = [] }) {
  const scheduleItems = schedule ?? [];
  return (
    <ul className="setting-medication-list">
      {scheduleItems.map(({ id, time, label, medicationName }) => (
        <li key={id ?? `${time}-${label}`}>
          <span className="setting-medication-list__time">{time}</span>
          <span>{label ?? medicationName}</span>
        </li>
      ))}
    </ul>
  );
}

export default SettingMedicationList;
