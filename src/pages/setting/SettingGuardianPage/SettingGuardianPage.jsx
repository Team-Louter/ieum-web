import { useState } from 'react';
import SettingDialog from '../../../components/setting/SettingDialog/SettingDialog';
import SettingGuardianList from '../../../components/setting/SettingGuardianList/SettingGuardianList';
import SettingItem from '../../../components/setting/SettingItem/SettingItem';
import SettingToggleRow from '../../../components/setting/SettingToggleRow/SettingToggleRow';
import './SettingGuardianPage.css';

function SettingGuardianPage({
  settings = {},
  onToggle,
  guardians = [],
  role,
  onConnect,
  onDisconnect,
  isLoading = false,
  apiError = '',
}) {
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);
  const [accountIdentifier, setAccountIdentifier] = useState('');
  const sourceGuardians = Array.isArray(guardians) ? guardians : [];
  const [formMessage, setFormMessage] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const canEditPermissions = role === 'ROLE_SENIOR';
  const isGuardian = role === 'ROLE_GUARDIAN';
  const canConnectGuardian = role === 'ROLE_SENIOR';

  const handleAddAccount = async (event) => {
    event.preventDefault();
    const identifier = accountIdentifier.trim();
    if (!identifier) return;
    if (!identifier.includes('@')) {
      setFormMessage('보호자 계정의 가입 이메일을 입력해 주세요.');
      return;
    }
    const normalizedIdentifier = identifier.toLowerCase();
    const duplicate = sourceGuardians.some((guardian) =>
      [guardian.loginId, guardian.email]
        .filter(Boolean)
        .some((value) => String(value).trim().toLowerCase() === normalizedIdentifier),
    );
    if (duplicate) {
      setFormMessage('이미 연결된 계정입니다.');
      return;
    }
    if (typeof onConnect !== 'function') {
      setFormMessage('보호자 연결 API를 사용할 수 없습니다.');
      return;
    }
    setIsBusy(true);
    setFormMessage('');
    try {
      await onConnect(identifier);
      setAccountIdentifier('');
      setFormMessage('보호자 계정을 연결했습니다.');
    } catch (error) {
      setFormMessage(error?.message ?? '보호자 계정을 연결하지 못했습니다.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleDisconnect = async (loginId) => {
    if (!loginId) return;
    if (typeof onDisconnect !== 'function') {
      setFormMessage('가족 연결 해제 API를 사용할 수 없습니다.');
      return;
    }
    setIsBusy(true);
    setFormMessage('');
    try {
      await onDisconnect(loginId);
      setFormMessage('가족 연결을 해제했습니다.');
    } catch (error) {
      setFormMessage(error?.message ?? '가족 연결을 해제하지 못했습니다.');
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="setting-page-section">
      <SettingItem
        title={isGuardian ? '연결된 어르신' : '보호자 명단'}
        description={
          isGuardian
            ? '연결된 어르신 계정을 확인하고 관리할 수 있습니다.'
            : '연결된 보호자 계정을 확인하고 관리할 수 있습니다.'
        }
        actionLabel="수정하기"
        onAction={() => {
          setFormMessage('');
          setIsManageDialogOpen(true);
        }}
      >
        <SettingGuardianList
          guardians={sourceGuardians}
          displayLoginId={isGuardian}
          emptyMessage={isGuardian ? '연결된 어르신이 없습니다.' : '연결된 보호자가 없습니다.'}
          isLoading={isLoading}
          apiError={apiError}
        />
      </SettingItem>

      <SettingItem
        title="보호자 권한 설정"
        description="보호자에게 허용할 정보와 알림 권한을 설정할 수 있습니다."
        className="setting-guardian-page__permission-card"
      >
        <SettingToggleRow
          title="활동 현황 확인 설정"
          description={
            canEditPermissions
              ? '어르신이 12시간 동안 앱을 사용하지 않거나 활동이 없을 때 보호자에게 알림을 보냅니다.'
              : '어르신 계정에서 변경할 수 있는 설정입니다.'
          }
          checked={settings.guardianActivity ?? false}
          onChange={() => onToggle?.('guardianActivity')}
          disabled={!canEditPermissions}
        />
        <SettingToggleRow
          title="복약 미이행 알림 수신 여부"
          description={
            canEditPermissions
              ? '어르신이 복약 알림을 확인하지 않고 30분이 지났을 때 보호자에게 알림을 보냅니다.'
              : '어르신 계정에서 변경할 수 있는 설정입니다.'
          }
          checked={settings.guardianMedication ?? false}
          onChange={() => onToggle?.('guardianMedication')}
          disabled={!canEditPermissions}
        />
        <SettingToggleRow
          title="위치 공유 권한 및 범위 설정"
          description="보호자에게 현재 위치를 공유할지 선택합니다."
          checked={settings.guardianLocation ?? false}
          onChange={() => onToggle?.('guardianLocation')}
        />
      </SettingItem>

      {isManageDialogOpen && (
        <SettingDialog
          title={isGuardian ? '연결된 어르신 관리' : '보호자 명단 관리'}
          description={
            isGuardian
              ? '어르신 계정을 연결하거나 기존 연결을 해제할 수 있습니다.'
              : '보호자 계정을 추가하거나 기존 연결을 해제할 수 있습니다.'
          }
          className="setting-dialog--guardian-manager"
          onClose={() => setIsManageDialogOpen(false)}
        >
          <div className="setting-guardian-manager__list">
            <SettingGuardianList
              guardians={sourceGuardians}
              displayLoginId={isGuardian}
              isEditing
              isBusy={isBusy}
              onRemove={handleDisconnect}
              emptyMessage={isGuardian ? '연결된 어르신이 없습니다.' : '연결된 보호자가 없습니다.'}
              isLoading={isLoading}
              apiError={apiError}
            />
          </div>
          {canConnectGuardian ? (
            <form
              className="setting-dialog__form setting-guardian-manager__form"
              onSubmit={handleAddAccount}
            >
              <label className="setting-dialog__field">
                보호자 계정 이메일
                <input
                  type="email"
                  value={accountIdentifier}
                  onChange={(event) => setAccountIdentifier(event.target.value)}
                  placeholder="보호자 가입 이메일"
                  required
                />
              </label>
              {formMessage && (
                <p className="setting-dialog__note" role="status">
                  {formMessage}
                </p>
              )}
              <div className="setting-dialog__actions setting-guardian-manager__actions">
                <button
                  className="setting-dialog__button setting-dialog__button--primary"
                  type="submit"
                  disabled={isBusy || !accountIdentifier.trim()}
                >
                  {isBusy ? '연결 중…' : '보호자 연결'}
                </button>
                <button
                  className="setting-dialog__button"
                  type="button"
                  onClick={() => setIsManageDialogOpen(false)}
                >
                  완료
                </button>
              </div>
            </form>
          ) : (
            <div className="setting-dialog__form setting-guardian-manager__form">
              <p className="setting-dialog__note">
                어르신 계정에서 보호자 이메일을 입력해 연결할 수 있습니다.
              </p>
              {formMessage && (
                <p className="setting-dialog__note" role="status">
                  {formMessage}
                </p>
              )}
              <div className="setting-dialog__actions setting-guardian-manager__actions">
                <button
                  className="setting-dialog__button setting-dialog__button--primary"
                  type="button"
                  onClick={() => setIsManageDialogOpen(false)}
                >
                  완료
                </button>
              </div>
            </div>
          )}
        </SettingDialog>
      )}
    </div>
  );
}

export default SettingGuardianPage;
