import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MeetingKebabMenu.css';
import CardMoreMenu from '../../common/CardMoreMenu/CardMoreMenu';
import MeetingInviteModal from './MeetingInviteModal';
import MeetingJoinRequestsModal from '../MeetingJoinRequests/MeetingJoinRequestsModal';
import ActionModal from '../../common/ActionModal/ActionModal';
import ConfirmationModal from '../../common/ConfirmationModal/ConfirmationModal';

export default function MeetingKebabMenu({
  meeting,
  canManage = false,
  canDelete = false,
  canLeave = false,
  onLeave,
  onDelete,
  onInviteCreate,
  pendingRequests = [],
  showJoinRequests = false,
  onMemberAction,
}) {
  const [isLeaveConfirmOpen, setIsLeaveConfirmOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [invite, setInvite] = useState(null);
  const [inviteError, setInviteError] = useState('');
  const [isRequestsOpen, setIsRequestsOpen] = useState(false);
  const navigate = useNavigate();

  if (!canManage && !canLeave) return null;

  /** 초대 링크를 만들고 결과를 모달로 보여 줍니다. 관리자부터 쓸 수 있습니다. */
  async function createInvite() {
    try {
      const created = await onInviteCreate?.(meeting?.id);
      setInvite(created ?? null);
      if (!created) setInviteError('초대 링크를 만들지 못했습니다.');
    } catch (error) {
      setInviteError(error?.message ?? '초대 링크를 만들지 못했습니다.');
    }
  }

  function manageMeeting() {
    const meetingId = meeting?.id;
    const hasNumericId = meetingId != null && /^\d+$/.test(String(meetingId));
    navigate(hasNumericId ? `/meeting/management/${meetingId}` : '/meeting/management', {
      state: { meeting },
    });
  }

  return (
    <div className="meeting-card-dot-container">
      <CardMoreMenu
        inline
        label="모임 메뉴"
        items={[
          canManage && onInviteCreate && { label: '초대 링크 만들기', onClick: createInvite },
          canManage && showJoinRequests && {
            label: `가입 요청${pendingRequests.length > 0 ? ` (${pendingRequests.length})` : ''}`,
            onClick: () => setIsRequestsOpen(true),
          },
          canManage && { label: '모임 관리하기', onClick: manageMeeting },
          canLeave && { label: '모임 탈퇴하기', onClick: () => setIsLeaveConfirmOpen(true) },
          canDelete && { label: '모임 삭제하기', onClick: () => setIsDeleteConfirmOpen(true), danger: true },
        ].filter(Boolean)}
      />
      {isRequestsOpen && (
        <MeetingJoinRequestsModal
          requests={pendingRequests}
          onApprove={(request) => onMemberAction?.(request, '가입 승인')}
          onReject={(request) => onMemberAction?.(request, '가입 거부')}
          onClose={() => setIsRequestsOpen(false)}
        />
      )}
      {invite && <MeetingInviteModal invite={invite} meetingName={meeting?.title ?? meeting?.name ?? ''} onClose={() => setInvite(null)} />}
      {inviteError && (
        <ActionModal
          title="초대 링크"
          text={inviteError}
          primaryLabel="확인"
          secondaryLabel="닫기"
          onPrimary={() => setInviteError('')}
          onClose={() => setInviteError('')}
        />
      )}
      {isLeaveConfirmOpen && (
        <ConfirmationModal
          title="모임 탈퇴"
          message="정말로 모임에서 탈퇴하시겠습니까?"
          confirmLabel="모임 탈퇴"
          cancelLabel="취소"
          onCancel={() => setIsLeaveConfirmOpen(false)}
          onConfirm={() => {
            setIsLeaveConfirmOpen(false);
            onLeave?.(meeting.id);
          }}
        />
      )}
      {isDeleteConfirmOpen && (
        <ConfirmationModal
          title="모임 삭제"
          message="정말로 모임을 삭제하시겠습니까? 삭제한 모임은 되돌릴 수 없습니다."
          confirmLabel="모임 삭제"
          cancelLabel="취소"
          onCancel={() => setIsDeleteConfirmOpen(false)}
          onConfirm={() => {
            setIsDeleteConfirmOpen(false);
            onDelete?.(meeting.id);
          }}
        />
      )}
    </div>
  );
}
