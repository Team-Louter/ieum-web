import { useState } from 'react';
import './MeetingAnnouncementCreatePage.css';
import Button from '../../../components/common/Button/Button';
import Layout from '../../../components/common/Layout/Layout';
import PageTabNavigation from '../../../components/common/PageTabNavigation/PageTabNavigation';
import useSubmitOnce from '../../../hooks/useSubmitOnce';

export default function MeetingAnnouncementCreatePage({ initialValues = {}, onSubmit }) {
  const [values, setValues] = useState(() => ({
    title: initialValues.title ?? '',
    content: initialValues.content ?? '',
  }));
  const [submitError, setSubmitError] = useState('');
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/meeting';
  const menuItems = [
    { label: '모임 보기', href: '/meeting', isActive: currentPath === '/meeting' },
    { label: '내 모임', href: '/meeting/my', isActive: currentPath.startsWith('/meeting/my') || currentPath.startsWith('/meeting/management') },
    { label: '모임 만들기', href: '/meeting/make', isActive: currentPath === '/meeting/make' },
  ];

  const [handleSubmit, isSubmitting] = useSubmitOnce(submitForm);

  async function submitForm(event) {
    event.preventDefault();
    setSubmitError('');
    try {
      await onSubmit?.(values);
    } catch (error) {
      setSubmitError(error?.message ?? '공지사항을 올리지 못했습니다.');
    }
  }

  return (
    <Layout>
      <PageTabNavigation ariaLabel="모임 메뉴" isFixed items={menuItems} />
      <form className="announcement-make" onSubmit={handleSubmit}>
        <input
          className="announcement-make-title"
          type="text"
          placeholder="공지 제목을 입력해 주세요"
          aria-label="공지 제목"
          required
          value={values.title}
          onChange={(event) =>
            setValues((currentValues) => ({ ...currentValues, title: event.target.value }))
          }
        />
        <textarea
          className="announcement-make-content"
          placeholder="공지 내용을 입력해 주세요"
          aria-label="공지 내용"
          required
          value={values.content}
          onChange={(event) =>
            setValues((currentValues) => ({ ...currentValues, content: event.target.value }))
          }
        />
        <Button className="announcement-make-submit" type="submit" loading={isSubmitting} loadingText="공지사항 올리는 중">
          공지사항 올리기
        </Button>
        {submitError && <p role="alert">{submitError}</p>}
      </form>
    </Layout>
  );
}
