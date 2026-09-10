import './NeighborFeedPage.css';
import { useState } from 'react';
import Layout from '../../components/common/Layout/Layout';
import PageTabNavigation from '../../components/common/PageTabNavigation/PageTabNavigation';
import PostCard from '../../components/neighbor/PostCard/PostCard';

/** 이웃마당 게시물 목록과 댓글 모달 상태를 관리합니다. */
function NeighborFeedPage() {
  const [activeCommentId, setActiveCommentId] = useState(null);
  const postIds = [1, 2, 3, 4];
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
        {postIds.map((postId) => (
          <PostCard
            key={postId}
            isCommentOpen={activeCommentId === postId}
            onCommentToggle={() => handleCommentToggle(postId)}
          />
        ))}
      </div>
    </Layout>
  );
}

export default NeighborFeedPage;
