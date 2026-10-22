import './ProfilePageFriend.css';
import ProfileInfo from '../../components/profile/ProfileInfo/ProfileInfo';
import Layout from '../../components/common/Layout/Layout';
import ProfileActionButtons from '../../components/profile/ProfileActionButtons/ProfileActionButtons';
import PageTabNavigation from '../../components/common/PageTabNavigation/PageTabNavigation';
import MeetingMyMemberProfile from '../../components/meeting/MeetingMy/MeetingMyMemberProfile';
import profileImage from '../../assets/images/profile.png';
import { dummyFriendLocations } from '../../constants/dummy/dummyFriendLocations';
import { dummyOtherProfile } from '../../constants/dummy/dummyProfiles';

/** 사용자 프로필 화면을 표시합니다. */
function ProfilePageFriend({ profile = dummyOtherProfile, friends = dummyFriendLocations }) {
  const menuItems = [
    { label: '게시물', href: '/profile', isActive: false },
    { label: '모임', href: '/profile/meetings', isActive: false },
    { label: '친구', href: '/profile/friends', isActive: true },
  ];

  return (
    <Layout className="profile-layout">
      <div id="profile-box">
        <ProfileInfo profile={profile} />
        <ProfileActionButtons />
        <PageTabNavigation ariaLabel="프로필 콘텐츠 메뉴" items={menuItems} />
        <ul className="public-profile-friend-list">
          {friends.map((friend, index) => (
            <li key={friend.id ?? index}>
              <MeetingMyMemberProfile
                profile_image={friend.profileImage ?? friend.profile_image ?? profileImage}
                id={friend.nickname ?? friend.name ?? friend.id ?? ''}
                role="회원"
                interactive={false}
              />
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  );
}

export default ProfilePageFriend;
