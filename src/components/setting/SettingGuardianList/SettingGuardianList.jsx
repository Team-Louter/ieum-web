import './SettingGuardianList.css';
import profileImg from '../../../assets/images/profile.png';

function SettingGuardianList({ guardians = [] }) {
  return (
    <ul className="setting-guardian-list">
      {guardians.map((guardian, index) => {
        const guardianName = typeof guardian === 'string'
          ? guardian
          : guardian.nickname ?? guardian.name ?? guardian.id ?? '';
        const guardianImage = typeof guardian === 'string'
          ? profileImg
          : guardian.profileImage ?? guardian.profile_image ?? profileImg;

        return (
          <li key={typeof guardian === 'string' ? `${guardian}-${index}` : guardian.id ?? index}>
            <img className="setting-guardian-list__avatar" src={guardianImage} alt="" />
            <span>{guardianName}</span>
          </li>
        );
      })}
    </ul>
  );
}

export default SettingGuardianList;
