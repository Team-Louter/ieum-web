import './MarketFeedPage.css';
import Layout from '../../components/common/Layout/Layout';
import PageTabNavigation from '../../components/common/PageTabNavigation/PageTabNavigation';
import MarketPostCard from '../../components/market/MarketPostCard/MarketPostCard';
import { dummyMarketProducts } from '../../constants/dummy/dummyMarketProducts';

function MarketFeedPage({ products = dummyMarketProducts, onProductSelect }) {
  const productItems = products ?? [];
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/market';
  const menuItems = [
    { label: '게시물 보기', href: '/market', isActive: currentPath === '/market' },
    { label: '내 게시물', href: '/market/my', isActive: currentPath === '/market/my' },
    { label: '게시물 만들기', href: '/market/create', isActive: currentPath === '/market/create' },
  ];

  return (
    <Layout>
      <PageTabNavigation ariaLabel="나눔마당 메뉴" isFixed items={menuItems} />
      <div id="post-card-list">
        {productItems.map((product) => (
          <MarketPostCard key={product.id} post={product} onClick={onProductSelect} />
        ))}
      </div>
    </Layout>
  );
}

export default MarketFeedPage;
