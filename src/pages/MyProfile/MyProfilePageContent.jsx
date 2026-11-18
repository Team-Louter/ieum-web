import { ProfileContentSkeleton } from '../../components/common/PageSkeleton/PageSkeleton';
import './MyProfilePageContent.css';
import MyProfileInfo from '../../components/myProfile/MyProfileInfo/MyProfileInfo';
import Layout from '../../components/common/Layout/Layout';
import MyProfileEditButtons from '../../components/myProfile/MyProfileEditButtons/MyProfileEditButtons';
import PageTabNavigation from '../../components/common/PageTabNavigation/PageTabNavigation';
import MyPostCard from '../../components/neighbor/MyPostCard/MyPostCard';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import LoadMoreTrigger from '../../components/common/LoadMoreTrigger/LoadMoreTrigger';
import useMorePosts from '../../hooks/useMorePosts';

/** 사용자 프로필 화면을 표시합니다. */
function MyProfilePageContent({
  profile = {},
  posts = [],
  postsHasNext = false,
  onDeletePost,
  onUpdatePost,
  onProfileUpdate,
  onNavigate,
  isLoading = false,
  apiError = '',
}) {
  const more = useMorePosts({ posts, hasNext: postsHasNext, query: { mine: true } });
  const postItems = Array.isArray(more.posts) ? more.posts : [];
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
              <MyPostCard
                key={post.id ?? index}
                post={post}
                onDelete={onDeletePost}
                onUpdate={onUpdatePost}
              />
            ))
          ) : isEmpty ? (
            <EmptyState
              title="첫 게시물을 작성해보세요"
              description="새 게시물을 작성하면 내 프로필에 표시돼요."
              actionLabel="게시물 만들기"
              onAction={() => onNavigate?.('/neighbor/create')}
            />
          ) : isLoading ? (
            <ProfileContentSkeleton />
          ) : null}
          <LoadMoreTrigger hasNext={more.hasNext} isLoading={more.isLoadingMore} onLoad={more.loadMore} />
        </div>
      </div>
    </Layout>
  );
}

export default MyProfilePageContent;
