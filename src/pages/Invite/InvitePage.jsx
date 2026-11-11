import { useState } from 'react';
import Skeleton from '../../components/common/Skeleton/Skeleton';
import Layout from '../../components/common/Layout/Layout';
import './InvitePage.css';

/** 초대 코드로 모임 정보를 확인하고 가입하는 임시 화면입니다. (/invite?code=코드) */
function InvitePage({ onInviteLoad, onInviteJoin, onNavigate }) {
  const initialCode = new URLSearchParams(window.location.search).get('code') ?? '';
  const [code, setCode] = useState(initialCode);
  const [invite, setInvite] = useState(null);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  async function handleLoad(event) {
    event?.preventDefault();
    const trimmedCode = code.trim();
    if (!trimmedCode) return;
    setIsBusy(true);
    setMessage('');
    setIsError(false);
    try {
      setInvite(await onInviteLoad?.(trimmedCode));
    } catch (error) {
      setInvite(null);
      setMessage(error?.message ?? '초대 정보를 불러오지 못했습니다.');
      setIsError(true);
    } finally {
      setIsBusy(false);
    }
  }

  async function handleJoin() {
    setIsBusy(true);
    setMessage('');
    setIsError(false);
    try {
      await onInviteJoin?.(code.trim());
      onNavigate?.('/meeting/my');
    } catch (error) {
      setMessage(error?.message ?? '모임에 가입하지 못했습니다.');
      setIsError(true);
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <Layout className="invite-layout">
      <section className="invite-page" aria-labelledby="invite-title">
        <h1 id="invite-title">모임 초대</h1>
        <form className="invite-page__form" onSubmit={handleLoad}>
          <input
            type="text"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="초대 코드"
            aria-label="초대 코드"
          />
          <button type="submit" disabled={isBusy || !code.trim()}>
            확인
          </button>
        </form>
        {isBusy && !invite && (
          <div className="invite-page__card" role="status" aria-busy="true" aria-label="초대 정보를 불러오는 중입니다.">
            <Skeleton text width="50%" height={28} />
            <Skeleton text width="90%" />
            <Skeleton text width="40%" />
            <Skeleton width={110} height={44} style={{ borderRadius: 10 }} />
          </div>
        )}
        {invite && (
          <div className="invite-page__card">
            <h2>{invite.name}</h2>
            <p>{invite.description}</p>
            <p>
              회원 {invite.memberCount ?? 0}명 ·{' '}
              {invite.approvalRequired ? '가입 승인제' : '바로 가입'}
              {invite.isPrivate ? ' · 비공개' : ''}
            </p>
            <button type="button" onClick={handleJoin} disabled={isBusy}>
              {invite.approvalRequired ? '가입 신청하기' : '가입하기'}
            </button>
          </div>
        )}
        {message && (
          <p className={`invite-page__message${isError ? ' invite-page__message--error' : ''}`} role={isError ? 'alert' : 'status'}>
            {message}
          </p>
        )}
      </section>
    </Layout>
  );
}

export default InvitePage;
