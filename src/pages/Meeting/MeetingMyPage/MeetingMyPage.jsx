import Layout from '../../../components/common/Layout/Layout';
import MeetingMyAnnouncement from '../../../components/meeting/MeetingMy/MeetingMyAnnouncement';
import mulchongsae from '../../../assets/images/meeting-cover.jpg';
import dotSetting from '../../../assets/dot_setting.svg';
import './MeetingMyPage.css';
import MeetingKebabMenu from '../../../components/meeting/MeetingKebabMenu/MeetingKebabMenu';
import MeetingMyMemberList from '../../../components/meeting/MeetingMy/MeetingMyMemberList';
import PageTabNavigation from '../../../components/common/PageTabNavigation/PageTabNavigation';
import {
  dummyMeetingAnnouncement,
  dummyMeetingMembers,
  dummyMyMeetings,
} from '../../../constants/dummy/dummyMeetings';

export default function MeetingMyPage({
  meeting = dummyMyMeetings[0],
  announcement = dummyMeetingAnnouncement,
  members = dummyMeetingMembers,
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
  isLoading = false,
  apiError = '',
}) {
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/meeting';
  const menuItems = [
    { label: '모임 보기', href: '/meeting', isActive: currentPath === '/meeting' },
    { label: '내 모임', href: '/meeting/my', isActive: currentPath.startsWith('/meeting/my') },
    { label: '모임 만들기', href: '/meeting/make', isActive: currentPath === '/meeting/make' },
  ];
  const membershipStatus = String(
    meeting.membershipStatus ?? membership?.status ?? '',
  ).toUpperCase();
  const canManage =
    membership?.canManage ??
    meeting.canManage ??
    Boolean(
      (currentUserId != null && String(meeting.ownerId) === String(currentUserId)) ||
        (currentLoginId && meeting.owner && meeting.owner === currentLoginId),
    );
  const canLeave =
    membership?.canLeave ??
    meeting.canLeave ??
    ['ACTIVE', 'APPROVED', 'JOINED', 'MEMBER'].includes(membershipStatus);
  const isPending = ['PENDING', 'WAITING', 'REQUESTED'].includes(membershipStatus);
  const canJoin = !canManage && !canLeave && !isPending;

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
            </div>
          </div>
          <div className="meeting-my-card__actions">
            {canJoin && (
              <button
                className="meeting-my-card__join"
                type="button"
                onClick={() => onJoin?.(meeting.id)}
              >
                {meeting.approvalRequired ? '가입 신청하기' : '모임 가입하기'}
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
