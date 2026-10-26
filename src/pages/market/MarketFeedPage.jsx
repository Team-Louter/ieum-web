import { useEffect, useRef, useState } from 'react';
import './MarketFeedPage.css';
import Layout from '../../components/common/Layout/Layout';
import PageTabNavigation from '../../components/common/PageTabNavigation/PageTabNavigation';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import MarketPostCard from '../../components/market/MarketPostCard/MarketPostCard';
import { dummyMarketProducts } from '../../constants/dummy/dummyMarketProducts';

const PAGE_SIZE = 12;

function MarketFeedPage({
  products = dummyMarketProducts,
  onProductSelect,
  onNavigate,
  isLoading = false,
  apiError = '',
}) {
  const [selectedPage, setSelectedPage] = useState(1);
  const productListRef = useRef(null);
  const productItems = Array.isArray(products) ? products : [];
  const isEmpty = productItems.length === 0 && !isLoading && !apiError;
  const totalPages = Math.ceil(productItems.length / PAGE_SIZE);
  const currentPage = Math.min(selectedPage, totalPages || 1);
  const firstProductIndex = (currentPage - 1) * PAGE_SIZE;
  const visibleProducts = productItems.slice(firstProductIndex, firstProductIndex + PAGE_SIZE);
  const pageNumbers = [...new Set([1, currentPage - 1, currentPage, currentPage + 1, totalPages])]
    .filter((pageNumber) => pageNumber >= 1 && pageNumber <= totalPages)
    .sort((a, b) => a - b);
  const paginationItems = pageNumbers.flatMap((pageNumber, index) =>
    index > 0 && pageNumber - pageNumbers[index - 1] > 1
      ? [`ellipsis-${pageNumber}`, pageNumber]
      : [pageNumber],
  );

  useEffect(() => {
    setSelectedPage((page) => Math.min(page, totalPages || 1));
  }, [totalPages]);

  function moveToPage(page) {
    if (page < 1 || page > totalPages || page === currentPage) return;
    setSelectedPage(page);
    productListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const currentPath = window.location.pathname.replace(/\/$/, '') || '/market';
  const menuItems = [
    { label: '게시물 보기', href: '/market', isActive: currentPath === '/market' },
    { label: '내 게시물', href: '/market/my', isActive: currentPath === '/market/my' },
    { label: '게시물 만들기', href: '/market/create', isActive: currentPath === '/market/create' },
  ];

  return (
    <Layout>
      <PageTabNavigation ariaLabel="나눔마당 메뉴" isFixed items={menuItems} />
      <div
        id="post-card-list"
        ref={productListRef}
        className={isEmpty ? 'empty-state-page--centered' : undefined}
      >
        {productItems.length > 0 ? (
          visibleProducts.map((product) => (
            <MarketPostCard key={product.id} post={product} onClick={onProductSelect} />
          ))
        ) : isEmpty ? (
          <EmptyState
            title="등록된 게시물이 없어요"
            description="필요한 물건을 나누거나 새로운 상품을 소개해 보세요."
            actionLabel="게시물 만들기"
            onAction={() => onNavigate?.('/market/create')}
          />
        ) : null}
      </div>
      {totalPages > 1 && (
        <nav className="market-feed-pagination" aria-label="게시물 목록 페이지 이동">
          <button
            type="button"
            onClick={() => moveToPage(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="이전 페이지"
          >
            &lt;
          </button>
          {paginationItems.map((item) =>
            typeof item === 'string' ? (
              <span className="market-feed-pagination__gap" key={item} aria-hidden="true">
                …
              </span>
            ) : (
              <button
                type="button"
                key={item}
                className={item === currentPage ? 'is-current' : ''}
                onClick={() => moveToPage(item)}
                aria-label={`${item}페이지`}
                aria-current={item === currentPage ? 'page' : undefined}
              >
                {item}
              </button>
            ),
          )}
          <button
            type="button"
            onClick={() => moveToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="다음 페이지"
          >
            &gt;
          </button>
        </nav>
      )}
    </Layout>
  );
}

export default MarketFeedPage;
