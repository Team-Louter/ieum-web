import { useEffect, useState } from 'react';
import { ADMIN_SESSION_EVENT, adminApi, adminSession } from '../../api/client';
import AdminFaqs from './AdminFaqs';
import AdminFeatures from './AdminFeatures';
import AdminInquiries from './AdminInquiries';
import AdminLogin from './AdminLogin';
import './AdminPage.css';

const TABS = [
  { key: 'inquiries', label: '문의' },
  { key: 'faqs', label: '자주 묻는 질문' },
  { key: 'features', label: '새 기능 소식' },
];

// 일반 서비스와 분리된 관리자 화면입니다. /admin 주소로만 들어옵니다.
function AdminPage() {
  const [isAuthed, setIsAuthed] = useState(() => Boolean(adminSession.get()));
  const [tab, setTab] = useState('inquiries');

  // 관리자 API가 401을 주면 토큰이 지워지고, 이 이벤트로 비밀번호 화면으로 돌아옵니다.
  useEffect(() => {
    const sync = () => setIsAuthed(Boolean(adminSession.get()));
    window.addEventListener(ADMIN_SESSION_EVENT, sync);
    return () => window.removeEventListener(ADMIN_SESSION_EVENT, sync);
  }, []);

  async function login(password) {
    if (!password.trim()) throw new Error('관리자 비밀번호를 입력해 주세요.');
    const result = await adminApi.login(password);
    if (!result?.accessToken) throw new Error('관리자 로그인 응답에 토큰이 없습니다.');
    adminSession.set(result.accessToken);
  }

  if (!isAuthed) return <AdminLogin onSubmit={login} />;

  return (
    <div className="admin-page">
      <header className="admin-topbar">
        <h1>이음 관리자</h1>
      </header>

      <nav className="admin-tabs" role="tablist" aria-label="관리 메뉴">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            className={tab === key ? 'is-active' : ''}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="admin-main">
        {tab === 'inquiries' && <AdminInquiries />}
        {tab === 'faqs' && <AdminFaqs />}
        {tab === 'features' && <AdminFeatures />}
      </div>
    </div>
  );
}

export default AdminPage;
