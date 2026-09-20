import './MarketPostCard.css';

function MarketPostCard({ postImg, postTitle, postPrice, postAddress }) {
  return (
    <a href='#' className='market-post-card'>
      <img src={postImg} alt="게시물 사진" />
      <div className='market-post-card__info'>
        <p>{postTitle}</p>
        <p>{postPrice}</p>
        <p>{postAddress}</p>
      </div>
    </a>
  );
}

export default MarketPostCard;
