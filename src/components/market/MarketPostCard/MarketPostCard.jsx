import './MarketPostCard.css';
import { Link } from 'react-router-dom';

function MarketPostCard({ post = {}, postImg, postTitle, postPrice, postAddress, onClick }) {
  const image = post.image ?? postImg ?? '';
  const title = post.title ?? postTitle ?? '';
  const price = post.price ?? postPrice ?? '';
  const address = post.address ?? post.location ?? postAddress ?? '';

  return (
    <Link
      to={post.id != null ? `/market/feedin/${post.id}` : '/market/feedin'}
      className="market-post-card"
      onClick={() => onClick?.(post)}
      state={{
        post: { ...post, image, title, price, address },
      }}
    >
      <img src={image} alt={title ? `${title} 사진` : '게시물 사진'} />
      <div className='market-post-card__info'>
        <p className="market-post-card__title">{title}</p>
        {post.complete && <p className="market-post-card__status">거래완료</p>}
        <p className="market-post-card__price">{price}</p>
        <p className="market-post-card__address">{address}</p>
      </div>
    </Link>
  );
}

export default MarketPostCard;
