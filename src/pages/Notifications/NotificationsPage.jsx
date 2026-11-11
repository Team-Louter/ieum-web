import Layout from '../../components/common/Layout/Layout';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import MedicationCheckSection from '../../components/medication/MedicationCheckSection';
import useNotifications from '../../hooks/useNotifications';
import './NotificationsPage.css';

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

function formatTime(value) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString('ko-KR');
}

/** 알림 목록을 보여주고 읽음 처리, 이전 알림 더 보기를 제공하는 임시 화면입니다. */
function NotificationsPage({
  role,
  medicationSchedule = [],
  onMedicationCheck,
  checkedMedicationIds = [],
  isLoading: isPageLoading = false,
  apiError = '',
}) {
  const { notifications, error, isLoading, markRead, loadOlder } = useNotifications();

  async function handleRead(notificationId) {
    try {
      await markRead(notificationId);
    } catch {
      // 목록의 오류 문구로 안내합니다.
    }
  }

  return (
    <Layout className="notifications-layout">
      <section className="notifications-page" aria-labelledby="notifications-title">
        <h1 id="notifications-title">알림</h1>
        {role === 'ROLE_SENIOR' && (
          <MedicationCheckSection
            medicationSchedule={medicationSchedule}
            onMedicationCheck={onMedicationCheck}
            checkedMedicationIds={checkedMedicationIds}
            isLoading={isPageLoading}
            apiError={apiError}
          />
        )}
        {error && (
          <p className="notifications-page__error" role="alert">
            {error}
          </p>
        )}
        {notifications.length > 0 ? (
          <>
            <ul className="notifications-page__list">
              {notifications.map((notification) => {
                const view = getNotificationView(notification);

                return (
                  <li
                    key={notification.notificationId}
                    className={`notifications-page__item${view.isRead ? ' is-read' : ''}`}
                  >
                    <div className="notifications-page__body">
                      {view.title && <strong>{view.title}</strong>}
                      {view.text && <p>{view.text}</p>}
                      {view.fallback && <p className="notifications-page__raw">{view.fallback}</p>}
                      <span>{formatTime(notification.createdAt)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRead(notification.notificationId)}
                      disabled={view.isRead}
                    >
                      {view.isRead ? '읽음' : '읽음 처리'}
                    </button>
                  </li>
                );
              })}
            </ul>
            <button type="button" className="notifications-page__more" onClick={loadOlder}>
              이전 알림 더 보기
            </button>
          </>
        ) : isLoading ? (
          <p role="status">알림을 불러오는 중입니다.</p>
        ) : !error ? (
          <EmptyState title="새 알림이 없어요" description="알림이 오면 이곳에서 확인할 수 있어요." />
        ) : null}
      </section>
    </Layout>
  );
}

export default NotificationsPage;
