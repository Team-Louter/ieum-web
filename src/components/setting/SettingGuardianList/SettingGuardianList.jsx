import './SettingGuardianList.css';
import profileImg from '../../../assets/images/profile.png';
import EmptyState from '../../common/EmptyState/EmptyState';

function SettingGuardianList({
  guardians = [],
  displayLoginId = false,
  isEditing = false,
  isBusy = false,
  onRemove,
  emptyMessage = '연결된 보호자/어르신이 없습니다.',
  isLoading = false,
  apiError = '',
}) {
  if (!guardians.length) {
    if (isLoading || apiError) return null;

    return (
      <EmptyState
        compact
        className="setting-guardian-list__empty"
        title="연결된 계정이 없어요"
        description={emptyMessage}
      />
    );
  }

  return (
    <ul className="setting-guardian-list">
      {guardians.map((guardian, index) => {
        const guardianName =
          typeof guardian === 'string'
            ? guardian
            : displayLoginId
              ? (guardian.loginId ?? guardian.id ?? guardian.nickname ?? guardian.name ?? '')
              : (guardian.nickname ?? guardian.name ?? guardian.loginId ?? guardian.id ?? '');
        const guardianImage =
          typeof guardian === 'string'
            ? profileImg
            : (guardian.profileImage ?? guardian.profile_image ?? profileImg);

        const targetLoginId =
          typeof guardian === 'string' ? guardian : (guardian.loginId ?? guardian.id);

        return (
          <li
            key={
              typeof guardian === 'string'
                ? `${guardian}-${index}`
                : (guardian.id ?? guardian.loginId ?? index)
            }
          >
            <img className="setting-guardian-list__avatar" src={guardianImage} alt="" />
            <span>{guardianName}</span>
            {isEditing && onRemove && (
              <button
                type="button"
                className="setting-guardian-list__remove"
                onClick={() => onRemove(targetLoginId)}
                disabled={!targetLoginId || isBusy}
              >
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
