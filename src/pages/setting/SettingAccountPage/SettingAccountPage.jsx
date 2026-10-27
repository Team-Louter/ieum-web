import { useState } from 'react';
import SettingDialog from '../../../components/setting/SettingDialog/SettingDialog';
import SettingItem from '../../../components/setting/SettingItem/SettingItem';
import { isPasswordValid } from '../../../utils/validation';
import SettingLegalDocument from './SettingLegalDocument';
import './SettingLegalDocument.css';

const accountItems = [
  { id: 'loginId', title: '아이디', description: '회원가입할 때 설정한 로그인 아이디입니다.' },
  {
    id: 'email',
    title: '이메일',
    description: '계정에 표시할 이메일을 관리할 수 있습니다.',
    actionLabel: '수정하기',
  },
  {
    id: 'password',
    title: '비밀번호',
    description: '이메일 인증 후 비밀번호를 변경할 수 있습니다.',
    actionLabel: '변경하기',
  },
  {
    id: 'terms',
    title: '이용약관',
    description: '이음 서비스의 이용약관을 확인할 수 있습니다.',
    actionLabel: '확인하기',
  },
  {
    id: 'privacy',
    title: '개인정보 처리방침',
    description: '이음 서비스의 개인정보 처리방침을 확인할 수 있습니다.',
    actionLabel: '확인하기',
  },
];

function SettingAccountPage({
  currentLoginId = '',
  accountEmail = '',
  onLocalAccountChange,
  onSendRecoveryCode,
  onVerifyRecoveryCode,
  onResetPassword,
}) {
  const [activeDialog, setActiveDialog] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [messageIsError, setMessageIsError] = useState(false);
  const [displayEmail, setDisplayEmail] = useState(accountEmail);
  const [fieldValue, setFieldValue] = useState('');

  const closeDialog = () => {
    setActiveDialog('');
    setMessage('');
    setMessageIsError(false);
  };

  const openDialog = (itemId) => {
    setActiveDialog(itemId);
    setMessage('');
    setMessageIsError(false);
    if (itemId === 'email') setFieldValue(displayEmail);
    if (itemId === 'password') {
      setEmail('');
      setCode('');
      setNewPassword('');
      setCodeSent(false);
      setVerified(false);
    }
  };

  const saveLocalAccountField = async (event, field) => {
    event.preventDefault();
    const value = fieldValue.trim();
    if (!value) {
      setMessage('이메일을 입력해 주세요.');
      setMessageIsError(true);
      return;
    }

    try {
      await onLocalAccountChange?.(field, value);
      if (field === 'email') setDisplayEmail(value);
      closeDialog();
    } catch (error) {
      setMessage(error?.message ?? '저장하지 못했습니다.');
      setMessageIsError(true);
    }
  };

  const runPasswordStep = async (action, successMessage) => {
    if (typeof action !== 'function') {
      setMessage('현재 서버 연결에서 이 기능을 사용할 수 없습니다.');
      setMessageIsError(true);
      return false;
    }
    setBusy(true);
    setMessage('');
    setMessageIsError(false);
    try {
      await action();
      setMessage(successMessage);
      return true;
    } catch (error) {
      setMessage(error?.message ?? '요청에 실패했습니다.');
      setMessageIsError(true);
      return false;
    } finally {
      setBusy(false);
    }
  };

  const handleSendCode = async () => {
    if (!email.trim()) {
      setMessage('가입할 때 사용한 이메일을 입력해 주세요.');
      setMessageIsError(true);
      return;
    }
    if (
      await runPasswordStep(
        () => onSendRecoveryCode(email.trim()),
        '인증 코드를 이메일로 발송했습니다.',
      )
    ) {
      setCodeSent(true);
    }
  };

  const handleVerifyCode = async () => {
    if (!code.trim()) {
      setMessage('이메일로 받은 인증 코드를 입력해 주세요.');
      setMessageIsError(true);
      return;
    }
    if (
      await runPasswordStep(
        () => onVerifyRecoveryCode(email.trim(), code.trim()),
        '이메일 인증이 완료되었습니다.',
      )
    ) {
      setVerified(true);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    if (!verified) {
      setMessage('먼저 이메일 인증을 완료해 주세요.');
      setMessageIsError(true);
      return;
    }
    if (!isPasswordValid(newPassword)) {
      setMessage('비밀번호는 8자 이상, 영문자·숫자·특수문자를 포함해야 합니다.');
      setMessageIsError(true);
      return;
    }
    const succeeded = await runPasswordStep(
      () => onResetPassword(email.trim(), newPassword),
      '비밀번호가 변경되었습니다.',
    );
    if (succeeded) closeDialog();
  };

  return (
    <div className="setting-page-section">
      {accountItems.map((item) => (
        <SettingItem
          key={item.id}
          title={item.title}
          description={
            item.id === 'loginId' && currentLoginId
              ? `가입 아이디: ${currentLoginId}`
              : item.id === 'email' && displayEmail
                ? `이메일: ${displayEmail}`
                : item.description
          }
          actionLabel={item.actionLabel}
          onAction={() => openDialog(item.id)}
        />
      ))}

      {activeDialog === 'email' && (
        <SettingDialog title="이메일" onClose={closeDialog}>
          <form
            className="setting-dialog__form"
            onSubmit={(event) => saveLocalAccountField(event, 'email')}
          >
            <label className="setting-dialog__field">
              이메일
              <input
                type="email"
                value={fieldValue}
                onChange={(event) => setFieldValue(event.target.value)}
                required
              />
            </label>
            {message && (
              <p
                className={`setting-dialog__note${messageIsError ? ' setting-dialog__note--error' : ''}`}
                role="status"
              >
                {message}
              </p>
            )}
            <div className="setting-dialog__actions">
              <button
                className="setting-dialog__button setting-dialog__button--primary"
                type="submit"
              >
                저장하기
              </button>
            </div>
          </form>
        </SettingDialog>
      )}

      {activeDialog === 'password' && (
        <SettingDialog
          title="비밀번호 변경"
          description="가입 이메일 인증을 마친 뒤 새 비밀번호를 설정해 주세요."
          onClose={closeDialog}
        >
          <form className="setting-dialog__form" onSubmit={handleResetPassword}>
            <label className="setting-dialog__field">
              가입 이메일
              <input
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setCode('');
                  setCodeSent(false);
                  setVerified(false);
                }}
                autoComplete="email"
                required
              />
            </label>
            <div className="setting-dialog__actions">
              <button
                className="setting-dialog__button"
                type="button"
                onClick={handleSendCode}
                disabled={busy}
              >
                {codeSent ? '인증 코드 다시 받기' : '인증 코드 받기'}
              </button>
            </div>
            {codeSent && (
              <>
                <label className="setting-dialog__field">
                  이메일 인증 코드
                  <input
                    inputMode="numeric"
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    autoComplete="one-time-code"
                  />
                </label>
                <div className="setting-dialog__actions">
                  <button
                    className="setting-dialog__button"
                    type="button"
                    onClick={handleVerifyCode}
                    disabled={busy || verified}
                  >
                    {verified ? '인증 완료' : '이메일 인증'}
                  </button>
                </div>
              </>
            )}
            {verified && (
              <label className="setting-dialog__field">
                새 비밀번호
                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  autoComplete="new-password"
                  required
                />
              </label>
            )}
            {message && (
              <p
                className={`setting-dialog__note${messageIsError ? ' setting-dialog__note--error' : ''}`}
                role="status"
              >
                {message}
              </p>
            )}
            {verified && (
              <div className="setting-dialog__actions">
                <button
                  className="setting-dialog__button setting-dialog__button--primary"
                  type="submit"
                  disabled={busy || !newPassword}
                >
                  {busy ? '변경 중…' : '비밀번호 변경'}
                </button>
              </div>
            )}
          </form>
        </SettingDialog>
      )}

      {(activeDialog === 'terms' || activeDialog === 'privacy') && (
        <SettingDialog
          title={activeDialog === 'terms' ? '이용약관' : '개인정보 처리방침'}
          onClose={closeDialog}
          className="setting-dialog--document"
        >
          <SettingLegalDocument type={activeDialog} />
        </SettingDialog>
      )}
    </div>
  );
}

export default SettingAccountPage;
