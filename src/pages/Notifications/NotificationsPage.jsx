import { useState } from 'react';
import Layout from '../../components/common/Layout/Layout';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import { NotificationBodySkeleton } from '../../components/common/PageSkeleton/NotificationSkeleton';
import useNotifications from '../../hooks/useNotifications';
import './NotificationsPage.css';

const NOTIFICATION_PREVIEW_COUNT = 3;
// 복용 시각까지 이 시간(분) 안으로 남았으면 곧 먹을 약으로 보고 먼저 보여 줍니다.
const MEDICATION_SOON_MINUTES = 60;

const knownFields = ['notificationId', 'title', 'message', 'content', 'body', 'type', 'createdAt', 'read', 'isRead'];

/** 알림 객체의 필드명을 확신할 수 없어서 여러 후보를 차례로 읽습니다. (임시 화면) */
function getNotificationView(notification) {
  const title = notification.title ?? notification.type ?? '';
  const text = notification.message ?? notification.content ?? notification.body ?? '';
  const isRead = Boolean(notification.read ?? notification.isRead);
  const extra = Object.fromEntries(
    Object.entries(notification).filter(([key]) => !knownFields.includes(key)),
  );
  const fallback = !title && !text ? JSON.stringify(notification) : '';

  return { title, text, isRead, fallback, hasExtra: Object.keys(extra).length > 0, extra };
}

/** takeTime("HH:mm:ss")이 지금보다 이전이면 복용할 시간이 지난 것으로 봅니다. */
function isPastTime(takeTime = '') {
  const [hour = '0', minute = '0'] = String(takeTime).split(':');
  const scheduledAt = new Date();
  scheduledAt.setHours(Number(hour), Number(minute), 0, 0);
  return scheduledAt.getTime() <= Date.now();
}

/** 복용 시각까지 남은 분입니다. 이미 지났으면 0 이하입니다. */
function getMinutesUntil(takeTime = '') {
  const [hour = '0', minute = '0'] = String(takeTime).split(':');
  const scheduledAt = new Date();
  scheduledAt.setHours(Number(hour), Number(minute), 0, 0);
  return Math.round((scheduledAt.getTime() - Date.now()) / 60000);
}

function formatTime(value) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleString('ko-KR', {
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
}

/** 알림 목록을 보여주고 읽음 처리, 이전 알림 더 보기를 제공하는 임시 화면입니다. */
function NotificationsPage({
  role,
  medicationSchedule = [],
  onMedicationCheck,
  isLoading: isPageLoading = false,
  apiError = '',
}) {
  const { notifications, error, isReady: isNotificationsReady, markRead, loadOlder } = useNotifications();
  const [showAllMedication, setShowAllMedication] = useState(false);
  const [showAllNotifications, setShowAllNotifications] = useState(false);

  const medicationItems = (
    role === 'ROLE_SENIOR' && Array.isArray(medicationSchedule) ? medicationSchedule : []
  ).map((item) => {
    const isTaken = Boolean(item.taken);
    const statusType = isTaken ? 'taken' : isPastTime(item.takeTime) ? 'due' : 'upcoming';
    const status = {
      taken: '복용을 완료했어요',
      due: '약 먹을 시간이에요',
      upcoming: '아직 먹을 시간이 아니에요',
    }[statusType];

    return {
      id: item.id,
      title: item.label,
      time: item.time,
      takeTime: item.takeTime ?? '',
      status,
      statusType,
      isTaken,
      isSoon: !isTaken && getMinutesUntil(item.takeTime) <= MEDICATION_SOON_MINUTES,
    };
  });
  const hasItems = medicationItems.length > 0 || notifications.length > 0;
  // 복약과 알림이 모두 준비된 뒤에 한 번에 보여 줍니다.
  const isSeniorMedicationLoading = role === 'ROLE_SENIOR' && isPageLoading;
  const isInitialLoading = !isNotificationsReady || isSeniorMedicationLoading;
  const displayError = error || apiError;

  async function handleRead(notificationId) {
    try {
      await markRead(notificationId);
    } catch {
      // 목록의 오류 문구로 안내합니다.
    }
  }

  async function handleMedicationCheck(medicationId) {
    if (medicationId == null) return;
    try {
      await onMedicationCheck?.(medicationId);
    } catch {
      // App의 공통 API 오류 알림이 표시됩니다.
    }
  }

  // 각 구역 안에서 안 읽은 항목을 위에, 읽은 항목을 아래에 두고 같은 상태끼리는 원래 순서를 지킵니다.
  const sortByRead = (list) => [...list].sort((a, b) => Number(a.isRead) - Number(b.isRead));
  // 복약 목록은 알림과 달리 자리가 바뀌지 않도록 복용 시각 순서로 고정합니다.
  const medicationEntries = [...medicationItems].sort((a, b) =>
    String(a.takeTime).localeCompare(String(b.takeTime)),
  );
  const featuredMedication = medicationEntries.filter((entry) => entry.isSoon);
  const visibleMedication = showAllMedication ? medicationEntries : featuredMedication;
  const hiddenMedicationCount = medicationEntries.length - featuredMedication.length;
  const allNotificationEntries = sortByRead(
    notifications.map((notification) => {
      const view = getNotificationView(notification);

      return {
        key: notification.notificationId,
        title: view.title,
        text: view.text,
        fallback: view.fallback,
        timeText: formatTime(notification.createdAt),
        sortTime: new Date(notification.createdAt).getTime() || 0,
        isRead: view.isRead,
        actionLabel: view.isRead ? '읽음' : '읽음 처리',
        actionDisabled: view.isRead,
        onAction: () => handleRead(notification.notificationId),
      };
    }).sort((a, b) => b.sortTime - a.sortTime),
  );
  const visibleNotifications = showAllNotifications
    ? allNotificationEntries
    : allNotificationEntries.slice(0, NOTIFICATION_PREVIEW_COUNT);
  const hiddenNotificationCount = allNotificationEntries.length - visibleNotifications.length;

  function renderEntries(entries) {
    return (
      <ul className="notifications-page__list">
        {entries.map((entry) => (
          <li
            key={entry.key}
            className={`notifications-page__item${entry.isRead ? ' is-read' : ''}`}
          >
            <div className="notifications-page__body">
              {entry.title && <strong>{entry.title}</strong>}
              {entry.text && <p>{entry.text}</p>}
              {entry.fallback && <p className="notifications-page__raw">{entry.fallback}</p>}
              <span>{entry.timeText}</span>
            </div>
            <button type="button" onClick={entry.onAction} disabled={entry.actionDisabled}>
              {entry.actionLabel}
            </button>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <Layout className="notifications-layout">
      <section className="notifications-page" aria-labelledby="notifications-title">
        <h1 id="notifications-title">알림</h1>
        {displayError && (
          <p className="notifications-page__error" role="alert">
            {displayError}
          </p>
        )}
        {isInitialLoading ? (
          <div role="status" aria-busy="true" aria-label="알림을 불러오는 중입니다." className="notifications-page__loading">
            <NotificationBodySkeleton showMedication={role === 'ROLE_SENIOR'} />
          </div>
        ) : hasItems ? (
          <>
            {medicationEntries.length > 0 && (
              <section className="notifications-page__group" aria-labelledby="medication-group-title">
                <div className="notifications-page__group-header">
                  <h2 id="medication-group-title">오늘 복약</h2>
                  <span>
                    {medicationEntries.filter((entry) => entry.isTaken).length}/
                    {medicationEntries.length} 복용
                  </span>
                </div>
                {visibleMedication.length === 0 && (
                  <p className="notifications-page__group-empty">지금 먹어야 할 약이 없어요.</p>
                )}
                {visibleMedication.length > 0 && (
                <ul className="notifications-page__medication">
                  {visibleMedication.map(({ id, title, time, status, statusType, isTaken }) => (
                    <li
                      key={id}
                      className={`notifications-page__medication-row${isTaken ? ' is-taken' : ''}`}
                    >
                      <span className="notifications-page__medication-time">{time}</span>
                      <div className="notifications-page__medication-info">
                        <strong>{title}</strong>
                        <span className={`notifications-page__medication-status is-${statusType}`}>
                          {status}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleMedicationCheck(id)}
                        disabled={id == null || isTaken}
                      >
                        {isTaken ? '복용 완료' : '먹었어요 체크'}
                      </button>
                    </li>
                  ))}
                </ul>
                )}
                {hiddenMedicationCount > 0 && (
                  <button
                    type="button"
                    className="notifications-page__more"
                    onClick={() => setShowAllMedication((current) => !current)}
                  >
                    {showAllMedication ? '접기' : `오늘 복약 ${hiddenMedicationCount}개 더보기`}
                  </button>
                )}
              </section>
            )}
            {allNotificationEntries.length > 0 && (
              <section className="notifications-page__group" aria-labelledby="notification-group-title">
                <div className="notifications-page__group-header">
                  <h2 id="notification-group-title">알림</h2>
                  <span>
                    {allNotificationEntries.filter((entry) => !entry.isRead).length > 0
                      ? `안 읽음 ${allNotificationEntries.filter((entry) => !entry.isRead).length}`
                      : '모두 읽음'}
                  </span>
                </div>
                {renderEntries(visibleNotifications)}
                {hiddenNotificationCount > 0 && (
                  <button
                    type="button"
                    className="notifications-page__more"
                    onClick={() => setShowAllNotifications(true)}
                  >
                    알림 {hiddenNotificationCount}개 더보기
                  </button>
                )}
                {showAllNotifications && (
                  <>
                    <button type="button" className="notifications-page__more" onClick={loadOlder}>
                      이전 알림 불러오기
                    </button>
                    <button
                      type="button"
                      className="notifications-page__more"
                      onClick={() => setShowAllNotifications(false)}
                    >
                      접기
                    </button>
                  </>
                )}
              </section>
            )}
          </>
        ) : !displayError ? (
          <EmptyState title="새 알림이 없어요" description="알림이 오면 이곳에서 확인할 수 있어요." />
        ) : null}
      </section>
    </Layout>
  );
}

export default NotificationsPage;
