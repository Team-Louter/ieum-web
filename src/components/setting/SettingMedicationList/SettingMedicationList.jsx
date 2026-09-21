import './SettingMedicationList.css';

const medicationSchedule = [
  { time: '오전 8:00', label: '아침 복약 알림' },
  { time: '오후 1:00', label: '점심 복약 알림' },
  { time: '오후 8:00', label: '저녁 복약 알림' },
];

function SettingMedicationList() {
  return (
    <ul className="setting-medication-list">
      {medicationSchedule.map(({ time, label }) => (
        <li key={time}>
          <span className="setting-medication-list__time">{time}</span>
          {label}
        </li>
      ))}
    </ul>
  );
}

export default SettingMedicationList;
