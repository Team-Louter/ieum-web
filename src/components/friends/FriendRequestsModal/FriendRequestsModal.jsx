import { useEffect, useState } from 'react';
import profilePlaceholder from '../../../assets/images/profile.png';
import EmptyState from '../../common/EmptyState/EmptyState';
import './FriendRequestsModal.css';

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

  return (
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
            ×
          </button>
        </header>

        {requests.length > 0 ? (
          <ul className="friend-requests-modal__list">
            {requests.map((request) => {
              const friendshipId = request.friendshipId ?? request.id;
              const requesterId = request.fromUserId ?? request.userId;
              const requesterLoginId = request.fromUserLoginId ?? request.loginId ?? '';
              const requesterNickname = request.fromUserNickname ?? request.nickname ?? '';
              const requesterName =
                requesterLoginId ||
                requesterNickname ||
                `사용자 ${requesterId ?? ''}`;
              const isProcessing = String(processingId) === String(friendshipId);

              return (
                <li className="friend-requests-modal__item" key={friendshipId}>
                  <img
                    src={request.profileImage ?? profilePlaceholder}
                    alt=""
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = profilePlaceholder;
                    }}
                  />
                  <div className="friend-requests-modal__person">
                    <strong>{requesterName}</strong>
                    {requesterLoginId && requesterNickname && requesterLoginId !== requesterNickname ? (
                      <span>{requesterNickname}</span>
                    ) : !requesterLoginId && requesterId != null ? (
                      <span>사용자 ID {requesterId}</span>
                    ) : null}
                  </div>
                  <div className="friend-requests-modal__actions">
                    <button
                      type="button"
                      className="friend-requests-modal__reject"
                      onClick={() => handleRequestAction(onReject, friendshipId)}
                      disabled={processingId != null}
                    >
                      {isProcessing ? '처리 중' : '거절'}
                    </button>
                    <button
                      type="button"
                      className="friend-requests-modal__accept"
                      onClick={() => handleRequestAction(onAccept, friendshipId)}
                      disabled={processingId != null}
                    >
                      {isProcessing ? '처리 중' : '수락'}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : !isLoading && !apiError ? (
          <EmptyState
            compact
            className="friend-requests-modal__empty"
            title="새로운 친구 신청이 없어요"
            description="친구 신청을 받으면 이곳에서 확인할 수 있어요."
          />
        ) : null}
      </section>
    </div>
  );
}

export default FriendRequestsModal;
