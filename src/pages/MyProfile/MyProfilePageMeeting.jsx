import './MyProfilePageMeeting.css';
import MyProfileInfo from '../../components/myProfile/MyProfileInfo/MyProfileInfo';
import Layout from '../../components/common/Layout/Layout';
import MyProfileEditButtons from '../../components/myProfile/MyProfileEditButtons/MyProfileEditButtons';
import PageTabNavigation from '../../components/common/PageTabNavigation/PageTabNavigation';
import MeetingCard from '../../components/meeting/MeetingCard/MeetingCard';
import { dummyMyMeetings } from '../../constants/dummy/dummyMeetings';
import { dummyMyProfile } from '../../constants/dummy/dummyProfiles';

/** 사용자 프로필 화면을 표시합니다. */
function MyProfilePageMeeting({
  profile = dummyMyProfile,
  meetings = dummyMyMeetings,
  onProfileUpdate,
}) {
  const menuItems = [
    { label: '내 게시물', href: '/myProfile', isActive: false },
    { label: '내 모임', href: '/myProfile/meetings', isActive: true },
    { label: '내 친구', href: '/myProfile/friends', isActive: false },
  ];

  return (
    <Layout className="profile-layout">
      <div id="profile-box">
        <MyProfileInfo profile={profile} />
        <MyProfileEditButtons profile={profile} onProfileUpdate={onProfileUpdate} />
        <PageTabNavigation ariaLabel="프로필 콘텐츠 메뉴" items={menuItems} />
        <div className="my-profile-meeting-list">
          {meetings.map((meeting, index) => (
            <MeetingCard
              key={meeting.id ?? index}
              meeting={meeting}
              to={meeting.href ?? '/meeting/my/detail'}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
}

export default MyProfilePageMeeting;
