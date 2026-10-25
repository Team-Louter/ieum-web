import { useState } from 'react';
import SettingDialog from '../../../components/setting/SettingDialog/SettingDialog';
import SettingGuardianList from '../../../components/setting/SettingGuardianList/SettingGuardianList';
import SettingItem from '../../../components/setting/SettingItem/SettingItem';
import SettingToggleRow from '../../../components/setting/SettingToggleRow/SettingToggleRow';
import './SettingGuardianPage.css';

function SettingGuardianPage({ settings = {}, onToggle, guardians = [], role }) {
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);
  const [accountIdentifier, setAccountIdentifier] = useState('');
  const sourceGuardians = Array.isArray(guardians) ? guardians : [];
  const guardianSignature = JSON.stringify(sourceGuardians);
  const [management, setManagement] = useState(() => ({
    signature: guardianSignature,
    items: sourceGuardians,
  }));
  const [formMessage, setFormMessage] = useState('');
  const canEditPermissions = role === 'ROLE_SENIOR';
  const isGuardian = role === 'ROLE_GUARDIAN';
  const managedGuardians =
    management.signature === guardianSignature ? management.items : sourceGuardians;

  const handleAddAccount = async (event) => {
    event.preventDefault();
    const identifier = accountIdentifier.trim();
    if (!identifier) return;
    const normalizedIdentifier = identifier.toLowerCase();
    const duplicate = managedGuardians.some((guardian) => {
      const values =
        typeof guardian === 'string'
          ? [guardian]
          : [guardian.loginId, guardian.email, guardian.nickname, guardian.name, guardian.id];
      return values.some(
        (value) =>
          String(value ?? '')
            .trim()
            .toLowerCase() === normalizedIdentifier,
      );
    });
    if (duplicate) {
      setFormMessage('이미 목록에 있는 계정입니다.');
      return;
    }

    const name = identifier.includes('@') ? identifier.split('@')[0] : identifier;
    const newAccount = {
      id: `temporary-${Date.now()}`,
      loginId: identifier,
      email: identifier.includes('@') ? identifier : '',
      nickname: name,
      name,
      localOnly: true,
    };
    setManagement((current) => ({
      signature: guardianSignature,
      items: [
        ...(current.signature === guardianSignature ? current.items : sourceGuardians),
        newAccount,
      ],
    }));
    setAccountIdentifier('');
    setFormMessage('목록에 추가했습니다.');
  };

  const handleDisconnect = async (loginId) => {
    if (!loginId) return;
    setManagement((current) => ({
      signature: guardianSignature,
      items: (current.signature === guardianSignature ? current.items : sourceGuardians).filter(
        (guardian) => {
          const identifier =
            typeof guardian === 'string'
              ? guardian
              : (guardian.loginId ?? guardian.email ?? guardian.id);
          return String(identifier) !== String(loginId);
        },
      ),
    }));
    setFormMessage('목록에서 삭제했습니다.');
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
          guardians={managedGuardians}
          emptyMessage={isGuardian ? '연결된 어르신이 없습니다.' : '연결된 보호자가 없습니다.'}
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
              guardians={managedGuardians}
              isEditing
              emptyMessage={isGuardian ? '연결된 어르신이 없습니다.' : '연결된 보호자가 없습니다.'}
              onRemove={handleDisconnect}
            />
          </div>
          <form
            className="setting-dialog__form setting-guardian-manager__form"
            onSubmit={handleAddAccount}
          >
            <label className="setting-dialog__field">
              {isGuardian ? '어르신 가입 이메일' : '보호자 계정 이메일 또는 아이디'}
              <input
                type="text"
                value={accountIdentifier}
                onChange={(event) => setAccountIdentifier(event.target.value)}
                placeholder="이메일 또는 아이디"
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
                disabled={!accountIdentifier.trim()}
              >
                {isGuardian ? '어르신 추가' : '보호자 추가'}
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
        </SettingDialog>
      )}
    </div>
  );
}

export default SettingGuardianPage;
