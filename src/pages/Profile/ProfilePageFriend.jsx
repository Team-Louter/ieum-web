import { ProfileContentSkeleton } from '../../components/common/PageSkeleton/PageSkeleton';
import './ProfilePageFriend.css';
import ProfileInfo from '../../components/profile/ProfileInfo/ProfileInfo';
import Layout from '../../components/common/Layout/Layout';
import ProfileActionButtons from '../../components/profile/ProfileActionButtons/ProfileActionButtons';
import PageTabNavigation from '../../components/common/PageTabNavigation/PageTabNavigation';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import MeetingMyMemberProfile from '../../components/meeting/MeetingMy/MeetingMyMemberProfile';
import profileImage from '../../assets/images/profile.png';

/** 사용자 프로필 화면을 표시합니다. */
function ProfilePageFriend({
  profile = {},
  friends = [],
  isLoading = false,
  apiError = '',
  onAddFriend,
  onStartChat,
  currentUserId = null,
}) {
  const query = profile.userId != null ? `?userId=${profile.userId}` : '';
  const friendItems = Array.isArray(friends) ? friends : [];
  const isEmpty = friendItems.length === 0 && !isLoading && !apiError;
  const menuItems = [
    { label: '게시물', href: `/profile${query}`, isActive: false },
    { label: '모임', href: `/profile/meetings${query}`, isActive: false },
    { label: '친구', href: `/profile/friends${query}`, isActive: true },
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
        {isLoading && friendItems.length === 0 ? (
          <ProfileContentSkeleton />
        ) : (
          <ul
            className={`public-profile-friend-list${isEmpty ? ' public-profile-friend-list--empty' : ''}`}
          >
            {friendItems.length > 0 ? (
              friendItems.map((friend, index) => (
                <li key={friend.id ?? index}>
                  <MeetingMyMemberProfile
                    profile_image={friend.profileImage ?? friend.profile_image ?? profileImage}
                    id={friend.nickname ?? friend.name ?? ''}
                    role="회원"
                    interactive={false}
                  />
                </li>
              ))
            ) : isEmpty ? (
              <li className="public-profile-friend-list__empty">
                <EmptyState
                  title="공개된 친구가 여기에 표시돼요"
                  description="아직 공개된 친구가 없습니다."
                />
              </li>
            ) : null}
          </ul>
        )}
      </div>
    </Layout>
  );
}

export default ProfilePageFriend;
