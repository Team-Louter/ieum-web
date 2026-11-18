import { useLocation } from 'react-router-dom';
import './MarketPostCreatePage.css';
import Layout from '../../components/common/Layout/Layout';
import PageTabNavigation from '../../components/common/PageTabNavigation/PageTabNavigation';
import MarketPostCreateForm from '../../components/market/MarketPostForm/MarketPostForm';

function MarketPostCreatePage({ initialValues, onSubmit }) {
  const location = useLocation();
  const editPost = location.state?.editPost ?? null;
  const formValues = editPost
    ? {
        title: editPost.title ?? '',
        price: String(editPost.priceValue ?? editPost.rawPrice ?? String(editPost.price ?? '').replace(/[^\d]/g, '')),
        content: editPost.description ?? '',
        region: editPost.address ?? editPost.region ?? '',
      }
    : initialValues;
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/market';
  const menuItems = [
    { label: '게시물 보기', href: '/market', isActive: currentPath === '/market' },
    // 게시물을 수정하는 중에는 '내 게시물' 탭이 켜져 있어야 합니다.
    { label: '내 게시물', href: '/market/my', isActive: currentPath === '/market/my' || Boolean(editPost) },
    { label: '게시물 만들기', href: '/market/create', isActive: currentPath === '/market/create' && !editPost },
  ];

  return (
    <Layout>
      <PageTabNavigation ariaLabel="나눔마당 메뉴" isFixed items={menuItems} />
      <MarketPostCreateForm
        key={editPost?.id ?? 'new'}
        initialValues={formValues}
        initialImageUrl={editPost?.image ?? ''}
        isEdit={Boolean(editPost)}
        onSubmit={onSubmit}
      />
    </Layout>
  );
}

export default MarketPostCreatePage;
