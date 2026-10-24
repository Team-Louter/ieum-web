import './MarketFeedPage.css';
import Layout from '../../components/common/Layout/Layout';
import PageTabNavigation from '../../components/common/PageTabNavigation/PageTabNavigation';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import MarketPostCard from '../../components/market/MarketPostCard/MarketPostCard';
import { dummyMarketProducts } from '../../constants/dummy/dummyMarketProducts';

function MarketFeedPage({
  products = dummyMarketProducts,
  onProductSelect,
  onNavigate,
  isLoading = false,
  apiError = '',
}) {
  const productItems = Array.isArray(products) ? products : [];
  const isEmpty = productItems.length === 0 && !isLoading && !apiError;
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/market';
  const menuItems = [
    { label: '게시물 보기', href: '/market', isActive: currentPath === '/market' },
    { label: '내 게시물', href: '/market/my', isActive: currentPath === '/market/my' },
    { label: '게시물 만들기', href: '/market/create', isActive: currentPath === '/market/create' },
  ];

  return (
    <Layout>
      <PageTabNavigation ariaLabel="나눔마당 메뉴" isFixed items={menuItems} />
      <div id="post-card-list" className={isEmpty ? 'empty-state-page--centered' : undefined}>
        {productItems.length > 0 ? productItems.map((product) => (
          <MarketPostCard key={product.id} post={product} onClick={onProductSelect} />
        )) : isEmpty ? (
          <EmptyState
            title="등록된 게시물이 없어요"
            description="필요한 물건을 나누거나 새로운 상품을 소개해 보세요."
            actionLabel="게시물 만들기"
            onAction={() => onNavigate?.('/market/create')}
          />
        ) : null}
      </div>
    </Layout>
  );
}

export default MarketFeedPage;
