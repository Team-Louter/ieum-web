import './MarketMyPostCard.css';

function MarketMyPostCard({ post = {}, postImg, postTitle, postPrice, postAddress, onMarkSold, onDelete }) {
  const image = post.image ?? postImg ?? '';
  const title = post.title ?? postTitle ?? '';
  const price = post.price ?? postPrice ?? '';
  const address = post.address ?? post.location ?? postAddress ?? '';

  return (
    <article className='market-my-post-card'>
      <img src={image} alt={title ? `${title} 사진` : '게시물 사진'} />
      <div className='market-my-post-card__info'>
        <p>{title}</p>
        <p>{price}</p>
        <p>{address}</p>
      </div>
      <div className='market-my-post-card__button-container'>
        <button type='button' onClick={() => onMarkSold?.(post.id)}>거래완료</button>
        <button type='button' onClick={() => onDelete?.(post.id)}>삭제하기</button>
      </div>
    </article>
  );
}

export default MarketMyPostCard;
