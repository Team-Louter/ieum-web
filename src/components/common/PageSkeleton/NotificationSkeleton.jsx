import Skeleton from '../Skeleton/Skeleton';
import '../../../pages/Notifications/NotificationsPage.css';

/** 알림 카드 한 장의 로딩 모습입니다. 실제 알림 카드의 클래스를 그대로 씁니다. */
function NotificationCardSkeleton() {
  return (
    <li className="notifications-page__item" aria-hidden="true">
      <div className="notifications-page__body">
        <Skeleton text width="35%" height={22} />
        <Skeleton text width="80%" />
        <Skeleton text width={110} height={16} />
      </div>
      <Skeleton width={86} height={38} style={{ borderRadius: 10 }} />
    </li>
  );
}

/** 알림 카드 목록의 로딩 모습입니다. */
export function NotificationListSkeleton({ count = 3 }) {
  return (
    <ul className="notifications-page__list" role="status" aria-busy="true" aria-label="알림을 불러오는 중입니다.">
      {Array.from({ length: count }, (_, index) => (
        <NotificationCardSkeleton key={index} />
      ))}
    </ul>
  );
}

/** 구역 제목 줄입니다. 제목은 고정 글자를 그대로 보여 주고, 오른쪽 요약만 스켈레톤으로 둡니다. */
function GroupHeaderSkeleton({ title, summaryWidth }) {
  return (
    <div className="notifications-page__group-header">
      <h2>{title}</h2>
      <Skeleton text width={summaryWidth} />
    </div>
  );
}

/** 오늘 복약 체크리스트의 로딩 모습입니다. 실제 체크리스트 줄과 같은 클래스를 씁니다. */
function MedicationGroupSkeleton() {
  return (
    <section className="notifications-page__group" aria-hidden="true">
      <GroupHeaderSkeleton title="오늘 복약" summaryWidth={64} />
      <ul className="notifications-page__medication">
        {Array.from({ length: 2 }, (_, index) => (
          <li className="notifications-page__medication-row" key={index}>
            <span className="notifications-page__medication-time">
              <Skeleton text width={80} height={24} />
            </span>
            <div className="notifications-page__medication-info">
              <Skeleton text width={110} height={24} />
              <Skeleton text width={150} />
            </div>
            <Skeleton width={116} height={40} style={{ borderRadius: 10 }} />
          </li>
        ))}
      </ul>
    </section>
  );
}

/** 알림 화면의 내용 영역 로딩 모습입니다. 복약과 알림 구역을 한 번에 보여 줍니다. */
export function NotificationBodySkeleton({ showMedication = false }) {
  return (
    <>
      {showMedication && <MedicationGroupSkeleton />}
      <section className="notifications-page__group" aria-hidden="true">
        <GroupHeaderSkeleton title="알림" summaryWidth={72} />
        <ul className="notifications-page__list">
          {Array.from({ length: 3 }, (_, index) => (
            <NotificationCardSkeleton key={index} />
          ))}
        </ul>
        <Skeleton width="100%" height={44} style={{ borderRadius: 10 }} />
      </section>
    </>
  );
}

/** 알림 화면 전체의 로딩 모습입니다. 복약 구역은 어르신 계정일 때만 보여 줍니다. */
function NotificationPageSkeleton({ showMedication = false, status }) {
  return (
    <section className="notifications-page" {...status}>
      <h1>알림</h1>
      <NotificationBodySkeleton showMedication={showMedication} />
    </section>
  );
}

export default NotificationPageSkeleton;
