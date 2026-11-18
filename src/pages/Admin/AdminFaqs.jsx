import { useCallback, useEffect, useState } from 'react';
import AdminListSkeleton from './AdminSkeleton';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import ActionModal from '../../components/common/ActionModal/ActionModal';
import AdminModal from './AdminModal';
import { adminApi } from '../../api/client';
import { toList } from './adminFormat';
import Button from '../../components/common/Button/Button';

const emptyForm = { question: '', answer: '' };

function AdminFaqs() {
  const [faqs, setFaqs] = useState([]);
  const [listState, setListState] = useState('loading');
  // editingId: null이면 폼이 닫혀 있고, 'new'면 새 질문, 그 외에는 해당 질문 수정입니다.
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errorMessage, setErrorMessage] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setFaqs(toList(await adminApi.faqs()));
      setListState('ready');
    } catch {
      setListState('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openNew() {
    setForm(emptyForm);
    setEditingId('new');
    setErrorMessage('');
  }

  function openEdit(item) {
    setForm({ question: item.question, answer: item.answer });
    setEditingId(item.id);
    setErrorMessage('');
  }

  function close() {
    setEditingId(null);
    setErrorMessage('');
  }

  async function submit(event) {
    event.preventDefault();
    if (!form.question.trim() || !form.answer.trim()) {
      setErrorMessage('질문과 답변을 모두 입력해 주세요.');
      return;
    }

    const values = { question: form.question.trim(), answer: form.answer.trim() };
    setBusy(true);
    try {
      if (editingId === 'new') await adminApi.createFaq(values);
      else await adminApi.updateFaq(editingId, values);
      close();
      await load();
    } catch (error) {
      setErrorMessage(error?.message ?? '저장하지 못했습니다.');
    } finally {
      setBusy(false);
    }
  }

  async function remove(id) {
    setBusy(true);
    try {
      await adminApi.deleteFaq(id);
      setDeleteId(null);
      await load();
    } catch (error) {
      setDeleteId(null);
      setErrorMessage(error?.message ?? '삭제하지 못했습니다.');
    } finally {
      setBusy(false);
    }
  }

  const formView = (
    <form className="admin-form admin-form--modal" onSubmit={submit}>
      <label className="admin-field">
        질문
        <input
          value={form.question}
          maxLength={200}
          onChange={(event) => setForm({ ...form, question: event.target.value })}
        />
      </label>
      <label className="admin-field">
        답변
        <textarea
          rows={5}
          maxLength={2000}
          value={form.answer}
          onChange={(event) => setForm({ ...form, answer: event.target.value })}
        />
      </label>
      {errorMessage && <p className="admin-error" role="alert">{errorMessage}</p>}
      <div className="admin-actions">
        <Button type="submit" className="admin-button admin-button--primary" disabled={busy} loading={busy}>
          저장
        </Button>
        <button type="button" className="admin-button" onClick={close}>
          취소
        </button>
      </div>
    </form>
  );

  return (
    <section className="admin-card">
      <header className="admin-card__header admin-card__header--row">
        <div>
          <h2>자주 묻는 질문</h2>
          <p>고객센터에 보이는 도움말을 등록하고 수정합니다. 새 질문은 맨 위에 보입니다.</p>
        </div>
        <button type="button" className="admin-button admin-button--primary" onClick={openNew}>
          질문 추가
        </button>
      </header>

      {editingId === null && errorMessage && <p className="admin-error" role="alert">{errorMessage}</p>}
      {editingId !== null && (
        <AdminModal title={editingId === 'new' ? '질문 추가' : '질문 수정'} onClose={close}>
          {formView}
        </AdminModal>
      )}

      {deleteId !== null && (
        <ActionModal
          title="질문 삭제"
          text={`"${faqs.find((item) => item.id === deleteId)?.question ?? ''}"을(를) 삭제할까요? 사용자 화면에서도 사라집니다.`}
          danger
          primaryLabel="삭제"
          secondaryLabel="취소"
          isBusy={busy}
          onPrimary={() => remove(deleteId)}
          onClose={() => setDeleteId(null)}
        />
      )}

      {listState === 'loading' ? (
        <AdminListSkeleton />
      ) : listState === 'error' ? (
        <div role="alert">
          <p className="admin-error">질문을 불러오지 못했습니다.</p>
          <button type="button" className="admin-button" onClick={load}>
            다시 시도
          </button>
        </div>
      ) : faqs.length === 0 ? (
        <EmptyState compact title="등록된 질문이 없어요" description="질문 추가 버튼으로 첫 질문을 등록해 보세요." />
      ) : (
        <ul className="admin-list">
          {faqs.map((item) => (
            <li key={item.id} className="admin-list__item">
              <div className="admin-list__body">
                <strong>{item.question}</strong>
                <p>{item.answer}</p>
              </div>
              <div className="admin-list__actions">
                <button type="button" className="admin-button" onClick={() => openEdit(item)}>
                  수정
                </button>
                <button type="button" className="admin-button" onClick={() => setDeleteId(item.id)}>
                    삭제
                  </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default AdminFaqs;
