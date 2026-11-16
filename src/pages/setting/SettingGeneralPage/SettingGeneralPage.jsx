import { useEffect, useRef, useState } from 'react';
import { locationApi } from '../../../api/client';
import Button from '../../../components/common/Button/Button';
import SettingDialog from '../../../components/setting/SettingDialog/SettingDialog';
import SettingItem from '../../../components/setting/SettingItem/SettingItem';
import SettingMedicationList from '../../../components/setting/SettingMedicationList/SettingMedicationList';
import SettingToggle from '../../../components/setting/SettingToggle/SettingToggle';
import './SettingGeneralPage.css';

function SettingGeneralPage({
  settings,
  role,
  onToggle,
  medicationSchedule = [],
  onMedicationScheduleEdit,
  onMedicationCreate,
  onMedicationDelete,
  onMedicationCheck,
  isLoading = false,
  apiError = '',
}) {
  const [isMedicationDialogOpen, setIsMedicationDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [takeTime, setTakeTime] = useState('08:00');
  const [busy, setBusy] = useState(false);
  const [formMessage, setFormMessage] = useState('');
  const [locationSharing, setLocationSharing] = useState(null);
  const [locationMessage, setLocationMessage] = useState('');
  const [savingLocation, setSavingLocation] = useState(false);
  const savingLocationRef = useRef(false);

  useEffect(() => {
    if (role !== 'ROLE_SENIOR') return undefined;
    const controller = new AbortController();
    const { signal } = controller;
    locationApi.getSharing({ signal }).then((sharing) => {
      if (signal.aborted) return;
      if (typeof sharing?.enabled !== 'boolean') throw new Error();
      setLocationSharing(sharing.enabled);
    }).catch(() => {
      if (!signal.aborted) setLocationMessage('위치 공유 설정을 불러오지 못했습니다.');
    });
    return () => controller.abort();
  }, [role]);

  async function changeLocationSharing(event) {
    if (locationSharing === null || savingLocationRef.current) return;
    const { checked } = event.target;
    savingLocationRef.current = true;
    setSavingLocation(true);
    setLocationMessage('');
    try {
      const response = await locationApi.setSharing(checked);
      const saved = typeof response?.enabled === 'boolean'
        ? response
        : await locationApi.getSharing();
      if (typeof saved?.enabled !== 'boolean') throw new Error();
      setLocationSharing(saved.enabled);
      // 공유를 끄면 서버가 저장된 위치도 함께 삭제하므로 따로 지우지 않습니다.
      if (saved.enabled !== checked) setLocationMessage('위치 공유 설정이 변경되지 않았습니다.');
    } catch {
      setLocationMessage('위치 공유 설정을 저장하거나 확인하지 못했습니다.');
    } finally {
      savingLocationRef.current = false;
      setSavingLocation(false);
    }
  }

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

  const handleMedicationCheck = async (medicationId, checkDate) => {
    if (medicationId == null || typeof onMedicationCheck !== 'function') return;
    try {
      await onMedicationCheck(medicationId, checkDate);
    } catch {
      // The app-level API notice exposes the server error.
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
      {role === 'ROLE_SENIOR' && (
        <SettingItem
          title="위치 공유"
          description="켜면 친구 지도 화면을 열 때 내 위치를 공유합니다."
          trailing={(
            <SettingToggle
              checked={locationSharing === true}
              disabled={locationSharing === null || savingLocation}
              onChange={changeLocationSharing}
              label="위치 공유"
            />
          )}
        >
          {locationMessage && <p role="status">{locationMessage}</p>}
        </SettingItem>
      )}
      <SettingItem
        title="복약 알림"
        description="설정한 시간에 복약 알림을 받습니다."
        trailing={
          <SettingToggle
            checked={settings.medicationAlert}
            onChange={() => onToggle('medicationAlert')}
            label="복약 알림"
          />
        }
      />
      {settings.medicationAlert && (
        <SettingItem
          title="복약 설정"
          description="복약 알림 시간과 약 정보를 관리할 수 있습니다."
          actionLabel="수정하기"
          onAction={openMedicationDialog}
        >
          <SettingMedicationList
            schedule={medicationSchedule}
            onCheck={handleMedicationCheck}
            isLoading={isLoading}
            apiError={apiError}
          />
        </SettingItem>
      )}

      {isMedicationDialogOpen && (
        <SettingDialog
          title="복약 설정"
          description="등록된 복약 정보를 삭제하거나 새 항목을 추가할 수 있습니다. 기존 항목 수정은 서버에서 지원하지 않습니다."
          onClose={() => setIsMedicationDialogOpen(false)}
        >
          <div className="setting-general-page__medication-manager">
            <SettingMedicationList
              schedule={medicationSchedule}
              onDelete={handleMedicationDelete}
              isLoading={isLoading}
              apiError={apiError}
            />
            <form className="setting-dialog__form" onSubmit={handleMedicationCreate}>
              <label className="setting-dialog__field">
                약 이름
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  maxLength={80}
                  required
                />
              </label>
              <label className="setting-dialog__field">
                복용 시간
                <input
                  type="time"
                  value={takeTime}
                  onChange={(event) => setTakeTime(event.target.value)}
                  required
                />
              </label>
              {formMessage && (
                <p className="setting-dialog__note" role="status">
                  {formMessage}
                </p>
              )}
              <div className="setting-dialog__actions">
                <Button
                  className="setting-dialog__button setting-dialog__button--primary"
                  type="submit"
                  disabled={busy || !name.trim()}
                  loading={busy}
                  loadingText="등록 중…"
                >
                  복약 추가
                </Button>
              </div>
            </form>
          </div>
        </SettingDialog>
      )}
    </div>
  );
}

export default SettingGeneralPage;
