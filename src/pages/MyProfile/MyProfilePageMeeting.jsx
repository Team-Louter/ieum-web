import './MyProfilePageMeeting.css';
import MyProfileInfo from '../../components/myProfile/MyProfileInfo/MyProfileInfo';
import Layout from '../../components/common/Layout/Layout';
import MyProfileEditButtons from '../../components/myProfile/MyProfileEditButtons/MyProfileEditButtons';
import PageTabNavigation from '../../components/common/PageTabNavigation/PageTabNavigation';
import MeetingCard from '../../components/meeting/MeetingCard/MeetingCard';
import EmptyState from '../../components/common/EmptyState/EmptyState';

/** 사용자 프로필 화면을 표시합니다. */
function MyProfilePageMeeting({
  profile = {},
  meetings = [],
  onProfileUpdate,
  onNavigate,
  isLoading = false,
  apiError = '',
}) {
  const meetingItems = Array.isArray(meetings) ? meetings : [];
  const isEmpty = meetingItems.length === 0 && !isLoading && !apiError;
  const menuItems = [
    { label: '내 게시물', href: '/myProfile', isActive: false },
    { label: '내 모임', href: '/myProfile/meetings', isActive: true },
    { label: '내 친구', href: '/myProfile/friends', isActive: false },
  ];

  return (
    <Layout className="profile-layout">
      <div id="profile-box" className={isEmpty ? 'profile-box--empty' : undefined}>
        <MyProfileInfo profile={profile} />
        <MyProfileEditButtons profile={profile} onProfileUpdate={onProfileUpdate} />
        <PageTabNavigation ariaLabel="프로필 콘텐츠 메뉴" items={menuItems} />
        <div className={`my-profile-meeting-list${isEmpty ? ' my-profile-meeting-list--empty' : ''}`}>
          {meetingItems.length > 0 ? (
            meetingItems.map((meeting, index) => (
              <MeetingCard
                key={meeting.id ?? index}
                meeting={meeting}
                to={
                  meeting.href ??
                  (meeting.id != null ? `/meeting/my/detail/${meeting.id}` : '/meeting/my/detail')
                }
              />
            ))
          ) : isEmpty ? (
            <EmptyState
              title="참여 중인 모임이 없어요"
              description="모임에 가입하면 내 프로필에 표시돼요."
              actionLabel="모임 목록 보기"
              onAction={() => onNavigate?.('/meeting')}
            />
          ) : null}
        </div>
      </div>
    </Layout>
  );
}

export default MyProfilePageMeeting;
