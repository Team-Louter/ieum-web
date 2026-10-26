import PostPagination from '../../components/neighbor/PostPagination';
import './MyProfilePageContent.css';
import MyProfileInfo from '../../components/myProfile/MyProfileInfo/MyProfileInfo';
import Layout from '../../components/common/Layout/Layout';
import MyProfileEditButtons from '../../components/myProfile/MyProfileEditButtons/MyProfileEditButtons';
import PageTabNavigation from '../../components/common/PageTabNavigation/PageTabNavigation';
import MyPostCard from '../../components/neighbor/MyPostCard/MyPostCard';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import { dummyMyPosts, dummyMyProfile } from '../../constants/dummy/dummyProfiles';

/** 사용자 프로필 화면을 표시합니다. */
function MyProfilePageContent({
  profile = dummyMyProfile,
  posts = dummyMyPosts,
  onDeletePost,
  onProfileUpdate,
  onNavigate,
  isLoading = false,
  apiError = '',
  communityPage = 0,
  hasNext = false,
  onCommunityPageChange,
}) {
  const postItems = Array.isArray(posts) ? posts : [];
  const isEmpty = postItems.length === 0 && !isLoading && !apiError;
  const menuItems = [
    { label: '내 게시물', href: '/myProfile', isActive: true },
    { label: '내 모임', href: '/myProfile/meetings', isActive: false },
    { label: '내 친구', href: '/myProfile/friends', isActive: false },
  ];

  return (
    <Layout className="profile-layout">
      <div id="profile-box" className={isEmpty ? 'profile-box--empty' : undefined}>
        <MyProfileInfo profile={profile} />
        <MyProfileEditButtons profile={profile} onProfileUpdate={onProfileUpdate} />
        <PageTabNavigation ariaLabel="프로필 콘텐츠 메뉴" items={menuItems} />
        <div id="content-container">
          {postItems.length > 0 ? (
            postItems.map((post, index) => (
              <MyPostCard key={post.id ?? index} post={post} onDelete={onDeletePost} />
            ))
          ) : isEmpty ? (
            <EmptyState
              title="작성한 게시물이 없어요"
              description="새 게시물을 작성하면 내 프로필에 표시돼요."
              actionLabel="게시물 만들기"
              onAction={() => onNavigate?.('/neighbor/create')}
            />
          ) : null}
        </div>
      </div>
      <PostPagination
        communityPage={communityPage}
        hasNext={hasNext}
        onCommunityPageChange={onCommunityPageChange}
        isLoading={isLoading}
      />
    </Layout>
  );
}

export default MyProfilePageContent;
