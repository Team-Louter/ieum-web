import { useState } from 'react';
import './MyPostCard.css';
import ConfirmationModal from '../../common/ConfirmationModal/ConfirmationModal';

/** 내 게시물 목록에서 한 게시물을 표시합니다. */
function MyPostCard() {
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  /** 삭제 확인 모달을 엽니다. */
  function handleDeleteClick(event) {
    event.stopPropagation();
    setIsConfirmationOpen(true);
  }

  /** 삭제 확인 모달을 닫습니다. */
  function handleConfirmationClose() {
    setIsConfirmationOpen(false);
  }

  return (
    <div className="my-content">
      <button type="button" onClick={handleDeleteClick}>
        삭제하기
      </button>
      {isConfirmationOpen && (
        <ConfirmationModal onCancel={handleConfirmationClose} onConfirm={handleConfirmationClose} />
      )}
    </div>
  );
}

export default MyPostCard;
