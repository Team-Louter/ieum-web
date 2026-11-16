import { useRef, useState } from 'react';
import Button from '../../../components/common/Button/Button';
import SettingDialog from '../../../components/setting/SettingDialog/SettingDialog';
import SettingGuardianList from '../../../components/setting/SettingGuardianList/SettingGuardianList';
import SettingItem from '../../../components/setting/SettingItem/SettingItem';
import SettingToggleRow from '../../../components/setting/SettingToggleRow/SettingToggleRow';
import './SettingGuardianPage.css';

function SettingGuardianPage({
  settings = {},
  onToggle,
  guardians = [],
  pendingConnections = [],
  role,
  onConnect,
  onRequestSenior,
  onAccept,
  onReject,
  onDisconnect,
  isLoading = false,
  apiError = '',
}) {
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);
  const [accountIdentifier, setAccountIdentifier] = useState('');
  const sourceGuardians = Array.isArray(guardians) ? guardians : [];
  const sourcePendingConnections = Array.isArray(pendingConnections) ? pendingConnections : [];
  const [formMessage, setFormMessage] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const submittingRef = useRef(false);
  const canEditPermissions = role === 'ROLE_SENIOR';
  const isGuardian = role === 'ROLE_GUARDIAN';

  const handleAddAccount = async (event) => {
    event.preventDefault();
    if (submittingRef.current) return;
    const identifier = accountIdentifier.trim();
    if (!identifier) return;
    if (!/^\S+@\S+\.\S+$/.test(identifier)) {
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
      setFormMessage('보호자 연결 요청 API를 사용할 수 없습니다.');
      return;
    }
    submittingRef.current = true;
    setIsBusy(true);
    setFormMessage('');
    try {
      await onConnect(identifier);
      setAccountIdentifier('');
      setFormMessage('보호자를 연결했습니다.');
    } catch (error) {
      setFormMessage(error?.message ?? '보호자 계정을 연결하지 못했습니다.');
    } finally {
      submittingRef.current = false;
      setIsBusy(false);
    }
  };

  // 보호자 계정이 어르신 이메일로 연결을 요청합니다. (임시 화면)
  const handleRequestSenior = async (event) => {
    event.preventDefault();
    if (submittingRef.current) return;
    const email = accountIdentifier.trim();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setFormMessage('어르신 계정의 가입 이메일을 입력해 주세요.');
      return;
    }
    if (typeof onRequestSenior !== 'function') {
      setFormMessage('어르신 연결 요청 API를 사용할 수 없습니다.');
      return;
    }
    submittingRef.current = true;
    setIsBusy(true);
    setFormMessage('');
    try {
      await onRequestSenior(email);
      setAccountIdentifier('');
      setFormMessage('어르신에게 연결 요청을 보냈습니다. 어르신이 수락하면 연결돼요.');
    } catch (error) {
      setFormMessage(error?.message ?? '연결 요청을 보내지 못했습니다.');
    } finally {
      submittingRef.current = false;
      setIsBusy(false);
    }
  };

  const handleDisconnect = async (connection) => {
    if (!connection) return;
    if (typeof onDisconnect !== 'function') {
      setFormMessage('가족 연결 해제 API를 사용할 수 없습니다.');
      return;
    }
    setIsBusy(true);
    setFormMessage('');
    try {
      await onDisconnect(connection);
      setFormMessage('가족 연결을 해제했습니다.');
    } catch (error) {
      setFormMessage(error?.message ?? '가족 연결을 해제하지 못했습니다.');
    } finally {
      setIsBusy(false);
    }
  };

  const handlePendingConnection = async (connection, action) => {
    const connectionId = connection?.connectionId ?? connection?.id;
    const callback = action === 'accept' ? onAccept : onReject;
    if (!connectionId || typeof callback !== 'function') {
      setFormMessage('연결 요청을 처리할 수 없습니다.');
      return;
    }
    setIsBusy(true);
    setFormMessage('');
    try {
      await callback(connectionId);
      setFormMessage(action === 'accept' ? '연결 요청을 수락했습니다.' : '연결 요청을 거절했습니다.');
    } catch (error) {
      setFormMessage(error?.message ?? '연결 요청을 처리하지 못했습니다.');
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
              ? '연결된 어르신과 받은 연결 요청을 확인할 수 있습니다.'
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
              ? '어르신이 보낸 연결 요청을 확인하고 수락하거나 거절할 수 있습니다.'
              : '보호자 이메일로 연결 요청을 보내거나 기존 연결을 해제할 수 있습니다.'
          }
          className="setting-dialog--guardian-manager"
          onClose={() => setIsManageDialogOpen(false)}
        >
          <div className="setting-guardian-manager__list">
            <SettingGuardianList
              guardians={sourceGuardians}
              isEditing
              isBusy={isBusy}
              onRemove={handleDisconnect}
              emptyMessage={isGuardian ? '연결된 어르신이 없습니다.' : '연결된 보호자가 없습니다.'}
              isLoading={isLoading}
              apiError={apiError}
            />
          </div>
          {isGuardian && sourcePendingConnections.length > 0 && (
            <section className="setting-guardian-manager__pending" aria-label="받은 연결 요청">
              <h3>받은 어르신 연결 요청</h3>
              <ul>
                {sourcePendingConnections.map((connection, index) => (
                  <li key={connection.connectionId ?? connection.id ?? index}>
                    <span>{connection.name ?? connection.nickname ?? '어르신 계정'}</span>
                    <div className="setting-guardian-manager__pending-actions">
                      <button
                        type="button"
                        className="setting-dialog__button setting-dialog__button--primary"
                        onClick={() => handlePendingConnection(connection, 'accept')}
                        disabled={isBusy}
                      >
                        수락
                      </button>
                      <button
                        type="button"
                        className="setting-dialog__button setting-guardian-manager__reject"
                        onClick={() => handlePendingConnection(connection, 'reject')}
                        disabled={isBusy}
                      >
                        거절
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {role === 'ROLE_SENIOR' ? (
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
                <Button
                  className="setting-dialog__button setting-dialog__button--primary"
                  type="submit"
                  disabled={isBusy || !accountIdentifier.trim()}
                  loading={isBusy}
                  loadingText="요청 중…"
                >
                  보호자 연결 요청
                </Button>
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
            <form
              className="setting-dialog__form setting-guardian-manager__form"
              onSubmit={handleRequestSenior}
            >
              <label className="setting-dialog__field">
                어르신 계정 이메일
                <input
                  type="email"
                  value={accountIdentifier}
                  onChange={(event) => setAccountIdentifier(event.target.value)}
                  placeholder="어르신 가입 이메일"
                  required
                />
              </label>
              <p className="setting-dialog__note">
                어르신이 보낸 연결 요청은 위에서 수락하거나 거절할 수 있습니다.
              </p>
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
                  {isBusy ? '요청 중…' : '어르신 연결 요청'}
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
          )}
        </SettingDialog>
      )}
    </div>
  );
}

export default SettingGuardianPage;
