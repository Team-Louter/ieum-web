import { useState } from 'react';
import Layout from '../../components/common/Layout/Layout';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import { NotificationBodySkeleton } from '../../components/common/PageSkeleton/NotificationSkeleton';
import ConfirmationModal from '../../components/common/ConfirmationModal/ConfirmationModal';
import useNotifications from '../../hooks/useNotifications';
import { formatKoreanDateTime, parseServerDate } from '../../utils/dateTime';
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

/** 복약 예정 시각(ms)입니다. 서버가 준 scheduledAt을 우선 쓰고, 없으면 오늘의 takeTime으로 계산합니다. */
function getScheduledTime(item) {
  const scheduled = parseServerDate(item.scheduledAt);
  if (scheduled) return scheduled.getTime();
  const [hour = '0', minute = '0'] = String(item.takeTime ?? '').split(':');
  const fallback = new Date();
  fallback.setHours(Number(hour), Number(minute), 0, 0);
  return fallback.getTime();
}

/** 복용 시각까지 남은 분입니다. 이미 지났으면 0 이하입니다. */
function getMinutesUntil(item) {
  return Math.round((getScheduledTime(item) - Date.now()) / 60000);
}

/** 알림 목록을 보여주고 읽음 처리, 이전 알림 더 보기를 제공하는 임시 화면입니다. */
function NotificationsPage({
  role,
  medicationSchedule = [],
  onMedicationCheck,
  isLoading: isPageLoading = false,
  apiError = '',
}) {
  const {
    notifications,
    error,
    isReady: isNotificationsReady,
    markRead,
    markAllRead,
    remove,
    removeAll,
    loadOlder,
  } = useNotifications();
  const [isDeleteAllOpen, setIsDeleteAllOpen] = useState(false);
  const [showAllMedication, setShowAllMedication] = useState(false);
  const [showAllNotifications, setShowAllNotifications] = useState(false);

  const medicationItems = (
    role === 'ROLE_SENIOR' && Array.isArray(medicationSchedule) ? medicationSchedule : []
  ).map((item) => {
    const isTaken = Boolean(item.taken);
    // 자정이 지나 전날 회차가 확인 대상이면 '어제' 기준으로 안내합니다.
    const isPrevious = Boolean(item.isPreviousDose);
    const statusType = isTaken ? 'taken' : isPrevious || getMinutesUntil(item) <= 0 ? 'due' : 'upcoming';
    const status = {
      taken: isPrevious ? '어제 복용을 확인했어요' : '복용을 완료했어요',
      due: isPrevious ? '어제 약을 아직 확인하지 않았어요' : '약 먹을 시간이에요',
      upcoming: '아직 먹을 시간이 아니에요',
    }[statusType];

    return {
      id: item.id,
      title: item.label,
      time: item.time,
      takeTime: item.takeTime ?? '',
      checkDate: item.checkDate ?? '',
      isPrevious,
      status,
      statusType,
      isTaken,
      isSoon: !isTaken && (isPrevious || getMinutesUntil(item) <= MEDICATION_SOON_MINUTES),
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

  async function handleDelete(notificationId) {
    try {
      await remove(notificationId);
    } catch {
      // 목록의 오류 문구로 안내합니다.
    }
  }

  async function handleReadAll() {
    try {
      await markAllRead();
    } catch {
      // 목록의 오류 문구로 안내합니다.
    }
  }

  async function handleDeleteAll() {
    setIsDeleteAllOpen(false);
    try {
      await removeAll();
    } catch {
      // 목록의 오류 문구로 안내합니다.
    }
  }

  async function handleMedicationCheck(medicationId, checkDate) {
    if (medicationId == null) return;
    try {
      await onMedicationCheck?.(medicationId, checkDate);
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
        timeText: formatKoreanDateTime(notification.createdAt),
        sortTime: parseServerDate(notification.createdAt)?.getTime() || 0,
        isRead: view.isRead,
        actionLabel: view.isRead ? '읽음' : '읽음 처리',
        actionDisabled: view.isRead,
        onAction: () => handleRead(notification.notificationId),
        onDelete: () => handleDelete(notification.notificationId),
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
            <div className="notifications-page__item-actions">
              <button type="button" onClick={entry.onAction} disabled={entry.actionDisabled}>
                {entry.actionLabel}
              </button>
              <button type="button" onClick={entry.onDelete}>
                삭제
              </button>
            </div>
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
                  {visibleMedication.map(({ id, title, time, status, statusType, isTaken, isPrevious, checkDate }) => (
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
                        onClick={() => handleMedicationCheck(id, checkDate)}
                        disabled={id == null || isTaken}
                      >
                        {isTaken ? (isPrevious ? '어제 복용 확인' : '복용 완료') : isPrevious ? '어제 먹었어요 체크' : '먹었어요 체크'}
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
                <div className="notifications-page__group-actions">
                  <button
                    type="button"
                    className="notifications-page__more"
                    onClick={handleReadAll}
                    disabled={allNotificationEntries.every((entry) => entry.isRead)}
                  >
                    모두 읽음
                  </button>
                  <button
                    type="button"
                    className="notifications-page__more"
                    onClick={() => setIsDeleteAllOpen(true)}
                  >
                    모두 삭제
                  </button>
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
      {isDeleteAllOpen && (
        <ConfirmationModal
          message="알림을 모두 삭제할까요? 아직 불러오지 않은 알림도 함께 삭제돼요."
          confirmLabel="모두 삭제"
          onCancel={() => setIsDeleteAllOpen(false)}
          onConfirm={handleDeleteAll}
        />
      )}
    </Layout>
  );
}

export default NotificationsPage;
