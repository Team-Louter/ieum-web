import { useCallback, useEffect, useState } from 'react';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import { adminApi } from '../../api/client';
import { formatAdminDay, toList } from './adminFormat';

const emptyForm = { title: '', content: '', visible: true };

function AdminFeatures() {
  const [features, setFeatures] = useState([]);
  const [listState, setListState] = useState('loading');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errorMessage, setErrorMessage] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setFeatures(toList(await adminApi.features()));
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
    setForm({ title: item.title, content: item.content, visible: Boolean(item.visible) });
    setEditingId(item.id);
    setErrorMessage('');
  }

  function close() {
    setEditingId(null);
    setErrorMessage('');
  }

  async function submit(event) {
    event.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      setErrorMessage('제목과 내용을 모두 입력해 주세요.');
      return;
    }

    const values = { title: form.title.trim(), content: form.content.trim(), visible: form.visible };
    setBusy(true);
    try {
      if (editingId === 'new') await adminApi.createFeature(values);
      else await adminApi.updateFeature(editingId, values);
      close();
      await load();
    } catch (error) {
      setErrorMessage(error?.message ?? '저장하지 못했습니다.');
    } finally {
      setBusy(false);
    }
  }

  async function toggleVisibility(item) {
    setBusy(true);
    try {
      await adminApi.setFeatureVisibility(item.id, !item.visible);
      await load();
    } catch (error) {
      setErrorMessage(error?.message ?? '공개 상태를 바꾸지 못했습니다.');
    } finally {
      setBusy(false);
    }
  }

  async function remove(id) {
    setBusy(true);
    try {
      await adminApi.deleteFeature(id);
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
    <form className="admin-form admin-form--inline" onSubmit={submit}>
      <label className="admin-field">
        제목
        <input
          value={form.title}
          maxLength={100}
          onChange={(event) => setForm({ ...form, title: event.target.value })}
        />
      </label>
      <label className="admin-field">
        내용
        <textarea
          rows={5}
          maxLength={2000}
          value={form.content}
          onChange={(event) => setForm({ ...form, content: event.target.value })}
        />
      </label>
      <label className="admin-check">
        <input
          type="checkbox"
          checked={form.visible}
          onChange={(event) => setForm({ ...form, visible: event.target.checked })}
        />
        사용자에게 공개
      </label>
      {errorMessage && <p className="admin-error" role="alert">{errorMessage}</p>}
      <div className="admin-actions">
        <button type="submit" className="admin-button admin-button--primary" disabled={busy}>
          {busy ? '저장 중' : '저장'}
        </button>
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
          <h2>새 기능 소식</h2>
          <p>공개한 소식만 사용자 화면에 최신순으로 소개됩니다.</p>
        </div>
        <button type="button" className="admin-button admin-button--primary" onClick={openNew}>
          소식 등록
        </button>
      </header>

      {editingId === null && errorMessage && <p className="admin-error" role="alert">{errorMessage}</p>}
      {editingId === 'new' && formView}

      {listState === 'loading' ? (
        <p className="admin-hint" role="status">불러오는 중입니다.</p>
      ) : listState === 'error' ? (
        <div role="alert">
          <p className="admin-error">소식을 불러오지 못했습니다.</p>
          <button type="button" className="admin-button" onClick={load}>
            다시 시도
          </button>
        </div>
      ) : features.length === 0 && editingId !== 'new' ? (
        <EmptyState compact title="등록된 소식이 없어요" description="소식 등록 버튼으로 새 기능을 알려 보세요." />
      ) : (
        <ul className="admin-list">
          {features.map((item) => (
            <li key={item.id} className="admin-list__item">
              {editingId === item.id ? (
                formView
              ) : (
                <>
                  <div className="admin-list__body">
                    <strong>
                      {item.title}
                      <span className={`admin-badge ${item.visible ? 'admin-badge--answered' : 'admin-badge--hidden'}`}>
                        {item.visible ? '공개' : '비공개'}
                      </span>
                    </strong>
                    <p>{item.content}</p>
                    <small>{formatAdminDay(item.publishedAt ?? item.createdAt)}</small>
                  </div>
                  <div className="admin-list__actions">
                    <button
                      type="button"
                      className="admin-button"
                      disabled={busy}
                      onClick={() => toggleVisibility(item)}
                    >
                      {item.visible ? '비공개로' : '공개로'}
                    </button>
                    <button type="button" className="admin-button" onClick={() => openEdit(item)}>
                      수정
                    </button>
                    {deleteId === item.id ? (
                      <>
                        <button
                          type="button"
                          className="admin-button admin-button--danger"
                          disabled={busy}
                          onClick={() => remove(item.id)}
                        >
                          정말 삭제
                        </button>
                        <button type="button" className="admin-button" onClick={() => setDeleteId(null)}>
                          취소
                        </button>
                      </>
                    ) : (
                      <button type="button" className="admin-button" onClick={() => setDeleteId(item.id)}>
                        삭제
                      </button>
                    )}
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default AdminFeatures;
