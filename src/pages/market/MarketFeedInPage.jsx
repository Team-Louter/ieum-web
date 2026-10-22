import { useLocation } from 'react-router-dom';
import Layout from '../../components/common/Layout/Layout';
import PageTabNavigation from '../../components/common/PageTabNavigation/PageTabNavigation';
import './MarketFeedInPage.css';
import MarketFeedInfo from '../../components/market/MarketFeedInfo/MarketFeedInfo';
import profileImage from '../../assets/images/profile.png';

function MarketFeedInPage({ selectedPost, onChat }) {
  const location = useLocation();
  const post = selectedPost ?? location.state?.post ?? {
    image: '',
    title: '제목',
    price: '가격',
    address: '거주 지역',
  };
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
        userId={post.seller?.id ?? '아이디'}
        address={post.address ?? post.location ?? ''}
        onChat={() => onChat?.(post)}
      />
    </Layout>
  );
}

export default MarketFeedInPage;
