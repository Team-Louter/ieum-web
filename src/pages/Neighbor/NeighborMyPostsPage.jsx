import './NeighborMyPostsPage.css';
import Layout from '../../components/common/Layout/Layout';
import NeighborNavigation from '../../components/neighbor/NeighborNavigation/NeighborNavigation';
import MyPostCard from '../../components/neighbor/MyPostCard/MyPostCard';

/** 사용자가 작성한 게시물 목록을 표시합니다. */
function NeighborMyPostsPage() {
  return (
    <Layout>
      <NeighborNavigation />
      <div className="my-content-grid">
        <MyPostCard />
        <MyPostCard />
        <MyPostCard />
        <MyPostCard />
        <MyPostCard />
        <MyPostCard />
      </div>
    </Layout>
  );
}

export default NeighborMyPostsPage;
