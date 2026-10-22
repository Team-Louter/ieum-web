import './NeighborMyPostsPage.css';
import Layout from '../../components/common/Layout/Layout';
import PageTabNavigation from '../../components/common/PageTabNavigation/PageTabNavigation';
import MyPostCard from '../../components/neighbor/MyPostCard/MyPostCard';
import { dummyNeighborPosts } from '../../constants/dummy/dummyProfiles';

/** 사용자가 작성한 게시물 목록을 표시합니다. */
function NeighborMyPostsPage({ posts = dummyNeighborPosts, onDeletePost }) {
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/neighbor';
  const menuItems = [
    { label: '게시물 보기', href: '/neighbor', isActive: currentPath === '/neighbor' },
    { label: '내 게시물', href: '/neighbor/my', isActive: currentPath === '/neighbor/my' },
    { label: '게시물 만들기', href: '/neighbor/create', isActive: currentPath === '/neighbor/create' },
  ];

  return (
    <Layout>
      <PageTabNavigation ariaLabel="이웃마당 메뉴" isFixed items={menuItems} />
      <div className="my-content-grid">
        {posts.map((post, index) => (
          <MyPostCard
            key={post.id ?? index}
            post={post}
            onDelete={onDeletePost}
          />
        ))}
      </div>
    </Layout>
  );
}

export default NeighborMyPostsPage;
