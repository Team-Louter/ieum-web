import './ProfilePageMeeting.css';
import ProfileInfo from '../../components/profile/ProfileInfo/ProfileInfo';
import Layout from '../../components/common/Layout/Layout';
import ProfileActionButtons from '../../components/profile/ProfileActionButtons/ProfileActionButtons';
import PageTabNavigation from '../../components/common/PageTabNavigation/PageTabNavigation';
import MeetingCard from '../../components/meeting/MeetingCard/MeetingCard';
import { dummyMeetings } from '../../constants/dummy/dummyMeetings';
import { dummyOtherProfile } from '../../constants/dummy/dummyProfiles';

/** 사용자 프로필 화면을 표시합니다. */
function ProfilePageMeeting({
  meetings = dummyMeetings,
  profile = dummyOtherProfile,
  onMeetingSelect,
}) {
  const menuItems = [
    { label: '게시물', href: '/profile', isActive: false },
    { label: '모임', href: '/profile/meetings', isActive: true },
    { label: '친구', href: '/profile/friends', isActive: false },
  ];

  return (
    <Layout className="profile-layout">
      <div id="profile-box">
        <ProfileInfo profile={profile} />
        <ProfileActionButtons />
        <PageTabNavigation ariaLabel="프로필 콘텐츠 메뉴" items={menuItems} />
        <div className="public-profile-meeting-list">
          {meetings.map((meeting, index) => (
            <MeetingCard
              key={meeting.id ?? index}
              meeting={meeting}
              to={meeting.href}
              onClick={() => onMeetingSelect?.(meeting)}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
}

export default ProfilePageMeeting;
