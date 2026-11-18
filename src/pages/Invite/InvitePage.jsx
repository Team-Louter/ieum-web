import { useEffect, useRef, useState } from 'react';
import Skeleton from '../../components/common/Skeleton/Skeleton';
import Layout from '../../components/common/Layout/Layout';
import './InvitePage.css';
import Button from '../../components/common/Button/Button';

/** 초대 코드로 모임 정보를 확인하고 가입하는 임시 화면입니다. (/invite?code=코드) */
function InvitePage({ onInviteLoad, onInviteJoin, onNavigate }) {
  const initialCode = new URLSearchParams(window.location.search).get('code') ?? '';
  const [code, setCode] = useState(initialCode);
  const [invite, setInvite] = useState(null);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  // 가입을 마친 뒤의 상태입니다. 'pending'이면 모임장·관리자의 승인을 기다리는 중입니다.
  const [joinState, setJoinState] = useState('');
  const autoLoadedRef = useRef(false);

  async function loadInvite(targetCode) {
    const trimmedCode = targetCode.trim();
    if (!trimmedCode) return;
    setIsBusy(true);
    setMessage('');
    setIsError(false);
    setJoinState('');
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

  function handleLoad(event) {
    event?.preventDefault();
    return loadInvite(code);
  }

  // 주소에 코드가 들어 있으면(/invite?code=...) 직접 열거나 새로고침해도 바로 모임 정보를 보여줍니다.
  useEffect(() => {
    if (autoLoadedRef.current || !initialCode.trim()) return;
    autoLoadedRef.current = true;
    loadInvite(initialCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleJoin() {
    setIsBusy(true);
    setMessage('');
    setIsError(false);
    try {
      const membership = await onInviteJoin?.(code.trim());
      const status = String(membership?.status ?? membership?.membershipStatus ?? '').toUpperCase();
      if (status === 'PENDING' || (!status && invite?.approvalRequired)) {
        // 승인제 모임은 바로 들어가지 못하므로 이 화면에서 가입 대기 중임을 알려줍니다.
        setJoinState('pending');
      } else {
        onNavigate?.('/meeting/my');
      }
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
          <Button type="submit" disabled={isBusy || !code.trim()} loading={isBusy}>
            확인
          </Button>
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
            {joinState === 'pending' ? (
              <>
                <p className="invite-page__pending" role="status">가입 승인 대기 중</p>
                <p>모임장이나 관리자가 승인하면 모임에 들어갈 수 있어요.</p>
                <button type="button" onClick={() => onNavigate?.('/meeting/my')}>
                  내 모임 보기
                </button>
              </>
            ) : (
              <Button type="button" onClick={handleJoin} disabled={isBusy} loading={isBusy}>
                {invite.approvalRequired ? '가입 신청하기' : '가입하기'}
              </Button>
            )}
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
