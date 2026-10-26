import { useState } from 'react';
import { readDemoValue, updateDemoValue } from '../../../api/demoStore';
import SettingDialog from '../../../components/setting/SettingDialog/SettingDialog';
import SettingItem from '../../../components/setting/SettingItem/SettingItem';
import EmptyState from '../../../components/common/EmptyState/EmptyState';
import './SettingSupportPage.css';

const questions = [
  {
    question: '비밀번호를 잊어버렸어요.',
    answer:
      '내 계정 메뉴에서 비밀번호 변경을 누른 뒤, 가입 이메일로 인증 코드를 받아 새 비밀번호를 설정할 수 있습니다.',
  },
  {
    question: '보호자와 어르신 계정은 어떻게 연결하나요?',
    answer:
      '보호자 설정에서 연결 관리를 열고 어르신의 가입 이메일을 입력해 연결을 신청합니다. 연결 해제도 같은 화면에서 할 수 있습니다.',
  },
  {
    question: '복약 시간과 약 이름을 바꾸고 싶어요.',
    answer:
      '일반 설정의 복약 설정에서 약 정보를 추가하거나 삭제할 수 있습니다. 현재 서버는 등록과 삭제를 지원하며 기존 항목 수정은 지원하지 않습니다.',
  },
  {
    question: '알림을 켰는데 알림이 오지 않아요.',
    answer:
      '현재 서버에서 저장하는 알림은 복약·활동 관련 설정입니다. 게시물 상호작용·호출 알림은 이 브라우저에 저장되는 환경설정이며 실제 푸시 발송 API는 아직 연결되어 있지 않습니다.',
  },
];

const inquiryCategories = [
  '계정 및 로그인',
  '보호자·어르신 연결',
  '복약 및 알림',
  '서비스 이용',
  '개인정보',
  '기타',
];
const inquiryStorageKey = 'support.inquiries';

function createInquiryId() {
  return `IE-${Date.now().toString(36).toUpperCase()}`;
}

function SettingSupportPage({ accountEmail = '', signupEmail = '', currentLoginId = '' }) {
  const scope = currentLoginId || accountEmail || 'guest';
  const [inquiries, setInquiries] = useState(() => {
    const savedInquiries = readDemoValue(inquiryStorageKey, [], scope);
    return Array.isArray(savedInquiries) ? savedInquiries : [];
  });
  const [form, setForm] = useState({
    category: inquiryCategories[0],
    subject: '',
    message: '',
    replyEmail: signupEmail || accountEmail,
  });
  const [notice, setNotice] = useState(null);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setNotice(null);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const inquiry = {
      id: createInquiryId(),
      ...form,
      createdAt: new Date().toISOString(),
      status: '접수 완료',
    };

    try {
      const nextInquiries = updateDemoValue(
        inquiryStorageKey,
        (current) => [inquiry, ...(Array.isArray(current) ? current : [])],
        [],
        scope,
      );
      setInquiries(nextInquiries);
      setForm((current) => ({ ...current, subject: '', message: '' }));
      setNotice({ type: 'success', text: `문의가 등록되었습니다. 접수 번호 ${inquiry.id}` });
    } catch {
      setNotice({ type: 'error', text: '문의 등록에 실패했습니다. 잠시 후 다시 시도해 주세요.' });
    }
  };

  return (
    <div className="setting-page-section setting-support-page">
      <SettingItem
        title="자주 묻는 질문"
        description="이음 사용 중 자주 찾는 도움말입니다."
        className="setting-support-page__card"
      >
        <div className="setting-support-page__questions">
          {questions.map(({ question, answer }) => (
            <details key={question} className="setting-support-page__question">
              <summary>{question}</summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </SettingItem>

      <SettingItem
        title="고객센터 문의"
        description="문의 내용을 남겨 주시면 확인할 수 있습니다."
        actionLabel="문의 작성"
        onAction={() => setIsInquiryOpen(true)}
        className="setting-support-page__card"
      />

      <SettingItem title="최근 문의" className="setting-support-page__card">
        {inquiries.length > 0 ? (
          <section className="setting-support-page__history" aria-label="최근 문의 내역">
            <ul>
              {inquiries.slice(0, 5).map((inquiry) => (
                <li key={inquiry.id}>
                  <div>
                    <span className="setting-support-page__history-category">
                      {inquiry.category}
                    </span>
                    <strong>{inquiry.subject}</strong>
                    <time dateTime={inquiry.createdAt}>
                      {new Date(inquiry.createdAt).toLocaleDateString('ko-KR')}
                    </time>
                  </div>
                  <span className="setting-support-page__history-status">{inquiry.status}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <EmptyState
            compact
            title="등록된 문의가 없어요"
            description="고객센터에 문의를 남기면 이곳에서 확인할 수 있어요."
            actionLabel="문의 작성"
            onAction={() => setIsInquiryOpen(true)}
          />
        )}
      </SettingItem>

      {isInquiryOpen && (
        <SettingDialog
          title="고객센터 문의"
          description="문의 내용을 남겨 주시면 확인할 수 있습니다."
          onClose={() => setIsInquiryOpen(false)}
          className="setting-dialog--support-inquiry"
        >
          <form className="setting-support-page__form" onSubmit={handleSubmit}>
            <label className="setting-support-page__field">
              <span>문의 유형</span>
              <select name="category" value={form.category} onChange={updateField}>
                {inquiryCategories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </label>
            <label className="setting-support-page__field">
              <span>답변 받을 이메일</span>
              <input
                type="email"
                name="replyEmail"
                value={form.replyEmail}
                onChange={updateField}
                placeholder="이메일 주소를 입력해 주세요"
                required
              />
            </label>
            <label className="setting-support-page__field">
              <span>문의 제목</span>
              <input
                type="text"
                name="subject"
                value={form.subject}
                onChange={updateField}
                placeholder="문의 제목을 입력해 주세요"
                maxLength={100}
                required
              />
            </label>
            <label className="setting-support-page__field">
              <span>문의 내용</span>
              <textarea
                name="message"
                value={form.message}
                onChange={updateField}
                placeholder="문의 내용을 자세히 적어 주세요"
                minLength={10}
                maxLength={2000}
                rows={6}
                required
              />
            </label>
            <div className="setting-support-page__form-footer">
              <span>{form.message.length}/2000</span>
              <button type="submit">문의 등록</button>
            </div>
            {notice && (
              <p
                className={`setting-support-page__notice setting-support-page__notice--${notice.type}`}
                role="status"
              >
                {notice.text}
              </p>
            )}
          </form>
        </SettingDialog>
      )}
    </div>
  );
}

export default SettingSupportPage;
