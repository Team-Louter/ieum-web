import './NeighborCreatePostPage.css';
import Layout from '../../components/common/Layout/Layout';
import PageTabNavigation from '../../components/common/PageTabNavigation/PageTabNavigation';
import PostCreateForm from '../../components/neighbor/PostCreateForm/PostCreateForm';

/** 새 이웃마당 게시물을 작성하는 화면입니다. */
function NeighborCreatePostPage() {
  const menuItems = [
    { label: '게시물 보기', href: '/neighbor', isActive: false },
    { label: '내 게시물', href: '/neighbor/my', isActive: false },
    { label: '게시물 만들기', href: '/neighbor/create', isActive: true },
  ];

  return (
    <Layout>
      <PageTabNavigation ariaLabel="이웃마당 메뉴" isFixed items={menuItems} />
      <PostCreateForm />
    </Layout>
  );
}

export default NeighborCreatePostPage;
