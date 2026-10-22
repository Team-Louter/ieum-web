import './NeighborFeedPage.css';
import { useState } from 'react';
import Layout from '../../components/common/Layout/Layout';
import PageTabNavigation from '../../components/common/PageTabNavigation/PageTabNavigation';
import PostCard from '../../components/neighbor/PostCard/PostCard';
import { dummyNeighborFeedPosts } from '../../constants/dummy/dummyPosts';

/** 이웃마당 게시물 목록과 댓글 모달 상태를 관리합니다. */
function NeighborFeedPage({
  posts = dummyNeighborFeedPosts,
  onLike,
  onSubmitComment,
}) {
  const [activeCommentId, setActiveCommentId] = useState(null);
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/neighbor';
  const menuItems = [
    { label: '게시물 보기', href: '/neighbor', isActive: currentPath === '/neighbor' },
    { label: '내 게시물', href: '/neighbor/my', isActive: currentPath === '/neighbor/my' },
    { label: '게시물 만들기', href: '/neighbor/create', isActive: currentPath === '/neighbor/create' },
  ];

  /** 선택한 게시물의 댓글 창만 열거나 닫습니다. */
  function handleCommentToggle(postId) {
    setActiveCommentId((currentId) => (currentId === postId ? null : postId));
  }

  return (
    <Layout>
      <PageTabNavigation ariaLabel="이웃마당 메뉴" isFixed items={menuItems} />
      <div className="neighbor-feed">
        {posts.map((post, index) => {
          const postId = post.id ?? index;

          return (
          <PostCard
            key={postId}
            post={post}
            isCommentOpen={activeCommentId === postId}
            onCommentToggle={() => handleCommentToggle(postId)}
            onLikeToggle={(nextIsLiked) => onLike?.(post, nextIsLiked)}
            onSubmitComment={(comment) => onSubmitComment?.(post, comment)}
          />
          );
        })}
      </div>
    </Layout>
  );
}

export default NeighborFeedPage;
