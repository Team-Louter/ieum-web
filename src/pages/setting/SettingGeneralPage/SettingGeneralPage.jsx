import { useState } from 'react';
import SettingDialog from '../../../components/setting/SettingDialog/SettingDialog';
import SettingItem from '../../../components/setting/SettingItem/SettingItem';
import SettingMedicationList from '../../../components/setting/SettingMedicationList/SettingMedicationList';
import SettingToggle from '../../../components/setting/SettingToggle/SettingToggle';
import './SettingGeneralPage.css';

function SettingGeneralPage({
  settings,
  onToggle,
  medicationSchedule = [],
  onMedicationScheduleEdit,
  onMedicationCreate,
  onMedicationDelete,
}) {
  const [isMedicationDialogOpen, setIsMedicationDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [takeTime, setTakeTime] = useState('08:00');
  const [busy, setBusy] = useState(false);
  const [formMessage, setFormMessage] = useState('');

  const openMedicationDialog = () => {
    onMedicationScheduleEdit?.();
    setIsMedicationDialogOpen(true);
    setFormMessage('');
  };

  const handleMedicationCreate = async (event) => {
    event.preventDefault();
    if (!name.trim() || typeof onMedicationCreate !== 'function') {
      setFormMessage('복약 등록 API를 사용할 수 없습니다.');
      return;
    }
    setBusy(true);
    setFormMessage('');
    try {
      await onMedicationCreate({ name: name.trim(), takeTime: `${takeTime}:00` });
      setName('');
      setFormMessage('');
      setIsMedicationDialogOpen(false);
    } catch (error) {
      setFormMessage(error?.message ?? '복약 정보를 등록하지 못했습니다.');
    } finally {
      setBusy(false);
    }
  };

  const handleMedicationDelete = async (medicationId) => {
    if (!medicationId || typeof onMedicationDelete !== 'function') return;
    try {
      await onMedicationDelete(medicationId);
    } catch {
      // The app-level API notice exposes the server error.
    }
  };

  return (
    <div className="setting-page-section">
      <SettingItem
        title="복약 알림"
        description="설정한 시간에 복약 알림을 받습니다."
        trailing={<SettingToggle checked={settings.medicationAlert} onChange={() => onToggle('medicationAlert')} label="복약 알림" />}
      />
      {settings.medicationAlert && (
        <SettingItem
          title="복약 설정"
          description="복약 알림 시간과 약 정보를 관리할 수 있습니다."
          actionLabel="수정하기"
          onAction={openMedicationDialog}
        >
          <SettingMedicationList schedule={medicationSchedule} />
        </SettingItem>
      )}

      {isMedicationDialogOpen && (
        <SettingDialog
          title="복약 설정"
          description="등록된 복약 정보를 삭제하거나 새 항목을 추가할 수 있습니다. 기존 항목 수정은 서버에서 지원하지 않습니다."
          onClose={() => setIsMedicationDialogOpen(false)}
        >
          <div className="setting-general-page__medication-manager">
            <SettingMedicationList schedule={medicationSchedule} onDelete={handleMedicationDelete} />
            <form className="setting-dialog__form" onSubmit={handleMedicationCreate}>
              <label className="setting-dialog__field">
                약 이름
                <input value={name} onChange={(event) => setName(event.target.value)} maxLength={80} required />
              </label>
              <label className="setting-dialog__field">
                복용 시간
                <input type="time" value={takeTime} onChange={(event) => setTakeTime(event.target.value)} required />
              </label>
              {formMessage && <p className="setting-dialog__note" role="status">{formMessage}</p>}
              <div className="setting-dialog__actions">
                <button className="setting-dialog__button setting-dialog__button--primary" type="submit" disabled={busy || !name.trim()}>
                  {busy ? '등록 중…' : '복약 추가'}
                </button>
              </div>
            </form>
          </div>
        </SettingDialog>
      )}
    </div>
  );
}

export default SettingGeneralPage;
