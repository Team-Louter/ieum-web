import { useCallback, useEffect, useState } from 'react';
import SettingItem from '../../../components/setting/SettingItem/SettingItem';
import Skeleton from '../../../components/common/Skeleton/Skeleton';
import SettingDialog from '../../../components/setting/SettingDialog/SettingDialog';
import EmptyState from '../../../components/common/EmptyState/EmptyState';
import { profileApi, supportApi } from '../../../api/client';
import { formatKoreanDateTime } from '../../../utils/dateTime';
import './SettingSupportPage.css';

const INQUIRY_CATEGORIES = ['계정', '복약', '보호자 연결', '친구·모임', '오류 신고', '기타'];
const statusLabels = { RECEIVED: '접수 완료', ANSWERED: '답변 완료' };

// 서버에서 FAQ를 불러오지 못했을 때만 보여 주는 기본 질문입니다.
const defaultQuestions = [
  {
    question: '비밀번호를 잊어버렸어요.',
    answer:
      '내 계정 메뉴에서 비밀번호 변경을 누른 뒤, 가입 이메일로 인증 코드를 받아 새 비밀번호를 설정할 수 있습니다.',
  },
  {
    question: '보호자와 어르신 계정은 어떻게 연결하나요?',
    answer:
      '어르신 계정의 보호자 설정에서 보호자의 가입 이메일로 연결 요청을 보냅니다. 보호자가 요청을 수락해야 연결되며, 연결 해제도 같은 화면에서 할 수 있습니다.',
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

function SettingSupportPage({ accountEmail = '' }) {
  const [inquiries, setInquiries] = useState([]);
  const [listState, setListState] = useState('loading');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [defaultEmail, setDefaultEmail] = useState(accountEmail);
  const [category, setCategory] = useState(INQUIRY_CATEGORIES[0]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [replyEmail, setReplyEmail] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [questions, setQuestions] = useState(defaultQuestions);

  // FAQ는 관리자가 등록한 내용을 보여 줍니다.
  useEffect(() => {
    let isActive = true;
    supportApi
      .faqs()
      .then((response) => {
        const list = Array.isArray(response) ? response : response?.items;
        if (isActive && Array.isArray(list) && list.length > 0) setQuestions(list);
      })
      .catch(() => {});
    return () => {
      isActive = false;
    };
  }, []);

  const loadInquiries = useCallback(async () => {
    try {
      const response = await supportApi.list();
      setInquiries(Array.isArray(response) ? response : []);
      setListState('ready');
    } catch {
      setListState('error');
    }
  }, []);

  useEffect(() => {
    loadInquiries();
  }, [loadInquiries]);

  // 답장 받을 이메일은 내 프로필의 이메일을 기본값으로 씁니다.
  useEffect(() => {
    if (accountEmail) return undefined;
    let isActive = true;
    profileApi
      .get()
      .then((profile) => {
        if (isActive && profile?.email) setDefaultEmail(profile.email);
      })
      .catch(() => {});
    return () => {
      isActive = false;
    };
  }, [accountEmail]);

  function openDialog() {
    setReplyEmail(defaultEmail);
    setFormMessage('');
    setIsDialogOpen(true);
  }

  async function submitInquiry(event) {
    event.preventDefault();
    if (!subject.trim() || !message.trim() || !replyEmail.trim()) {
      setFormMessage('제목, 내용, 답장 받을 이메일을 모두 입력해 주세요.');
      return;
    }

    setBusy(true);
    try {
      await supportApi.submit({
        category,
        subject: subject.trim(),
        message: message.trim(),
        replyEmail: replyEmail.trim(),
      });
      setIsDialogOpen(false);
      setSubject('');
      setMessage('');
      setNotice('문의가 접수되었습니다. 입력한 이메일로 답장드릴게요.');
      await loadInquiries();
    } catch (error) {
      setFormMessage(error?.message ?? '문의를 접수하지 못했습니다.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="setting-page-section setting-support-page">
      <SettingItem
        title="자주 묻는 질문"
        description="이음 사용 중 자주 찾는 도움말입니다."
        className="setting-support-page__card"
      >
        <div className="setting-support-page__questions">
          {questions.map(({ id, question, answer }) => (
            <details key={id ?? question} className="setting-support-page__question">
              <summary>{question}</summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </SettingItem>

      <SettingItem
        title="문의하기"
        description="궁금한 점이나 불편한 점을 남겨 주세요."
        actionLabel="문의 작성"
        onAction={openDialog}
        className="setting-support-page__card"
      >
        {notice && <p role="status">{notice}</p>}
      </SettingItem>

      <SettingItem
        title="내 문의 내역"
        description="접수한 문의를 확인할 수 있습니다."
        actionLabel="내역 보기"
        onAction={() => setIsHistoryOpen(true)}
        className="setting-support-page__card"
      />

      {isHistoryOpen && (
        <SettingDialog
          title="내 문의 내역"
          description="접수한 문의를 확인할 수 있습니다."
          className="setting-support-page__inquiry-dialog"
          onClose={() => setIsHistoryOpen(false)}
        >
        {listState === 'loading' ? (
        <ul className="setting-support-page__inquiries" role="status" aria-busy="true" aria-label="문의 내역을 불러오는 중입니다.">
          {[0, 1].map((row) => (
            <li key={row}>
              <Skeleton text width="55%" height="18px" />
              <Skeleton text width="90%" height="14px" />
              <Skeleton text width="35%" height="12px" />
            </li>
          ))}
        </ul>
      ) : listState === 'error' ? (
        <p role="alert">문의 내역을 불러오지 못했습니다.</p>
      ) : listState === 'ready' && inquiries.length === 0 ? (
        <EmptyState
          compact
          title="궁금한 점을 문의해보세요"
          description="문의를 남기면 이곳에서 접수 내역을 확인할 수 있어요."
        />
      ) : (
        <ul className="setting-support-page__inquiries">
          {inquiries.map((inquiry) => (
            <li key={inquiry.id}>
              <div>
                <strong>{inquiry.subject}</strong>
                <span>{statusLabels[inquiry.status] ?? inquiry.status}</span>
              </div>
              <p>{inquiry.message}</p>
              {inquiry.reply && (
                <div className="setting-support-page__reply">
                  <strong>답변</strong>
                  <p>{inquiry.reply}</p>
                  {inquiry.repliedAt && <small>{formatKoreanDateTime(inquiry.repliedAt)}</small>}
                </div>
              )}
              <small>
                {inquiry.category} · {formatKoreanDateTime(inquiry.createdAt)}
              </small>
            </li>
          ))}
        </ul>
      )}
        </SettingDialog>
      )}

      {isDialogOpen && (
        <SettingDialog
          title="문의 작성"
          description="접수되면 입력한 이메일로 답장드립니다."
          className="setting-dialog--support-inquiry"
          onClose={() => setIsDialogOpen(false)}
        >
          <form className="setting-dialog__form" onSubmit={submitInquiry}>
            <label className="setting-dialog__field">
              문의 종류
              <select value={category} onChange={(event) => setCategory(event.target.value)}>
                {INQUIRY_CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="setting-dialog__field">
              제목
              <input
                value={subject}
                maxLength={150}
                onChange={(event) => setSubject(event.target.value)}
              />
            </label>
            <label className="setting-dialog__field">
              내용
              <textarea
                value={message}
                rows={6}
                maxLength={5000}
                onChange={(event) => setMessage(event.target.value)}
              />
            </label>
            <label className="setting-dialog__field">
              답장 받을 이메일
              <input
                type="email"
                value={replyEmail}
                maxLength={254}
                onChange={(event) => setReplyEmail(event.target.value)}
              />
            </label>
            {formMessage && <p role="alert">{formMessage}</p>}
            <div className="setting-dialog__actions">
              <button
                type="submit"
                className="setting-dialog__button setting-dialog__button--primary"
                disabled={busy}
              >
                {busy ? '접수 중' : '문의 접수'}
              </button>
              <button
                type="button"
                className="setting-dialog__button"
                onClick={() => setIsDialogOpen(false)}
              >
                취소
              </button>
            </div>
          </form>
        </SettingDialog>
      )}
    </div>
  );
}

export default SettingSupportPage;
