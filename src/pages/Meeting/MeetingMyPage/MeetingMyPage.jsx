import { useRef, useState } from 'react';
import Layout from '../../../components/common/Layout/Layout';
import MeetingMyAnnouncement from '../../../components/meeting/MeetingMy/MeetingMyAnnouncement';
import mulchongsae from '../../../assets/images/meeting-cover.jpg';
import dotSetting from '../../../assets/dot_setting.svg';
import './MeetingMyPage.css';
import MeetingKebabMenu from '../../../components/meeting/MeetingKebabMenu/MeetingKebabMenu';
import MeetingMyMemberList from '../../../components/meeting/MeetingMy/MeetingMyMemberList';
import PageTabNavigation from '../../../components/common/PageTabNavigation/PageTabNavigation';

const ACTIVE_MEMBERSHIP_STATUSES = ['ACTIVE', 'APPROVED', 'JOINED', 'MEMBER'];
const PENDING_MEMBERSHIP_STATUSES = [
  'PENDING',
  'PENDING_APPROVAL',
  'WAITING',
  'WAITING_APPROVAL',
  'REQUESTED',
];
const NOT_JOINED_MEMBERSHIP_STATUSES = [
  'NONE',
  'NOT_JOINED',
  'NOT_MEMBER',
  'REJECTED',
  'DECLINED',
  'LEFT',
  'WITHDRAWN',
  'INACTIVE',
];

function getRoleLabel(role) {
  const normalizedRole = String(role ?? '').trim().toUpperCase().replace(/^ROLE_/, '');
  const roleLabels = {
    OWNER: '모임장',
    LEADER: '모임장',
    HOST: '모임장',
    CREATOR: '모임장',
    개설자: '모임장',
    모임장: '모임장',
    MANAGER: '관리자',
    ADMIN: '관리자',
    관리자: '관리자',
    MEMBER: '회원',
    PARTICIPANT: '회원',
    회원: '회원',
  };

  return roleLabels[normalizedRole] ?? String(role ?? '').trim();
}

export default function MeetingMyPage({
  meeting = {},
  meetingId,
  announcement = {},
  members = [],
  membership,
  notices = [],
  currentLoginId,
  currentUserId,
  onJoin,
  onLeave,
  onDelete,
  onMemberAction,
  onAnnouncementCreate,
  onAnnouncementUpdate,
  onAnnouncementDelete,
  onAnnouncementLoad,
  isLoading = false,
  apiError = '',
}) {
  const [isJoining, setIsJoining] = useState(false);
  const joinStarted = useRef(false);
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/meeting';
  const isMyMeetingDetail = currentPath.startsWith('/meeting/my/detail');
  const menuItems = [
    {
      label: '모임 보기',
      href: '/meeting',
      isActive: currentPath === '/meeting' || currentPath.startsWith('/meeting/detail'),
    },
    { label: '내 모임', href: '/meeting/my', isActive: currentPath.startsWith('/meeting/my') },
    { label: '모임 만들기', href: '/meeting/make', isActive: currentPath === '/meeting/make' },
  ];
  const currentMember = members.find(
    (member) =>
      (currentUserId != null &&
        String(member.userId ?? member.id) === String(currentUserId)) ||
      (currentLoginId && member.loginId === currentLoginId),
  );
  const membershipStatus = String(
    membership?.status ??
      membership?.membershipStatus ??
      membership?.data?.status ??
      membership?.data?.membershipStatus ??
      meeting.membershipStatus ??
      currentMember?.status ??
      '',
  ).toUpperCase();
  const roleLabel = getRoleLabel(
    membership?.role ??
      membership?.memberRole ??
      membership?.data?.role ??
      currentMember?.role ??
      meeting.role,
  );
  const isOwner =
    roleLabel === '모임장' ||
    (currentUserId != null && String(meeting.ownerId) === String(currentUserId)) ||
    Boolean(currentLoginId && meeting.owner === currentLoginId);
  const isPending = PENDING_MEMBERSHIP_STATUSES.includes(membershipStatus);
  const hasExplicitNotJoinedStatus = NOT_JOINED_MEMBERSHIP_STATUSES.includes(membershipStatus);
  const isActiveMember =
    ACTIVE_MEMBERSHIP_STATUSES.includes(membershipStatus) ||
    ACTIVE_MEMBERSHIP_STATUSES.includes(String(currentMember?.status ?? '').toUpperCase()) ||
    (!membershipStatus && roleLabel === '회원');
  const canManage = Boolean(
    membership?.canManage ||
      membership?.data?.canManage ||
      meeting.canManage ||
      isOwner ||
      roleLabel === '관리자',
  );
  const canLeave = !isOwner && !isPending && (membership?.canLeave ??
      membership?.data?.canLeave ??
      meeting.canLeave ??
      (isActiveMember && !hasExplicitNotJoinedStatus));
  const myRoleLabel =
    roleLabel ||
    (isOwner
      ? '모임장'
      : canManage
        ? '관리자'
        : isPending
          ? '가입 승인 대기'
          : canLeave
            ? '회원'
            : '');
  const serverCanJoin = membership?.canJoin ?? membership?.data?.canJoin ?? meeting.canJoin;
  const canJoin =
    !isLoading &&
    !apiError &&
    !isMyMeetingDetail &&
    (serverCanJoin != null
      ? Boolean(serverCanJoin)
      : !isOwner && !isActiveMember && !canManage && !canLeave && !isPending);

  async function joinMeeting() {
    const id = meeting.id ?? meetingId;
    if (joinStarted.current || id == null) return;

    joinStarted.current = true;
    setIsJoining(true);
    try {
      await onJoin?.(id);
    } finally {
      joinStarted.current = false;
      setIsJoining(false);
    }
  }

  return (
    <Layout>
      <PageTabNavigation ariaLabel="모임 메뉴" isFixed items={menuItems} />
      <div className="contents-layout">
        <div className="meeting-my-card">
          <div className="meeting-my-contents">
            <img
              className="meeting-card-img"
              src={meeting.image || mulchongsae}
              alt={`${meeting.title ?? '모임'} 대표 이미지`}
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = mulchongsae;
              }}
            />
            <div className="meeting-card-info">
              <p className="meeting-card-info-title">{meeting.title ?? ''}</p>
              <p className="meeting-card-info-desc">{meeting.description ?? ''}</p>
              <p className="meeting-card-info-meta">
                {[meeting.region, meeting.memberCount == null ? '' : `${meeting.memberCount}명`]
                  .filter(Boolean)
                  .join(' • ')}
              </p>
              {myRoleLabel && (
                <p className="meeting-my-role">내 등급 · {myRoleLabel}</p>
              )}
            </div>
          </div>
          <div className="meeting-my-card__actions">
            {canJoin && (
              <button
                className="meeting-my-card__join"
                type="button"
                onClick={joinMeeting}
                disabled={isJoining}
              >
                {isJoining
                  ? '처리 중입니다'
                  : meeting.approvalRequired
                    ? '가입 신청하기'
                    : '모임 가입하기'}
              </button>
            )}
            {isPending && (
              <span className="meeting-my-card__pending" role="status">
                가입 승인 대기 중
              </span>
            )}
            <MeetingKebabMenu
              image={dotSetting}
              meeting={meeting}
              canManage={Boolean(canManage)}
              canLeave={Boolean(canLeave)}
              onLeave={onLeave}
              onDelete={onDelete}
            />
          </div>
        </div>
        <div className="contents-horizen"></div>
        <MeetingMyAnnouncement
          announcement={announcement}
          notices={notices}
          meetingId={meeting.id}
          canManage={Boolean(canManage)}
          onCreate={onAnnouncementCreate}
          onUpdate={onAnnouncementUpdate}
          onDelete={onAnnouncementDelete}
          onLoad={onAnnouncementLoad}
          isLoading={isLoading}
          apiError={apiError}
        />
        <div className="contents-horizen"></div>
        <MeetingMyMemberList
          members={members}
          maxVisible={6}
          meetingId={meeting.id}
          canManage={Boolean(canManage)}
          currentUserId={currentUserId}
          onMemberAction={onMemberAction}
          isLoading={isLoading}
          apiError={apiError}
        />
      </div>
    </Layout>
  );
}
