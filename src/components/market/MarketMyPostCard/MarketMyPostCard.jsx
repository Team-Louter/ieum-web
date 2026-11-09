import { useState } from 'react';
import './MarketMyPostCard.css';
import ConfirmationModal from '../../common/ConfirmationModal/ConfirmationModal';
import MarketPostStatus from '../MarketPostStatus/MarketPostStatus';

function MarketMyPostCard({
  post = {},
  postImg,
  postTitle,
  postPrice,
  postAddress,
  onMarkSold,
  onEdit,
  onDelete,
}) {
  const image = post.image ?? postImg ?? '';
  const title = post.title ?? postTitle ?? '';
  const price = post.price ?? postPrice ?? '';
  const address = post.address ?? post.location ?? postAddress ?? '';
  const isComplete = Boolean(post.complete);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  return (
    <article className="market-my-post-card">
      <div className="market-my-post-card__image">
        <img src={image} alt={title ? `${title} 사진` : '게시물 사진'} />
        <MarketPostStatus complete={isComplete} />
      </div>
      <div className="market-my-post-card__info">
        <p>{title}</p>
        <p>{price}</p>
        <p>{address}</p>
      </div>
      <div className="market-my-post-card__button-container">
        <button type="button" disabled={isComplete} onClick={() => onMarkSold?.(post.id)}>
          {isComplete ? '거래완료' : '거래완료 처리'}
        </button>
        <button type="button" onClick={() => onEdit?.(post)}>
          수정하기
        </button>
        <button type="button" onClick={() => setIsDeleteConfirmOpen(true)}>
          삭제하기
        </button>
      </div>
      {isDeleteConfirmOpen && (
        <ConfirmationModal
          onCancel={() => setIsDeleteConfirmOpen(false)}
          onConfirm={() => {
            setIsDeleteConfirmOpen(false);
            onDelete?.(post.id);
          }}
        />
      )}
    </article>
  );
}

export default MarketMyPostCard;
