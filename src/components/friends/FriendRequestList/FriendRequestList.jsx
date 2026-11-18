import { useState } from 'react';
import profilePlaceholder from '../../../assets/images/profile.png';
import { formatKoreanDateTime } from '../../../utils/dateTime';
import EmptyState from '../../common/EmptyState/EmptyState';
import Skeleton from '../../common/Skeleton/Skeleton';
import '../FriendRequestsModal/FriendRequestsModal.css';
import Button from '../../common/Button/Button';

/** 받은 친구 신청을 목록으로 보여 주고 수락·거절을 처리합니다. (친구 요청 탭에서 사용) */
function FriendRequestList({ requests = [], onAccept, onReject, isLoading = false, apiError = '' }) {
  const [processingId, setProcessingId] = useState(null);

  async function handleRequestAction(action, friendshipId) {
    if (processingId != null) return;

    setProcessingId(friendshipId);
    try {
      await action?.(friendshipId);
    } finally {
      setProcessingId(null);
    }
  }

  if (requests.length > 0) {
    return (
      <ul className="friend-requests-modal__list">
        {requests.map((request) => {
          const friendshipId = request.friendshipId ?? request.id;
          const requesterId = request.fromUserId ?? request.userId;
          const requesterNickname = request.fromUserNickname ?? request.nickname ?? '';
          const requesterName = requesterNickname || `사용자 ${requesterId ?? ''}`;
          const isProcessing = String(processingId) === String(friendshipId);

          return (
            <li className="friend-requests-modal__item" key={friendshipId}>
              <img
                loading="lazy"
                decoding="async"
                src={request.profileImage ?? profilePlaceholder}
                alt=""
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = profilePlaceholder;
                }}
              />
              <div className="friend-requests-modal__person">
                <strong>{requesterName}</strong>
                <span>
                  친구 요청을 보냈어요
                  {request.createdAt ? ` · ${formatKoreanDateTime(request.createdAt)}` : ''}
                </span>
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
    );
  }

  if (isLoading && !apiError) {
    return (
      <ul
        className="friend-requests-modal__list"
        role="status"
        aria-busy="true"
        aria-label="친구 요청을 불러오는 중입니다."
      >
        {Array.from({ length: 3 }, (_, index) => (
          <li className="friend-requests-modal__item" key={index} aria-hidden="true">
            <Skeleton circle width={48} height={48} style={{ flex: '0 0 48px' }} />
            <div className="friend-requests-modal__person">
              <Skeleton text width="45%" height={22} />
            </div>
            <div className="friend-requests-modal__actions">
              <Skeleton width={64} height={36} style={{ borderRadius: 8 }} />
              <Skeleton width={64} height={36} style={{ borderRadius: 8 }} />
            </div>
          </li>
        ))}
      </ul>
    );
  }

  if (!apiError) {
    return (
      <EmptyState
        compact
        title="친구 요청이 오면 여기에 표시돼요"
        description="새 요청이 도착하면 이곳에서 수락하거나 거절할 수 있어요."
      />
    );
  }

  return null;
}

export default FriendRequestList;
