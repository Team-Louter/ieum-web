import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import profilePlaceholder from '../../../assets/images/profile.png';
import EmptyState from '../../common/EmptyState/EmptyState';
import Skeleton from '../../common/Skeleton/Skeleton';
import './FriendRequestsModal.css';
import Button from '../../common/Button/Button';

function FriendRequestsModal({
  requests = [],
  onAccept,
  onReject,
  onClose,
  isLoading = false,
  apiError = '',
}) {
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape' && processingId == null) onClose?.();
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, processingId]);

  async function handleRequestAction(action, friendshipId) {
    if (processingId != null) return;

    setProcessingId(friendshipId);
    try {
      await action?.(friendshipId);
    } finally {
      setProcessingId(null);
    }
  }

  function handleBackdropClick(event) {
    if (event.target === event.currentTarget && processingId == null) onClose?.();
  }

  return createPortal(
    <div className="friend-requests-modal" onMouseDown={handleBackdropClick} role="presentation">
      <section
        className="friend-requests-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="friend-requests-modal-title"
      >
        <header className="friend-requests-modal__header">
          <div>
            <h2 id="friend-requests-modal-title">친구 신청</h2>
            <p>받은 친구 신청을 확인하고 응답할 수 있습니다.</p>
          </div>
          <button
            className="friend-requests-modal__close"
            type="button"
            onClick={onClose}
            aria-label="친구 신청 창 닫기"
            disabled={processingId != null}
          >
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <path d="M5 5l14 14M19 5L5 19" />
            </svg>
          </button>
        </header>

        {requests.length > 0 ? (
          <ul className="friend-requests-modal__list">
            {requests.map((request) => {
              const friendshipId = request.friendshipId ?? request.id;
              const requesterId = request.fromUserId ?? request.userId;
              const requesterNickname = request.fromUserNickname ?? request.nickname ?? '';
              const requesterName = requesterNickname || `사용자 ${requesterId ?? ''}`;
              const isProcessing = String(processingId) === String(friendshipId);

              return (
                <li className="friend-requests-modal__item" key={friendshipId}>
                  <img loading="lazy" decoding="async"
                    src={request.profileImage ?? profilePlaceholder}
                    alt=""
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = profilePlaceholder;
                    }}
                  />
                  <div className="friend-requests-modal__person">
                    <strong>{requesterName}</strong>
                  </div>
                  <div className="friend-requests-modal__actions">
                    <Button
                      type="button"
                      className="friend-requests-modal__reject"
                      onClick={() => handleRequestAction(onReject, friendshipId)}
                      disabled={processingId != null}
                    >
                      거절
                    </Button>
                    <Button
                      type="button"
                      className="friend-requests-modal__accept"
                      onClick={() => handleRequestAction(onAccept, friendshipId)}
                      disabled={processingId != null}
                    >
                      수락
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : isLoading && !apiError ? (
          <ul
            className="friend-requests-modal__list"
            role="status"
            aria-busy="true"
            aria-label="친구 신청을 불러오는 중입니다."
          >
            {Array.from({ length: 2 }, (_, index) => (
              <li className="friend-requests-modal__item" key={index} aria-hidden="true">
                <Skeleton circle width={48} height={48} style={{ flex: '0 0 48px' }} />
                <div className="friend-requests-modal__person">
                  <Skeleton text width="45%" height={22} />
                  <Skeleton text width="30%" height={16} />
                </div>
                <div className="friend-requests-modal__actions">
                  <Skeleton width={64} height={36} style={{ borderRadius: 8 }} />
                  <Skeleton width={64} height={36} style={{ borderRadius: 8 }} />
                </div>
              </li>
            ))}
          </ul>
        ) : !isLoading && !apiError ? (
          <EmptyState
            compact
            className="friend-requests-modal__empty"
            title="친구 신청이 오면 여기에 표시돼요"
            description="친구 신청을 받으면 이곳에서 확인할 수 있어요."
          />
        ) : null}
      </section>
    </div>,
    document.body,
  );
}

export default FriendRequestsModal;
