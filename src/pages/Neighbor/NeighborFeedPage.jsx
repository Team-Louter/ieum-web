import './NeighborFeedPage.css';
import { useState } from 'react';
import Layout from '../../components/common/Layout/Layout';
import PageTabNavigation from '../../components/common/PageTabNavigation/PageTabNavigation';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import PostCard from '../../components/neighbor/PostCard/PostCard';
import LoadMoreTrigger from '../../components/common/LoadMoreTrigger/LoadMoreTrigger';
import useMorePosts from '../../hooks/useMorePosts';

/** 이웃마당 게시물 목록과 댓글 모달 상태를 관리합니다. */
function NeighborFeedPage({
  posts = [],
  postsHasNext = false,
  onLike,
  onSubmitComment,
  onUpdateComment,
  onDeleteComment,
  currentLoginId,
  onNavigate,
  isLoading = false,
  apiError = '',
}) {
  const [activeCommentId, setActiveCommentId] = useState(null);
  const more = useMorePosts({ posts, hasNext: postsHasNext });
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

  /** 선택한 게시물의 댓글 창만 열거나 닫습니다. */
  function handleCommentToggle(postId) {
    setActiveCommentId((currentId) => (currentId === postId ? null : postId));
  }

  return (
    <Layout>
      <PageTabNavigation ariaLabel="이웃마당 메뉴" isFixed items={menuItems} />
      <div className={`neighbor-feed${isEmpty ? ' empty-state-page--centered' : ''}`}>
        {postItems.length > 0 ? (
          postItems.map((post, index) => {
            const postId = post.id ?? index;

            return (
              <PostCard
                key={postId}
                post={post}
                isCommentOpen={activeCommentId === postId}
                onCommentToggle={() => handleCommentToggle(postId)}
                onLikeToggle={(nextIsLiked) => onLike?.(post, nextIsLiked)}
                onSubmitComment={(comment) => onSubmitComment?.(post, comment)}
                currentLoginId={currentLoginId}
                onUpdateComment={(comment, content) => onUpdateComment?.(post, comment, content)}
                onDeleteComment={(comment) => onDeleteComment?.(post, comment)}
                isLoading={isLoading}
                apiError={apiError}
              />
            );
          })
        ) : isEmpty ? (
          <EmptyState
            title="첫 게시물을 작성해보세요"
            description="이웃들과 소식을 나눠 보세요."
            actionLabel="게시물 만들기"
            onAction={() => onNavigate?.('/neighbor/create')}
          />
        ) : null}
        <LoadMoreTrigger hasNext={more.hasNext} isLoading={more.isLoadingMore} onLoad={more.loadMore} />
      </div>
    </Layout>
  );
}

export default NeighborFeedPage;
