import { useState } from 'react';
import './MarketMyPostCard.css';
import ConfirmationModal from '../../common/ConfirmationModal/ConfirmationModal';
import CardMoreMenu from '../../common/CardMoreMenu/CardMoreMenu';
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
        <img loading="lazy" decoding="async" src={image} alt={title ? `${title} 사진` : '게시물 사진'} />
        <MarketPostStatus complete={isComplete} />
      </div>
      <div className="market-my-post-card__info">
        <p>{title}</p>
        <p>{price}</p>
        <p>{address}</p>
        <CardMoreMenu
          label="게시물 메뉴"
          items={[
            { label: isComplete ? '거래완료' : '거래완료 처리', onClick: () => onMarkSold?.(post.id), disabled: isComplete },
            { label: '수정하기', onClick: () => onEdit?.(post) },
            { label: '삭제하기', onClick: () => setIsDeleteConfirmOpen(true), danger: true },
          ]}
        />
      </div>
      {isDeleteConfirmOpen && (
        <ConfirmationModal
          title="게시물 삭제"
          message="정말로 게시물을 삭제하시겠습니까?"
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
