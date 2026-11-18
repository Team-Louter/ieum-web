import { useCallback, useEffect, useState } from 'react';
import AdminListSkeleton from './AdminSkeleton';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import { adminApi } from '../../api/client';
import { INQUIRY_STATUS, formatAdminDate, toList } from './adminFormat';
import Button from '../../components/common/Button/Button';

const FILTERS = [
  { key: '', label: '전체' },
  { key: 'RECEIVED', label: INQUIRY_STATUS.RECEIVED },
  { key: 'ANSWERED', label: INQUIRY_STATUS.ANSWERED },
];
const PAGE_SIZE = 20;

function AdminInquiries() {
  const [filter, setFilter] = useState('');
  const [items, setItems] = useState([]);
  const [waitingCount, setWaitingCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [page, setPage] = useState(0);
  const [listState, setListState] = useState('loading');
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [selected, setSelected] = useState(null);
  const [draft, setDraft] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  // 답변은 저장됐지만 메일 발송만 실패한 경우, 같은 내용을 다시 보낼 수 있게 표시합니다.
  const [emailFailed, setEmailFailed] = useState(false);
  const [busy, setBusy] = useState(false);

  const loadFirstPage = useCallback(async (status) => {
    setListState('loading');
    try {
      const response = await adminApi.inquiries({ status, page: 0, size: PAGE_SIZE });
      setItems(toList(response));
      setHasNext(Boolean(response?.hasNext));
      setWaitingCount(Number(response?.waitingCount) || 0);
      setPage(0);
      setListState('ready');
    } catch {
      setListState('error');
    }
  }, []);

  useEffect(() => {
    loadFirstPage(filter);
  }, [filter, loadFirstPage]);

  async function loadMore() {
    setIsLoadingMore(true);
    try {
      const response = await adminApi.inquiries({ status: filter, page: page + 1, size: PAGE_SIZE });
      setItems((current) => [...current, ...toList(response)]);
      setHasNext(Boolean(response?.hasNext));
      setPage((current) => current + 1);
    } catch (error) {
      setMessage({ text: error?.message ?? '문의를 더 불러오지 못했습니다.', type: 'error' });
    } finally {
      setIsLoadingMore(false);
    }
  }

  async function select(item) {
    setSelected(item);
    setDraft(item.reply ?? '');
    setMessage({ text: '', type: '' });
    setEmailFailed(false);
    try {
      const detail = await adminApi.inquiry(item.id);
      if (detail && typeof detail === 'object') {
        setSelected((current) => (current?.id === item.id ? { ...item, ...detail } : current));
        setDraft((current) => (current === (item.reply ?? '') ? (detail.reply ?? '') : current));
      }
    } catch {
      // 목록에 있는 내용으로 계속 보여 줍니다.
    }
  }

  async function submitReply(event) {
    event?.preventDefault();
    if (!draft.trim()) {
      setMessage({ text: '답변 내용을 입력해 주세요.', type: 'error' });
      return;
    }

    setBusy(true);
    try {
      const reply = draft.trim();
      const result = await adminApi.reply(selected.id, reply);
      const wasWaiting = selected.status !== 'ANSWERED';
      const updated = {
        ...selected,
        ...(result && typeof result === 'object' ? result : {}),
        reply: result?.reply ?? reply,
        status: result?.status ?? 'ANSWERED',
        repliedAt: result?.repliedAt ?? new Date().toISOString(),
      };
      delete updated.emailSent;
      setSelected(updated);
      setDraft(updated.reply);
      setItems((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      if (wasWaiting) setWaitingCount((count) => Math.max(0, count - 1));

      if (result?.emailSent === false) {
        setEmailFailed(true);
        setMessage({
          text: '답변은 저장했지만 메일 발송에 실패했어요. 다시 보내 주세요.',
          type: 'warning',
        });
      } else {
        setEmailFailed(false);
        setMessage({ text: '답변을 등록했습니다. 문의자 이메일로 전송됩니다.', type: 'success' });
      }
    } catch (error) {
      setMessage({ text: error?.message ?? '답변을 저장하지 못했습니다.', type: 'error' });
    } finally {
      setBusy(false);
    }
  }

  const isAnswered = selected?.status === 'ANSWERED';

  return (
    <div className="admin-split">
      <section className="admin-card admin-split__list">
        <header className="admin-card__header">
          <h2>문의 내역</h2>
          <p>답변 대기 {waitingCount}건</p>
        </header>
        <div className="admin-filter" role="tablist" aria-label="문의 상태">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key || 'ALL'}
              type="button"
              role="tab"
              aria-selected={filter === key}
              className={filter === key ? 'is-active' : ''}
              onClick={() => setFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {listState === 'loading' ? (
          <AdminListSkeleton />
        ) : listState === 'error' ? (
          <div role="alert">
            <p className="admin-error">문의 내역을 불러오지 못했습니다.</p>
            <button type="button" className="admin-button" onClick={() => loadFirstPage(filter)}>
              다시 시도
            </button>
          </div>
        ) : items.length === 0 ? (
          <EmptyState compact title="문의가 없어요" description="해당하는 문의가 아직 없습니다." />
        ) : (
          <>
            <ul className="admin-inquiry-list">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={`admin-inquiry-item${item.id === selected?.id ? ' is-selected' : ''}`}
                    onClick={() => select(item)}
                  >
                    <span className="admin-inquiry-item__top">
                      <strong>{item.subject}</strong>
                      <span className={`admin-badge admin-badge--${String(item.status).toLowerCase()}`}>
                        {INQUIRY_STATUS[item.status] ?? item.status}
                      </span>
                    </span>
                    <small>
                      {item.category} · {item.nickname} · {formatAdminDate(item.createdAt)}
                    </small>
                  </button>
                </li>
              ))}
            </ul>
            {hasNext && (
              <button
                type="button"
                className="admin-button admin-load-more"
                onClick={loadMore}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? '불러오는 중' : '더 보기'}
              </button>
            )}
          </>
        )}
      </section>

      <section className="admin-card admin-split__detail">
        {!selected ? (
          <EmptyState
            compact
            title="문의를 선택해 주세요"
            description="왼쪽 목록에서 문의를 누르면 내용을 확인하고 답변할 수 있어요."
          />
        ) : (
          <>
            <header className="admin-card__header">
              <h2>{selected.subject}</h2>
              <p>
                {selected.category} · {selected.nickname} · {formatAdminDate(selected.createdAt)}
              </p>
            </header>
            <p className="admin-inquiry-message">{selected.message}</p>
            <dl className="admin-meta">
              <dt>답장 받을 이메일</dt>
              <dd>{selected.replyEmail}</dd>
            </dl>

            <form className="admin-form" onSubmit={submitReply}>
              <label className="admin-field">
                {isAnswered ? '답변 수정' : '답변 작성'}
                <textarea
                  rows={7}
                  maxLength={5000}
                  value={draft}
                  placeholder="문의자에게 보낼 답변을 입력해 주세요."
                  onChange={(event) => {
                    setDraft(event.target.value);
                    setMessage({ text: '', type: '' });
                  }}
                />
              </label>
              {selected.repliedAt && (
                <small className="admin-hint">마지막 답변 {formatAdminDate(selected.repliedAt)}</small>
              )}
              {message.text && (
                <p
                  className={`admin-notice${message.type === 'error' ? ' admin-notice--error' : ''}${message.type === 'warning' ? ' admin-notice--warning' : ''}`}
                  role={message.type === 'error' ? 'alert' : 'status'}
                >
                  {message.text}
                </p>
              )}
              <div className="admin-actions">
                <Button type="submit" className="admin-button admin-button--primary" disabled={busy} loading={busy}>
                  {emailFailed
                      ? '메일 다시 보내기'
                      : isAnswered
                        ? '답변 다시 보내기'
                        : '답변 등록'}
                </Button>
              </div>
            </form>
          </>
        )}
      </section>
    </div>
  );
}

export default AdminInquiries;
