import './MeetingCreatePage.css';
import { useState } from 'react';
import MeetingInputBox from '../../../components/meeting/MeetingMake/MeetingInputBox';
import MeetingMakeOption from '../../../components/meeting/MeetingMake/MeetingMakeOption';
import Layout from '../../../components/common/Layout/Layout';
import PageTabNavigation from '../../../components/common/PageTabNavigation/PageTabNavigation';

const defaultMeetingValues = {
  title: '',
  description: '',
  region: '',
  image: null,
  requireApproval: false,
  isPrivate: false,
};

export default function MeetingCreatePage({ initialValues = {}, onSubmit }) {
  const [values, setValues] = useState(() => ({ ...defaultMeetingValues, ...initialValues }));
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/meeting';
  const menuItems = [
    { label: '모임 보기', href: '/meeting', isActive: currentPath === '/meeting' },
    { label: '내 모임', href: '/meeting/my', isActive: currentPath.startsWith('/meeting/my') },
    { label: '모임 만들기', href: '/meeting/make', isActive: currentPath === '/meeting/make' },
  ];

  function updateValue(name, value) {
    setValues((currentValues) => ({ ...currentValues, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      await onSubmit?.(values);
    } catch (error) {
      setSubmitError(error?.message ?? '모임을 만들지 못했습니다.');
    } finally { setSubmitting(false); }
  }

  return (
    <Layout>
      <PageTabNavigation ariaLabel="모임 메뉴" isFixed items={menuItems} />
      <form className="meeting-make-layout" onSubmit={handleSubmit}>
        <MeetingInputBox values={values} onChange={updateValue} />
        <div className="meeting-make-option-list">
          <MeetingMakeOption
            name="requireApproval"
            checked={values.requireApproval}
            onChange={(checked) => updateValue('requireApproval', checked)}
            title="가입 승인 설정"
            desc="가입 시 관리자가 가입 승인을 해야 모임 가입이 완료 되는 설정입니다"
          />
          <MeetingMakeOption
            name="isPrivate"
            checked={values.isPrivate}
            onChange={(checked) => updateValue('isPrivate', checked)}
            title="모임 비공개 설정"
            desc="모임이 비공개로 전환되고 초대 링크로만 초대가 가능합니다."
          />
        </div>
        <button className="meeting-make-button" type="submit" disabled={submitting}>
          모임 만들기
        </button>
        {submitError && (
          <p className="meeting-make-error" role="alert">
            {submitError}
          </p>
        )}
      </form>
    </Layout>
  );
}
