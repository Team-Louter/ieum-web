import SettingGuardianList from '../../../components/setting/SettingGuardianList/SettingGuardianList';
import SettingItem from '../../../components/setting/SettingItem/SettingItem';
import SettingToggleRow from '../../../components/setting/SettingToggleRow/SettingToggleRow';
import { dummyGuardians } from '../../../constants/dummy/dummyGuardians';
import './SettingGuardianPage.css';

function SettingGuardianPage({
  settings = {},
  onToggle,
  guardians = dummyGuardians,
}) {
  return (
    <div className="setting-page-section">
      <SettingItem title="보호자 명단" description="사용자의 보호자를 추가 또는 삭제할 수 있습니다." actionLabel="수정하기">
        <SettingGuardianList guardians={guardians} />
      </SettingItem>
      <SettingItem title="보호자 권한 설정" description="보호자에게 허용할 정보와 알림 권한을 설정할 수 있습니다." className="setting-guardian-page__permission-card">
        <SettingToggleRow
          title="활동 현황 확인 설정"
          description="어르신이 12시간 동안 앱을 사용하지 않거나 활동이 없을 때 보호자에게 알림을 보냅니다."
          checked={settings.guardianActivity ?? false}
          onChange={() => onToggle?.('guardianActivity')}
        />
        <SettingToggleRow
          title="복약 미이행 알림 수신 여부"
          description="어르신이 복약 알림을 확인하지 않고 30분이 지났을 때 보호자에게 알림을 보냅니다."
          checked={settings.guardianMedication ?? false}
          onChange={() => onToggle?.('guardianMedication')}
        />
        <SettingToggleRow
          title="위치 공유 권한 및 범위 설정"
          description="보호자에게 위치를 공유하고, 설정한 범위를 벗어날 때 알림을 보냅니다."
          checked={settings.guardianLocation ?? false}
          onChange={() => onToggle?.('guardianLocation')}
        />
      </SettingItem>
    </div>
  );
}

export default SettingGuardianPage;
