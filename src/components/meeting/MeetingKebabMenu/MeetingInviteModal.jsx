import { useEffect, useRef, useState } from 'react';
import ActionModal from '../../common/ActionModal/ActionModal';
import './MeetingInviteModal.css';

/** 만든 초대 링크와 초대 코드를 보여 주고, 각각 복사할 수 있게 하는 모달입니다. */
export default function MeetingInviteModal({ invite, meetingName = '', onClose }) {
  const [copied, setCopied] = useState('');
  const [message, setMessage] = useState('');
  const timerRef = useRef(null);

  // 서버가 주는 주소는 API 주소라서, 사람들이 열 수 있는 이음 가입 화면 주소로 바꿉니다.
  const shareLink = invite?.code
    ? `${window.location.origin}/invite?code=${encodeURIComponent(invite.code)}`
    : (invite?.url ?? '');

  // 다른 사람에게 그대로 붙여넣어 보낼 수 있는 초대 메시지입니다. (링크와 코드를 한 번에 복사)
  const expiresText = invite?.expiresAt
    ? `\n유효 기간: ${new Date(invite.expiresAt).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}까지`
    : '';
  const inviteMessage = [
    `${meetingName ? `'${meetingName}' 모임` : '이음 모임'}에서 초대합니다!`,
    '',
    `초대 링크: ${shareLink}`,
    `초대 코드: ${invite?.code ?? ''}${expiresText}`,
    '',
    '링크를 열어 가입하거나, 이음 초대 화면에서 초대 코드를 입력해 가입해 주세요.',
  ].join('\n');

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  async function copy(kind, text) {
    window.clearTimeout(timerRef.current);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      setMessage('');
      timerRef.current = window.setTimeout(() => setCopied(''), 1800);
    } catch {
      setCopied('');
      setMessage('복사하지 못했습니다. 직접 선택해서 복사해 주세요.');
    }
  }

  return (
    <ActionModal
      title="초대 링크"
      primaryLabel={copied === 'message' ? '복사했어요' : '초대 메시지 복사하기'}
      secondaryLabel="닫기"
      onPrimary={() => copy('message', inviteMessage)}
      onClose={onClose}
    >
      <div className="meeting-invite-modal">
        <section className="meeting-invite-modal__section">
          <h3>초대 링크</h3>
          <div className="meeting-invite-modal__row">
            <p className="meeting-invite-modal__value">{shareLink}</p>
            <button type="button" onClick={() => copy('link', shareLink)}>
              {copied === 'link' ? '복사됨' : '복사'}
            </button>
          </div>
        </section>
        <section className="meeting-invite-modal__section">
          <h3>초대 코드</h3>
          <div className="meeting-invite-modal__row">
            <p className="meeting-invite-modal__value">{invite?.code}</p>
            <button type="button" onClick={() => copy('code', invite?.code ?? '')}>
              {copied === 'code' ? '복사됨' : '복사'}
            </button>
          </div>
        </section>
        {invite?.expiresAt && (
          <p className="meeting-invite-modal__expires">
            유효 기간: {new Date(invite.expiresAt).toLocaleString('ko-KR')}까지 (7일)
          </p>
        )}
        {message && (
          <p className="meeting-invite-modal__message" role="status">
            {message}
          </p>
        )}
      </div>
    </ActionModal>
  );
}
