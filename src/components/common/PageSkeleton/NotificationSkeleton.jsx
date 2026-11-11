import Skeleton from '../Skeleton/Skeleton';
import '../../../pages/Notifications/NotificationsPage.css';
import '../../medication/MedicationCheckSection.css';

/** 알림 목록 한 줄의 로딩 모습입니다. 실제 알림 항목의 클래스를 그대로 씁니다. */
export function NotificationListSkeleton({ count = 3 }) {
  return (
    <ul className="notifications-page__list" role="status" aria-busy="true" aria-label="알림을 불러오는 중입니다.">
      {Array.from({ length: count }, (_, index) => (
        <li className="notifications-page__item" key={index} aria-hidden="true" style={{ borderColor: '#e3e3e3' }}>
          <div className="notifications-page__body">
            <Skeleton text width="35%" height={22} />
            <Skeleton text width="80%" />
            <Skeleton text width={120} height={16} />
          </div>
          <Skeleton width={78} height={36} style={{ borderRadius: 10 }} />
        </li>
      ))}
    </ul>
  );
}

/** 오늘 복약 목록의 로딩 모습입니다. */
export function MedicationListSkeleton({ count = 2 }) {
  return (
    <ul className="medication-check-page__list" role="status" aria-busy="true" aria-label="복약 알림을 불러오는 중입니다.">
      {Array.from({ length: count }, (_, index) => (
        <li className="medication-check-page__item" key={index} aria-hidden="true">
          <Skeleton width={72} height={32} style={{ borderRadius: 8 }} />
          <div className="medication-check-page__info">
            <Skeleton text width={140} height={22} />
            <Skeleton text width={180} />
          </div>
          <Skeleton width={110} height={40} style={{ borderRadius: 10 }} />
        </li>
      ))}
    </ul>
  );
}

/** 알림 화면 전체의 로딩 모습입니다. 어르신 계정이면 복약 영역도 함께 보여 줍니다. */
function NotificationPageSkeleton({ showMedication = false }) {
  return (
    <section className="notifications-page" aria-hidden="true">
      <h1>알림</h1>
      {showMedication && (
        <section className="medication-check-page">
          <header className="medication-check-page__header">
            <h2>오늘 복약</h2>
          </header>
          <MedicationListSkeleton />
        </section>
      )}
      <NotificationListSkeleton />
    </section>
  );
}

export default NotificationPageSkeleton;
