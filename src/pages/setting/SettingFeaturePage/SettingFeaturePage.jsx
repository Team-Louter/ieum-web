import { useState } from 'react';
import SettingDialog from '../../../components/setting/SettingDialog/SettingDialog';
import SettingItem from '../../../components/setting/SettingItem/SettingItem';
import './SettingFeaturePage.css';

const features = [
  {
    title: '가족 연결',
    description: '보호자와 어르신 계정을 연결해 가족 정보를 함께 관리합니다.',
    detail:
      '어르신 계정은 보호자의 가입 이메일로 연결을 신청할 수 있습니다. 연결 목록과 해제 기능은 보호자 설정에서 관리합니다.',
  },
  {
    title: '복약 관리',
    description: '복약 시간을 등록하고 오늘 복용 여부를 확인합니다.',
    detail:
      '어르신은 복약 알림 설정과 약 복용 시간을 관리할 수 있고, 연결된 보호자는 대시보드에서 오늘 복약 상태를 확인할 수 있습니다.',
  },
  {
    title: '모임과 이웃 나눔',
    description: '관심 있는 모임을 살펴보고 이웃과 물건을 나눕니다.',
    detail:
      '모임 화면에서는 모임을 탐색하고 만들 수 있으며, 이웃 나눔 화면에서는 게시물을 확인하고 등록할 수 있습니다.',
  },
  {
    title: '친구와 채팅',
    description: '친구를 추가하고 채팅으로 소식을 주고받습니다.',
    detail: '친구 추가 화면에서 신청을 관리하고, 채팅 화면에서 친구와 대화를 나눌 수 있습니다.',
  },
];

function SettingFeaturePage() {
  const [selectedFeature, setSelectedFeature] = useState(null);

  return (
    <div className="setting-page-section">
      {features.map((feature) => (
        <SettingItem
          key={feature.title}
          title={feature.title}
          description={feature.description}
          actionLabel="자세히 보기"
          onAction={() => setSelectedFeature(feature)}
          className="setting-feature-page__item"
        />
      ))}
      {selectedFeature && (
        <SettingDialog title={selectedFeature.title} onClose={() => setSelectedFeature(null)}>
          <p className="setting-dialog__note">{selectedFeature.detail}</p>
        </SettingDialog>
      )}
    </div>
  );
}

export default SettingFeaturePage;
