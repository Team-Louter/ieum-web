import { useLocation } from 'react-router-dom';
import Layout from '../../components/common/Layout/Layout';
import PageTabNavigation from '../../components/common/PageTabNavigation/PageTabNavigation';
import './MarketFeedInPage.css';
import MarketFeedInfo from '../../components/market/MarketFeedInfo/MarketFeedInfo';
import profileImage from '../../assets/images/profile.png';

function MarketFeedInPage({ selectedPost, onChat, currentUserId, currentLoginId }) {
  const location = useLocation();
  const post = selectedPost ?? location.state?.post ?? {
    image: '',
    title: '제목',
    price: '가격',
    address: '거주 지역',
  };
  const postOwnerLoginId =
    post.sellerLoginId ?? post.seller?.loginId ?? post.loginId ?? post.owner ?? '';
  const isOwnPost = post.sellerId != null
    ? String(post.sellerId) === String(currentUserId)
    : Boolean(postOwnerLoginId && currentLoginId && postOwnerLoginId === currentLoginId);
  const sellerLoginId = isOwnPost && currentLoginId
    ? currentLoginId
    : postOwnerLoginId;
  const menuItems = [
    { label: '게시물 보기', href: '/market', isActive: true },
    { label: '내 게시물', href: '/market/my', isActive: false },
    { label: '게시물 만들기', href: '/market/create', isActive: false },
  ];

  return (
    <Layout>
      <PageTabNavigation ariaLabel="나눔마당 메뉴" isFixed items={menuItems} />
      <MarketFeedInfo
        img={post.image}
        title={post.title}
        price={post.price}
        content={post.description ?? ''}
        userImg={post.seller?.profileImage ?? profileImage}
        sellerLoginId={sellerLoginId || '판매자 정보 없음'}
        address={post.address ?? post.location ?? ''}
        complete={post.complete}
        showChat={!isOwnPost}
        onChat={() => onChat?.(post)}
      />
    </Layout>
  );
}

export default MarketFeedInPage;
