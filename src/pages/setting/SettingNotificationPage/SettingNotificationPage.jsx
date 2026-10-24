import SettingItem from '../../../components/setting/SettingItem/SettingItem';
import SettingMedicationList from '../../../components/setting/SettingMedicationList/SettingMedicationList';
import SettingToggle from '../../../components/setting/SettingToggle/SettingToggle';
import { dummyMedicationSchedule } from '../../../constants/dummy/dummyGuardianData';
import './SettingNotificationPage.css';

function SettingNotificationPage({
  settings = {},
  onToggle,
  medicationSchedule = dummyMedicationSchedule,
  onMedicationScheduleEdit,
}) {
  return (
    <div className="setting-page-section">
      <SettingItem
        title="복약 알림"
        description="설정한 시간에 복약 알림을 받습니다."
        trailing={<SettingToggle checked={settings.medicationAlert ?? false} onChange={() => onToggle?.('medicationAlert')} label="복약 알림" />}
      />
      {settings.medicationAlert && (
        <SettingItem
          title="복약 설정"
          description="복약 알림 시간과 약 정보를 관리할 수 있습니다."
          actionLabel="수정하기"
          onAction={onMedicationScheduleEdit}
        >
          <SettingMedicationList schedule={medicationSchedule ?? dummyMedicationSchedule} />
        </SettingItem>
      )}
    </div>
  );
}

export default SettingNotificationPage;
