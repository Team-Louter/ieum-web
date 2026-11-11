import EmptyState from '../../components/common/EmptyState/EmptyState';
import Layout from '../../components/common/Layout/Layout';
import './MedicationCheckPage.css';

/** takeTime("HH:mm:ss")이 지금보다 이전이면 복용할 시간이 지난 것으로 봅니다. */
function isPastTime(takeTime = '') {
  const [hour = '0', minute = '0'] = String(takeTime).split(':');
  const scheduledAt = new Date();
  scheduledAt.setHours(Number(hour), Number(minute), 0, 0);
  return scheduledAt.getTime() <= Date.now();
}

/** 어르신이 오늘 먹을 약을 확인하고 복용했는지 체크하는 화면입니다. */
function MedicationCheckPage({
  medicationSchedule = [],
  onMedicationCheck,
  checkedMedicationIds = [],
  isLoading = false,
  apiError = '',
}) {
  const items = (Array.isArray(medicationSchedule) ? medicationSchedule : []).map((item) => {
    const isTaken =
      Boolean(item.taken) ||
      checkedMedicationIds.some((checkedId) => String(checkedId) === String(item.id));
    const status = isTaken ? 'taken' : isPastTime(item.takeTime) ? 'due' : 'upcoming';

    return { ...item, isTaken, status };
  });
  const takenCount = items.filter((item) => item.isTaken).length;

  async function handleCheck(medicationId) {
    if (medicationId == null) return;
    try {
      await onMedicationCheck?.(medicationId);
    } catch {
      // App의 공통 API 오류 알림이 표시됩니다.
    }
  }

  return (
    <Layout className="medication-check-layout">
      <section className="medication-check-page" aria-labelledby="medication-check-title">
        <header className="medication-check-page__header">
          <h1 id="medication-check-title">복약 알림</h1>
          {items.length > 0 && (
            <p>
              오늘 {items.length}개 중 {takenCount}개를 먹었어요
            </p>
          )}
        </header>

        {items.length > 0 ? (
          <ul className="medication-check-page__list">
            {items.map(({ id, time, label, status, isTaken }) => (
              <li className={`medication-check-page__item medication-check-page__item--${status}`} key={id}>
                <span className="medication-check-page__time">{time}</span>
                <div className="medication-check-page__info">
                  <strong>{label}</strong>
                  <span>
                    {status === 'taken'
                      ? '복용을 완료했어요'
                      : status === 'due'
                        ? '약 먹을 시간이에요'
                        : '아직 먹을 시간이 아니에요'}
                  </span>
                </div>
                <button
                  type="button"
                  className="medication-check-page__button"
                  onClick={() => handleCheck(id)}
                  disabled={id == null || isTaken}
                >
                  {isTaken ? '먹었어요' : '먹었어요 체크'}
                </button>
              </li>
            ))}
          </ul>
        ) : apiError ? (
          <p className="medication-check-page__message" role="alert">
            {apiError}
          </p>
        ) : isLoading ? (
          <p className="medication-check-page__message" role="status">
            복약 알림을 불러오는 중입니다.
          </p>
        ) : (
          <EmptyState
            title="오늘 먹을 약이 없어요"
            description="설정에서 복약 정보를 등록하면 이곳에서 확인할 수 있어요."
          />
        )}
      </section>
    </Layout>
  );
}

export default MedicationCheckPage;
