import './NeighborMyPostsPage.css';
import Layout from '../../components/common/Layout/Layout';
import PageTabNavigation from '../../components/common/PageTabNavigation/PageTabNavigation';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import MyPostCard from '../../components/neighbor/MyPostCard/MyPostCard';
import LoadMoreTrigger from '../../components/common/LoadMoreTrigger/LoadMoreTrigger';
import useMorePosts from '../../hooks/useMorePosts';

/** 사용자가 작성한 게시물 목록을 표시합니다. */
function NeighborMyPostsPage({
  posts = [],
  postsHasNext = false,
  onDeletePost,
  onUpdatePost,
  onNavigate,
  isLoading = false,
  apiError = '',
}) {
  const more = useMorePosts({ posts, hasNext: postsHasNext, query: { mine: true } });
  const postItems = Array.isArray(more.posts) ? more.posts : [];
  const isEmpty = postItems.length === 0 && !isLoading && !apiError;
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/neighbor';
  const menuItems = [
    { label: '게시물 보기', href: '/neighbor', isActive: currentPath === '/neighbor' },
    { label: '내 게시물', href: '/neighbor/my', isActive: currentPath === '/neighbor/my' },
    {
      label: '게시물 만들기',
      href: '/neighbor/create',
      isActive: currentPath === '/neighbor/create',
    },
  ];

  return (
    <Layout>
      <PageTabNavigation ariaLabel="이웃마당 메뉴" isFixed items={menuItems} />
      <div className={`my-content-grid${isEmpty ? ' empty-state-page--centered' : ''}`}>
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
            description="새 게시물을 작성하면 이곳에서 확인할 수 있어요."
            actionLabel="게시물 만들기"
            onAction={() => onNavigate?.('/neighbor/create')}
          />
        ) : null}
        <LoadMoreTrigger hasNext={more.hasNext} isLoading={more.isLoadingMore} onLoad={more.loadMore} />
      </div>
    </Layout>
  );
}

export default NeighborMyPostsPage;
