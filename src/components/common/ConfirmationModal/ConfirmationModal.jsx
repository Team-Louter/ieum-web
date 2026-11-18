import ActionModal from '../ActionModal/ActionModal';
import useSubmitOnce from '../../../hooks/useSubmitOnce';

/**
 * 삭제 같은 되돌릴 수 없는 작업을 확인하는 공용 모달입니다. 문구와 버튼 이름만 바꿔 재사용합니다.
 * title이 없으면 message가 제목이 되고, 둘 다 있으면 title은 제목, message는 안내 문구가 됩니다.
 * danger가 true(기본값)면 확인 버튼이 빨간색이고, false면 앱의 대표 초록색입니다.
 */
function ConfirmationModal({
  title,
  message = '정말로 게시물을 삭제하시겠습니까?',
  confirmLabel = '삭제하기',
  cancelLabel = '취소하기',
  danger = true,
  onCancel,
  onConfirm,
}) {
  // onConfirm이 서버 요청(Promise)이면 끝날 때까지 한 번만 실행되고 버튼에 점이 움직입니다.
  const [handleConfirm, isBusy] = useSubmitOnce(() => onConfirm?.());

  return (
    <ActionModal
      title={title ?? message}
      text={title ? message : undefined}
      primaryLabel={confirmLabel}
      secondaryLabel={cancelLabel}
      danger={danger}
      onPrimary={handleConfirm}
      isBusy={isBusy}
      onClose={onCancel}
    />
  );
}

export default ConfirmationModal;
