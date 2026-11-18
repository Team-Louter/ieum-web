import './SettingGuardianList.css';
import profileImg from '../../../assets/images/profile.png';
import EmptyState from '../../common/EmptyState/EmptyState';
import useProfileImages from '../../../hooks/useProfileImages';
import Button from '../../common/Button/Button';

function SettingGuardianList({
  guardians: guardianItems = [],
  isEditing = false,
  isBusy = false,
  onRemove,
  emptyMessage = '연결하면 복약 상태와 위치를 함께 확인할 수 있어요.',
  isLoading = false,
  apiError = '',
}) {
  const guardians = useProfileImages(guardianItems);

  if (!guardians.length) {
    if (isLoading || apiError) return null;

    return (
      <EmptyState
        compact
        className="setting-guardian-list__empty"
        title="가족 계정을 연결해보세요"
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
            : (guardian.nickname ?? guardian.name ?? '');
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
            <img loading="lazy" decoding="async" className="setting-guardian-list__avatar" src={guardianImage} alt="" />
            <span>{guardianName}</span>
            {isEditing && onRemove && (
              <Button
                type="button"
                className="setting-guardian-list__remove"
                onClick={() => onRemove(guardian)}
                disabled={!(targetLoginId || guardian?.connectionId) || isBusy}
              >
                삭제
              </Button>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default SettingGuardianList;
