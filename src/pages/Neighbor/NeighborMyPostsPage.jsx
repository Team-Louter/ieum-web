import './NeighborMyPostsPage.css';
import Layout from '../../components/common/Layout/Layout';
import PageTabNavigation from '../../components/common/PageTabNavigation/PageTabNavigation';
import MyPostCard from '../../components/neighbor/MyPostCard/MyPostCard';

/** 사용자가 작성한 게시물 목록을 표시합니다. */
function NeighborMyPostsPage() {
  const menuItems = [
    { label: '게시물 보기', href: '/neighbor', isActive: false },
    { label: '내 게시물', href: '/neighbor/my', isActive: true },
    { label: '게시물 만들기', href: '/neighbor/create', isActive: false },
  ];

  return (
    <Layout>
      <PageTabNavigation ariaLabel="이웃마당 메뉴" isFixed items={menuItems} />
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
