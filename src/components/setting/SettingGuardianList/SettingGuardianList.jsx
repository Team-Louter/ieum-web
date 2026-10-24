import './SettingGuardianList.css';
import profileImg from '../../../assets/images/profile.png';

function SettingGuardianList({
  guardians = [],
  isEditing = false,
  isBusy = false,
  onRemove,
  emptyMessage = '연결된 보호자/어르신이 없습니다.',
}) {
  if (!guardians.length) {
    return <p className="setting-guardian-list__empty">{emptyMessage}</p>;
  }

  return (
    <ul className="setting-guardian-list">
      {guardians.map((guardian, index) => {
        const guardianName = typeof guardian === 'string'
          ? guardian
          : guardian.nickname ?? guardian.name ?? guardian.id ?? '';
        const guardianImage = typeof guardian === 'string'
          ? profileImg
          : guardian.profileImage ?? guardian.profile_image ?? profileImg;

        const targetLoginId = typeof guardian === 'string' ? guardian : guardian.loginId ?? guardian.id;

        return (
          <li key={typeof guardian === 'string' ? `${guardian}-${index}` : guardian.id ?? guardian.loginId ?? index}>
            <img className="setting-guardian-list__avatar" src={guardianImage} alt="" />
            <span>{guardianName}</span>
            {isEditing && onRemove && (
              <button type="button" className="setting-guardian-list__remove" onClick={() => onRemove(targetLoginId)} disabled={!targetLoginId || isBusy}>
                {isBusy ? '처리 중…' : '삭제'}
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default SettingGuardianList;
