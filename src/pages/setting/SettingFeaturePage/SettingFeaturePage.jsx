import SettingItem from '../../../components/setting/SettingItem/SettingItem';
import './SettingFeaturePage.css';

function SettingFeaturePage() {
  return (
    <div className="setting-page-section">
      {[1, 2, 3, 4].map((feature) => (
        <SettingItem
          key={feature}
          title="새로운 기능"
          description="새롭게 추가된 이음의 기능을 확인해 보세요."
          actionLabel="자세히 보기"
          className="setting-feature-page__item"
        />
      ))}
    </div>
  );
}

export default SettingFeaturePage;
