import { useEffect, useState } from 'react';
import MeetingInputBox from '../../../components/meeting/MeetingMake/MeetingInputBox';
import MeetingMakeOption from '../../../components/meeting/MeetingMake/MeetingMakeOption';
import MeetingMyMemberList from '../../../components/meeting/MeetingMy/MeetingMyMemberList';
import Button from '../../../components/common/Button/Button';
import PageTabNavigation from '../../../components/common/PageTabNavigation/PageTabNavigation';
import './MeetingManagementPage.css';
import Layout from '../../../components/common/Layout/Layout';

function getMeetingFormValues(meeting = {}) {
  return {
    title: meeting.title ?? meeting.name ?? '',
    description: meeting.description ?? '',
    region: meeting.region ?? '',
    image: meeting.image ?? meeting.imageUrl ?? null,
    requireApproval: meeting.approvalRequired ?? meeting.requireApproval ?? false,
    isPrivate: meeting.private ?? meeting.isPrivate ?? false,
  };
}

export default function MeetingManagementPage({
  meeting = {},
  membership,
  members = [],
  currentLoginId,
  currentUserId,
  onSubmit,
  onMemberAction,
  onInviteCreate,
  isLoading = false,
  apiError = '',
}) {
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/meeting';
  const menuItems = [
    { label: '모임 보기', href: '/meeting', isActive: currentPath === '/meeting' },
    { label: '내 모임', href: '/meeting/my', isActive: currentPath.startsWith('/meeting/my') },
    { label: '모임 만들기', href: '/meeting/make', isActive: currentPath === '/meeting/make' },
  ];
  const [meetingValues, setMeetingValues] = useState(() => getMeetingFormValues(meeting));
  const [submitError, setSubmitError] = useState('');
  const [invite, setInvite] = useState(null);
  const [inviteMessage, setInviteMessage] = useState('');
  const canManage =
    membership?.canManage ??
    meeting.canManage ??
    Boolean(
      (currentUserId != null && String(meeting.ownerId) === String(currentUserId)) ||
        (currentLoginId && meeting.owner === currentLoginId),
    );

  const isOwner = String(membership?.role ?? '').toUpperCase() === 'OWNER';

  // 초대 링크 만들기 (임시 화면): 코드와 링크, 만료 시각을 보여주고 복사할 수 있게 합니다.
  async function handleInviteCreate() {
    setInviteMessage('');
    try {
      const created = await onInviteCreate?.();
      setInvite(created ?? null);
    } catch (error) {
      setInviteMessage(error?.message ?? '초대 링크를 만들지 못했습니다.');
    }
  }

  async function handleInviteCopy() {
    const text = invite?.url ?? invite?.code ?? '';
    try {
      await navigator.clipboard.writeText(text);
      setInviteMessage('복사했습니다.');
    } catch {
      setInviteMessage('복사하지 못했습니다. 직접 선택해서 복사해 주세요.');
    }
  }

  useEffect(() => {
    setMeetingValues(getMeetingFormValues(meeting));
  }, [meeting]);

  function updateMeetingValue(name, value) {
    setMeetingValues((currentValues) => ({ ...currentValues, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError('');

    try {
      await onSubmit?.(meetingValues);
    } catch (error) {
      setSubmitError(error?.message ?? '모임 정보를 수정하지 못했습니다.');
    }
  }

  return (
    <Layout>
      <PageTabNavigation ariaLabel="모임 메뉴" isFixed items={menuItems} />
      <div className="meeting-management">
        <form className="meeting-management-form" onSubmit={handleSubmit}>
          <MeetingInputBox values={meetingValues} onChange={updateMeetingValue} />
          <div className="meeting-management-options">
            <MeetingMakeOption
              name="requireApproval"
              checked={meetingValues.requireApproval}
              onChange={(checked) => updateMeetingValue('requireApproval', checked)}
              title="가입 승인 설정"
              desc="가입 신청을 관리자가 승인한 뒤 모임에 참여할 수 있습니다."
            />
            <MeetingMakeOption
              name="isPrivate"
              checked={meetingValues.isPrivate}
              onChange={(checked) => updateMeetingValue('isPrivate', checked)}
              title="모임 비공개 설정"
              desc="비공개 모임은 목록에 공개되지 않습니다."
            />
          </div>
          <Button className="meeting-management-save" type="submit" disabled={!canManage}>
            변경 사항 저장
          </Button>
          {!canManage && (
            <p className="meeting-management-message" role="status">
              모임 관리자만 정보를 수정할 수 있습니다.
            </p>
          )}
          {submitError && (
            <p className="meeting-management-error" role="alert">
              {submitError}
            </p>
          )}
        </form>

        <div className="meeting-management-divider" />
        {canManage && (
          <section className="meeting-management-invite" aria-label="모임 초대">
            <button type="button" className="meeting-management-invite__button" onClick={handleInviteCreate}>
              초대 링크 만들기
            </button>
            {invite && (
              <div className="meeting-management-invite__result">
                <p>초대 코드: <strong>{invite.code}</strong></p>
                {invite.url && <p className="meeting-management-invite__url">{invite.url}</p>}
                {invite.expiresAt && (
                  <p>유효 기간: {new Date(invite.expiresAt).toLocaleString('ko-KR')}까지 (7일)</p>
                )}
                <button type="button" className="meeting-management-invite__button" onClick={handleInviteCopy}>
                  복사하기
                </button>
              </div>
            )}
            {inviteMessage && <p role="status">{inviteMessage}</p>}
          </section>
        )}
        <section className="meeting-management-members">
          <MeetingMyMemberList
            members={members}
            meetingId={meeting.id}
            canManage={Boolean(canManage)}
            isOwner={isOwner}
            currentUserId={currentUserId}
            onMemberAction={onMemberAction}
            isLoading={isLoading}
            apiError={apiError}
          />
        </section>
      </div>
    </Layout>
  );
}
