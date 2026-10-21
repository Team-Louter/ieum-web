import SettingItem from '../../../components/setting/SettingItem/SettingItem';
import SettingMedicationList from '../../../components/setting/SettingMedicationList/SettingMedicationList';
import SettingToggle from '../../../components/setting/SettingToggle/SettingToggle';
import SettingToggleRow from '../../../components/setting/SettingToggleRow/SettingToggleRow';
import './SettingGeneralPage.css';

function SettingGeneralPage({ settings, onToggle }) {
  return (
    <div className="setting-page-section">
      <SettingItem
        title="다크모드"
        description="화면 배경을 어둡게 설정해 눈을 보호하고 배터리 사용량을 줄입니다."
        trailing={<SettingToggle checked={settings.darkMode} onChange={() => onToggle('darkMode')} label="다크모드" />}
      />
      <SettingItem title="알림 설정" description="받고 싶은 알림을 선택해 주세요." className="setting-general-page__notification-card">
        <SettingToggleRow
          title="게시물 또는 댓글 상호작용 알림"
          description="작성한 게시물 또는 댓글에 좋아요 또는 댓글이 달리면 알림을 받습니다."
          checked={settings.interactionAlert}
          onChange={() => onToggle('interactionAlert')}
        />
        <SettingToggleRow
          title="호출 알림"
          description="친구가 나를 호출하면 알림을 받습니다."
          checked={settings.mentionAlert}
          onChange={() => onToggle('mentionAlert')}
        />
        <SettingToggleRow
          title="복약 알림"
          description="설정한 시간에 복약 알림을 받습니다."
          checked={settings.medicationAlert}
          onChange={() => onToggle('medicationAlert')}
        />
      </SettingItem>
      {settings.medicationAlert && (
        <SettingItem title="복약 설정" description="복약 알림 시간과 약 정보를 관리할 수 있습니다." actionLabel="수정하기">
          <SettingMedicationList />
        </SettingItem>
      )}
    </div>
  );
}

export default SettingGeneralPage;
