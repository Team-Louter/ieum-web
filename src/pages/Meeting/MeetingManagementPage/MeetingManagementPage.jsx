import { useEffect, useState } from 'react';
import MeetingInputBox from '../../../components/meeting/MeetingMake/MeetingInputBox';
import MeetingMakeOption from '../../../components/meeting/MeetingMake/MeetingMakeOption';
import MeetingMyMemberList from '../../../components/meeting/MeetingMy/MeetingMyMemberList';
import { splitMembers } from '../../../utils/meetingRequests';
import { getMemberRole } from '../../../utils/meetingRoles';
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
  isLoading = false,
  apiError = '',
}) {
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/meeting';
  const menuItems = [
    { label: '모임 보기', href: '/meeting', isActive: currentPath === '/meeting' },
    { label: '내 모임', href: '/meeting/my', isActive: currentPath.startsWith('/meeting/my') || currentPath.startsWith('/meeting/management') },
    { label: '모임 만들기', href: '/meeting/make', isActive: currentPath === '/meeting/make' },
  ];
  const [meetingValues, setMeetingValues] = useState(() => getMeetingFormValues(meeting));
  const [submitError, setSubmitError] = useState('');
  const canManage =
    membership?.canManage ??
    meeting.canManage ??
    Boolean(
      (currentUserId != null && String(meeting.ownerId) === String(currentUserId)) ||
        (currentLoginId && meeting.owner === currentLoginId),
    );

  // 모임장 여부: 서버가 알려 준 등급, 모임장 번호, 모임장 아이디 중 하나라도 맞으면 모임장입니다.
  const isOwner =
    ['OWNER', 'ROLE_OWNER'].includes(String(membership?.role ?? meeting.role ?? '').toUpperCase()) ||
    (currentUserId != null && String(meeting.ownerId) === String(currentUserId)) ||
    Boolean(currentLoginId && meeting.owner === currentLoginId);

  // 승인을 기다리는 사람은 내 모임의 더보기에서 보고, 회원 목록에는 가입을 마친 사람만 보여줍니다.
  const { joinedMembers } = splitMembers(members);
  // 관리하기 화면에는 모임장과 관리자만 보여줍니다. 일반 회원은 '내 모임'의 회원 더보기에서 봅니다.
  const staffMembers = joinedMembers.filter(
    (member) =>
      getMemberRole(member, { ownerId: meeting.ownerId, ownerLoginId: meeting.owner }) !== 'MEMBER',
  );

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
        <section className="meeting-management-members">
          <MeetingMyMemberList
            members={staffMembers}
            title="모임장·관리자"
            meetingId={meeting.id}
            canManage={Boolean(canManage)}
            isOwner={isOwner}
            ownerId={meeting.ownerId}
            ownerLoginId={meeting.owner}
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
