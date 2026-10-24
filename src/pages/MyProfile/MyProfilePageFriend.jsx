import './MyProfilePageFriend.css';
import MyProfileInfo from '../../components/myProfile/MyProfileInfo/MyProfileInfo';
import Layout from '../../components/common/Layout/Layout';
import MyProfileEditButtons from '../../components/myProfile/MyProfileEditButtons/MyProfileEditButtons';
import PageTabNavigation from '../../components/common/PageTabNavigation/PageTabNavigation';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import profileImage from '../../assets/images/profile.png';
import { dummyFriendLocations } from '../../constants/dummy/dummyFriendLocations';
import MeetingMyMemberProfile from '../../components/meeting/MeetingMy/MeetingMyMemberProfile';
import { dummyMyProfile } from '../../constants/dummy/dummyProfiles';

/** 사용자 프로필 화면을 표시합니다. */
function MyProfilePageFriend({
  profile = dummyMyProfile,
  friends = dummyFriendLocations,
  onProfileUpdate,
  onNavigate,
  isLoading = false,
  apiError = '',
}) {
  const friendItems = Array.isArray(friends) ? friends : [];
  const isEmpty = friendItems.length === 0 && !isLoading && !apiError;
  const menuItems = [
    { label: '내 게시물', href: '/myProfile', isActive: false },
    { label: '내 모임', href: '/myProfile/meetings', isActive: false },
    { label: '내 친구', href: '/myProfile/friends', isActive: true },
  ];

  return (
    <Layout className="profile-layout">
      <div id="profile-box" className={isEmpty ? 'profile-box--empty' : undefined}>
        <MyProfileInfo profile={profile} />
        <MyProfileEditButtons profile={profile} onProfileUpdate={onProfileUpdate} />
        <PageTabNavigation ariaLabel="프로필 콘텐츠 메뉴" items={menuItems} />
        <ul className={`my-profile-friend-list${isEmpty ? ' my-profile-friend-list--empty' : ''}`}>
          {friendItems.length > 0 ? friendItems.map((friend, index) => (
            <li key={friend.id ?? index}>
              <MeetingMyMemberProfile
                profile_image={friend.profileImage ?? friend.profile_image ?? profileImage}
                id={friend.nickname ?? friend.name ?? friend.id ?? ''}
                role="회원"
                interactive={false}
              />
            </li>
          )) : isEmpty ? (
            <li className="my-profile-friend-list__empty">
              <EmptyState
                title="아직 친구가 없어요"
                description="친구를 추가하면 이곳에서 확인할 수 있어요."
                actionLabel="친구 찾아보기"
                onAction={() => onNavigate?.('/addfriend')}
              />
            </li>
          ) : null}
        </ul>
      </div>
    </Layout>
  );
}

export default MyProfilePageFriend;
