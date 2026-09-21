import './MarketPostCard.css';
import { Link } from 'react-router-dom';

function MarketPostCard({ postImg, postTitle, postPrice, postAddress }) {
  return (
    <Link
      to="/market/feedin"
      className="market-post-card"
      state={{
        post: {
          image: postImg,
          title: postTitle,
          price: postPrice,
          address: postAddress,
        },
      }}
    >
      <img src={postImg} alt="게시물 사진" />
      <div className='market-post-card__info'>
        <p>{postTitle}</p>
        <p>{postPrice}</p>
        <p>{postAddress}</p>
      </div>
    </Link>
  );
}

export default MarketPostCard;
