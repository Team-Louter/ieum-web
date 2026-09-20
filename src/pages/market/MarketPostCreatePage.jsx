import './MarketFeedPage.css';
import Layout from '../../components/common/Layout/Layout';
import PageTabNavigation from '../../components/common/PageTabNavigation/PageTabNavigation';
import MarketPostCreateForm from '../../components/market/MarketPostForm/MarketPostForm';

function MarketFeedPage() {
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/market';
  const menuItems = [
    { label: '게시물 보기', href: '/market', isActive: currentPath === '/market' },
    { label: '내 게시물', href: '/market/my', isActive: currentPath === '/market/my' },
    { label: '게시물 만들기', href: '/market/create', isActive: currentPath === '/market/create' },
  ];

  return (
    <Layout>
      <PageTabNavigation ariaLabel="나눔마당 메뉴" isFixed items={menuItems} />
      <MarketPostCreateForm></MarketPostCreateForm>
    </Layout>
  );
}

export default MarketFeedPage;
