import { ProfileContentSkeleton } from '../../components/common/PageSkeleton/PageSkeleton';
import './ProfilePageMeeting.css';
import ProfileInfo from '../../components/profile/ProfileInfo/ProfileInfo';
import Layout from '../../components/common/Layout/Layout';
import ProfileActionButtons from '../../components/profile/ProfileActionButtons/ProfileActionButtons';
import PageTabNavigation from '../../components/common/PageTabNavigation/PageTabNavigation';
import MeetingCard from '../../components/meeting/MeetingCard/MeetingCard';
import EmptyState from '../../components/common/EmptyState/EmptyState';

/** 사용자 프로필 화면을 표시합니다. */
function ProfilePageMeeting({
  meetings = [],
  profile = {},
  onMeetingSelect,
  isLoading = false,
  apiError = '',
  onAddFriend,
  onStartChat,
  currentUserId = null,
}) {
  const query = profile.userId != null ? `?userId=${profile.userId}` : '';
  const meetingItems = Array.isArray(meetings) ? meetings : [];
  const isEmpty = meetingItems.length === 0 && !isLoading && !apiError;
  const menuItems = [
    { label: '게시물', href: `/profile${query}`, isActive: false },
    { label: '모임', href: `/profile/meetings${query}`, isActive: true },
    { label: '친구', href: `/profile/friends${query}`, isActive: false },
  ];

  return (
    <Layout className="profile-layout">
      <div id="profile-box" className={isEmpty ? 'profile-box--empty' : undefined}>
        <ProfileInfo profile={profile} />
        <ProfileActionButtons
          userId={profile.userId}
          currentUserId={currentUserId}
          onAddFriend={onAddFriend}
          onStartChat={onStartChat}
        />
        <PageTabNavigation ariaLabel="프로필 콘텐츠 메뉴" items={menuItems} />
        <div className={`public-profile-meeting-list${isEmpty ? ' public-profile-meeting-list--empty' : ''}`}>
          {meetingItems.length > 0 ? (
            meetingItems.map((meeting, index) => (
              <MeetingCard
                key={meeting.id ?? index}
                meeting={meeting}
                to={meeting.href}
                onClick={() => onMeetingSelect?.(meeting)}
              />
            ))
          ) : isEmpty ? (
            <EmptyState
              title="공개된 모임이 여기에 표시돼요"
              description="아직 공개된 모임이 없습니다."
            />
          ) : isLoading ? (
            <ProfileContentSkeleton />
          ) : null}
        </div>
      </div>
    </Layout>
  );
}

export default ProfilePageMeeting;
