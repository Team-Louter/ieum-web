import './NeighborCreatePostPage.css';
import Layout from '../../components/common/Layout/Layout';
import PageTabNavigation from '../../components/common/PageTabNavigation/PageTabNavigation';
import PostCreateForm from '../../components/neighbor/PostCreateForm/PostCreateForm';

/** 새 이웃마당 게시물을 작성하는 화면입니다. */
function NeighborCreatePostPage({ initialValues, onSubmit }) {
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/neighbor';
  const menuItems = [
    { label: '게시물 보기', href: '/neighbor', isActive: currentPath === '/neighbor' },
    { label: '내 게시물', href: '/neighbor/my', isActive: currentPath === '/neighbor/my' },
    { label: '게시물 만들기', href: '/neighbor/create', isActive: currentPath === '/neighbor/create' },
  ];

  return (
    <Layout>
      <PageTabNavigation ariaLabel="이웃마당 메뉴" isFixed items={menuItems} />
      <PostCreateForm initialValues={initialValues} onSubmit={onSubmit} />
    </Layout>
  );
}

export default NeighborCreatePostPage;
