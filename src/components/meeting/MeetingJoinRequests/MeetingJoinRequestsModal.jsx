import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import '../../common/ActionModal/ActionModal.css';
import './MeetingJoinRequestsModal.css';
import profileFallback from '../../../assets/images/profile.png';
import EmptyState from '../../common/EmptyState/EmptyState';

/** 모임 가입을 요청한 사람을 보여 주고 승인·거부를 고르는 모달입니다. */
export default function MeetingJoinRequestsModal({ requests = [], onApprove, onReject, onClose }) {
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose?.();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  async function run(request, handler) {
    setBusyId(request.id);
    try {
      await handler?.(request);
    } finally {
      setBusyId(null);
    }
  }

  return createPortal(
    <div
      className="action-modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <div className="action-modal join-requests-modal" role="dialog" aria-modal="true" aria-label="가입 요청">
        <header className="action-modal__header">
          <h2>가입 요청{requests.length > 0 ? ` (${requests.length})` : ''}</h2>
          <button type="button" className="action-modal__close" aria-label="닫기" onClick={onClose}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <path d="M5 5l14 14M19 5L5 19" />
            </svg>
          </button>
        </header>
        {requests.length === 0 ? (
          <EmptyState
            compact
            title="가입 요청을 기다려보세요"
            description="새 가입 요청이 오면 이곳에서 확인할 수 있어요."
          />
        ) : (
          <ul className="join-requests-modal__list">
            {requests.map((request) => (
              <li key={request.id} className="join-requests-modal__item">
                <img
                  className="join-requests-modal__avatar"
                  src={request.profileImage || profileFallback}
                  alt=""
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = profileFallback;
                  }}
                />
                <div className="join-requests-modal__name">
                  <strong>{request.nickname || '이름 없음'}</strong>
                  {request.loginId && <span>@{request.loginId}</span>}
                </div>
                <div className="join-requests-modal__actions">
                  <button
                    type="button"
                    className="join-requests-modal__approve"
                    disabled={busyId === request.id}
                    onClick={() => run(request, onApprove)}
                  >
                    승인
                  </button>
                  <button
                    type="button"
                    className="join-requests-modal__reject"
                    disabled={busyId === request.id}
                    onClick={() => run(request, onReject)}
                  >
                    거부
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>,
    document.body,
  );
}
