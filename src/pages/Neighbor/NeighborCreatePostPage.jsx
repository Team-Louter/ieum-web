import './NeighborCreatePostPage.css';
import Layout from '../../components/common/Layout/Layout';
import NeighborNavigation from '../../components/neighbor/NeighborNavigation/NeighborNavigation';
import PostCreateForm from '../../components/neighbor/PostCreateForm/PostCreateForm';

/** 새 이웃마당 게시물을 작성하는 화면입니다. */
function NeighborCreatePostPage() {
  return (
    <Layout>
      <NeighborNavigation />
      <PostCreateForm />
    </Layout>
  );
}

export default NeighborCreatePostPage;
