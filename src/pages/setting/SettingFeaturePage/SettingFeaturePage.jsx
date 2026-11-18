import { useEffect, useState } from 'react';
import SettingItem from '../../../components/setting/SettingItem/SettingItem';
import Skeleton from '../../../components/common/Skeleton/Skeleton';
import { announcementApi } from '../../../api/client';
import { formatKoreanDateTime } from '../../../utils/dateTime';
import './SettingFeaturePage.css';

const features = [
  {
    title: '가족 연결',
    description: '보호자와 어르신 계정을 연결해 가족 정보를 함께 관리합니다.',
    detail:
      '어르신 계정에서 보호자 이메일로 연결 요청을 보내고, 보호자가 요청을 수락하면 연결됩니다. 연결 목록과 해제 기능은 설정에서 관리합니다.',
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
  // 관리자가 올린 소식을 먼저 보여 주고, 불러오지 못하거나 비어 있으면 기본 소개를 보여 줍니다.
  const [items, setItems] = useState(null);

  useEffect(() => {
    let isActive = true;
    announcementApi
      .features()
      .then((response) => {
        const list = Array.isArray(response) ? response : response?.items;
        if (isActive) setItems(Array.isArray(list) && list.length > 0 ? list : []);
      })
      .catch(() => {
        if (isActive) setItems([]);
      });
    return () => {
      isActive = false;
    };
  }, []);

  const entries =
    items && items.length > 0
      ? items.map((feature) => ({
          key: feature.id ?? feature.title,
          title: feature.title,
          body: feature.content,
          date: formatKoreanDateTime(feature.publishedAt ?? feature.createdAt),
        }))
      : features.map((feature) => ({
          key: feature.title,
          title: feature.title,
          body: `${feature.description}\n\n${feature.detail}`,
          date: '',
        }));

  return (
    <div className="setting-page-section">
      <SettingItem
        title="새로운 기능"
        description="이음에 새로 생긴 기능을 소개합니다. 제목을 누르면 자세한 내용이 열려요."
        className="setting-feature-page__item"
      >
        {items === null ? (
          <div className="setting-feature-page__list" role="status" aria-busy="true" aria-label="새로운 기능을 불러오는 중입니다.">
            {[0, 1, 2].map((row) => (
              <div className="setting-feature-page__entry" key={row}>
                <Skeleton text width="35%" height="18px" />
              </div>
            ))}
          </div>
        ) : (
          <div className="setting-feature-page__list">
            {entries.map((entry) => (
              <details className="setting-feature-page__entry" key={entry.key}>
                <summary>{entry.title}</summary>
                <p>{entry.body}</p>
                {entry.date && <small>{entry.date}</small>}
              </details>
            ))}
          </div>
        )}
      </SettingItem>
    </div>
  );
}

export default SettingFeaturePage;
