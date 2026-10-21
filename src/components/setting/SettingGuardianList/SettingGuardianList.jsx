import './SettingGuardianList.css';

const guardians = ['보호자 아이디', '보호자 아이디', '보호자 아이디', '보호자 아이디'];

function SettingGuardianList() {
  return (
    <ul className="setting-guardian-list">
      {guardians.map((guardian, index) => (
        <li key={`${guardian}-${index}`}>
          <span aria-hidden="true">●</span>
          {guardian}
        </li>
      ))}
    </ul>
  );
}

export default SettingGuardianList;
