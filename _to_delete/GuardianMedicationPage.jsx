import { useState } from 'react';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import Layout from '../../components/common/Layout/Layout';
import './GuardianMedicationPage.css';

const statusLabels = [
  { status: 'complete', label: '복용완료' },
  { status: 'missed', label: '미복용' },
  { status: 'upcoming', label: '복용 예정' },
];

/** 연결된 어르신들의 오늘 복약 상태를 한곳에서 보여주는 보호자 전용 화면입니다. */
function GuardianMedicationPage({ elders = [], isLoading = false, apiError = '' }) {
  const [selectedElderId, setSelectedElderId] = useState('');
  const selectedElder =
    elders.find((elder) => String(elder.id) === selectedElderId) ?? elders[0] ?? null;
  const medications = Array.isArray(selectedElder?.medications) ? selectedElder.medications : [];
  const counts = statusLabels.map(({ status, label }) => ({
    status,
    label,
    count: medications.filter((medication) => medication.status === status).length,
  }));

  return (
    <Layout className="guardian-medication-layout">
      <section className="guardian-medication-page" aria-labelledby="guardian-medication-page-title">
        <h1 id="guardian-medication-page-title">복약 알림</h1>

        {elders.length > 1 && (
          <div className="guardian-medication-page__tabs" role="group" aria-label="어르신 선택">
            {elders.map((elder) => {
              const elderId = String(elder.id);
              const isSelected = String(selectedElder?.id) === elderId;

              return (
                <button
                  key={elderId}
                  className={`guardian-medication-page__tab${isSelected ? ' guardian-medication-page__tab--active' : ''}`}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setSelectedElderId(elderId)}
                >
                  {elder.loginId || elder.elderName || '어르신'}
                </button>
              );
            })}
          </div>
        )}

        {!selectedElder ? (
          apiError ? (
            <p className="guardian-medication-page__message" role="alert">
              {apiError}
            </p>
          ) : (
            <EmptyState
              title={isLoading ? '복약 알림을 불러오는 중이에요' : '연결된 어르신이 없어요'}
              description="설정에서 어르신을 연결하면 복약 알림을 확인할 수 있어요."
            />
          )
        ) : (
          <>
            <div className="guardian-medication-page__summary" aria-label="오늘 복약 요약">
              {counts.map(({ status, label, count }) => (
                <div
                  className={`guardian-medication-page__count guardian-medication-page__count--${status}`}
                  key={status}
                >
                  <span>{label}</span>
                  <strong>{count}</strong>
                </div>
              ))}
            </div>

            {medications.length > 0 ? (
              <ul className="guardian-medication-page__list">
                {medications.map(({ id, time, name, status }) => (
                  <li className="guardian-medication-page__item" key={id}>
                    <span
                      className={`guardian-medication-list__time guardian-medication-list__time--${status}`}
                    >
                      {time}
                    </span>
                    <span
                      className={`guardian-medication-list__name guardian-medication-list__name--${status}`}
                    >
                      {name}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                compact
                title="오늘 복약 일정이 없어요"
                description="복약 일정이 등록되면 이곳에서 확인할 수 있어요."
              />
            )}
          </>
        )}
      </section>
    </Layout>
  );
}

export default GuardianMedicationPage;
