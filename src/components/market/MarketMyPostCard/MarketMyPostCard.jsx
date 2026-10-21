import './MarketMyPostCard.css';

function MarketMyPostCard({ postImg, postTitle, postPrice, postAddress }) {
  return (
    <a href='#' className='market-my-post-card'>
      <img src={postImg} alt="게시물 사진" />
      <div className='market-my-post-card__info'>
        <p>{postTitle}</p>
        <p>{postPrice}</p>
        <p>{postAddress}</p>
      </div>
      <div className='market-my-post-card__button-container'>
        <button type='button'>거래완료</button>
        <button type='button'>삭제하기</button>
      </div>
    </a>
  );
}

export default MarketMyPostCard;
