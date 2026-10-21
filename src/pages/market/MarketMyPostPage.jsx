import './MarketMyPostPage.css';
import Layout from '../../components/common/Layout/Layout';
import PageTabNavigation from '../../components/common/PageTabNavigation/PageTabNavigation';
import MarketMyPostCard from '../../components/market/MarketMyPostCard/MarketMyPostCard';
import img from '../../assets/images/comment.png';

/** 사용자가 등록한 중고장터 게시물을 표시합니다. */
function MarketMyPostPage() {
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
        <MarketMyPostCard postImg={img} postTitle={"제목"} postPrice={"가격"} postAddress={"몰라요"}></MarketMyPostCard>
        <MarketMyPostCard postImg={img} postTitle={"제목"} postPrice={"가격"} postAddress={"몰라요"}></MarketMyPostCard>
        <MarketMyPostCard postImg={img} postTitle={"제목"} postPrice={"가격"} postAddress={"몰라요"}></MarketMyPostCard>
        <MarketMyPostCard postImg={img} postTitle={"제목"} postPrice={"가격"} postAddress={"몰라요"}></MarketMyPostCard>
        <MarketMyPostCard postImg={img} postTitle={"제목"} postPrice={"가격"} postAddress={"몰라요"}></MarketMyPostCard>
        <MarketMyPostCard postImg={img} postTitle={"제목"} postPrice={"가격"} postAddress={"몰라요"}></MarketMyPostCard>
      </div>
    </Layout>
  );
}

export default MarketMyPostPage;
