import './ProfilePageContent.css';
import ProfileInfo from '../../components/profile/ProfileInfo/ProfileInfo';
import Layout from '../../components/common/Layout/Layout';
import ProfileActionButtons from '../../components/profile/ProfileActionButtons/ProfileActionButtons';
import PageTabNavigation from '../../components/common/PageTabNavigation/PageTabNavigation';
import MyPostCard from '../../components/neighbor/MyPostCard/MyPostCard';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import { dummyMyPosts, dummyOtherProfile } from '../../constants/dummy/dummyProfiles';

/** 사용자 프로필 화면을 표시합니다. */
function ProfilePageContent({
  profile = dummyOtherProfile,
  posts = dummyMyPosts,
  onDeletePost,
  isLoading = false,
  apiError = '',
}) {
  const postItems = Array.isArray(posts) ? posts : [];
  const isEmpty = postItems.length === 0 && !isLoading && !apiError;
  const menuItems = [
    { label: '게시물', href: '/profile', isActive: true },
    { label: '모임', href: '/profile/meetings', isActive: false },
    { label: '친구', href: '/profile/friends', isActive: false },
  ];

  return (
    <Layout className="profile-layout">
      <div id="profile-box" className={isEmpty ? 'profile-box--empty' : undefined}>
        <ProfileInfo profile={profile} />
        <ProfileActionButtons />
        <PageTabNavigation ariaLabel="프로필 콘텐츠 메뉴" items={menuItems} />
        <div id="content-container">
          {postItems.length > 0 ? (
            postItems.map((post, index) => (
              <MyPostCard key={post.id ?? index} post={post} onDelete={onDeletePost} />
            ))
          ) : isEmpty ? (
            <EmptyState title="게시물이 없어요" description="아직 작성된 게시물이 없습니다." />
          ) : null}
        </div>
      </div>
    </Layout>
  );
}

export default ProfilePageContent;
