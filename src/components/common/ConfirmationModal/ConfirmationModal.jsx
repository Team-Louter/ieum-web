import './ConfirmationModal.css';
import SettingDialog from '../../setting/SettingDialog/SettingDialog';

/** 삭제 같은 되돌릴 수 없는 작업을 확인하는 공용 모달입니다. 문구와 버튼 이름만 바꿔 재사용합니다. */
function ConfirmationModal({
  message = '정말로 게시물을 삭제하시겠습니까?',
  confirmLabel = '삭제하기',
  cancelLabel = '취소하기',
  danger = true,
  onCancel,
  onConfirm,
}) {
  return (
    <SettingDialog
      title={message}
      onClose={onCancel}
      className="confirmation-dialog"
      backdropClassName="confirmation-dialog-backdrop"
    >
      <div className="setting-dialog__actions confirmation-dialog__actions">
        <button type="button" className="setting-dialog__button" onClick={onCancel}>
          {cancelLabel}
        </button>
        <button
          type="button"
          className={`setting-dialog__button ${
            danger ? 'setting-dialog__button--danger' : 'setting-dialog__button--primary'
          }`}
          onClick={onConfirm}
        >
          {confirmLabel}
        </button>
      </div>
    </SettingDialog>
  );
}

export default ConfirmationModal;
