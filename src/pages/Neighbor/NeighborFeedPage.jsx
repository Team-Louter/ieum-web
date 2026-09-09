import './NeighborFeedPage.css';
import { useState } from 'react';
import Layout from '../../components/common/Layout/Layout';
import NeighborNavigation from '../../components/neighbor/NeighborNavigation/NeighborNavigation';
import PostCard from '../../components/neighbor/PostCard/PostCard';

/** 이웃마당 게시물 목록과 댓글 모달 상태를 관리합니다. */
function NeighborFeedPage() {
  const [activeCommentId, setActiveCommentId] = useState(null);
  const postIds = [1, 2, 3, 4];

  /** 선택한 게시물의 댓글 창만 열거나 닫습니다. */
  function handleCommentToggle(postId) {
    setActiveCommentId((currentId) => (currentId === postId ? null : postId));
  }

  return (
    <Layout>
      <NeighborNavigation />
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
