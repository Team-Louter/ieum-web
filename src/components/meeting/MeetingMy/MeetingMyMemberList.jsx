import { useState } from 'react';
import MeetingMyMemberProfile from './MeetingMyMemberProfile';
import MeetingMyMemberTitle from './MeetingMyMemberTitle';
import { getMemberRole } from '../../../utils/meetingRoles';
import Skeleton from '../../common/Skeleton/Skeleton';
import EmptyState from '../../common/EmptyState/EmptyState';
import ConfirmationModal from '../../common/ConfirmationModal/ConfirmationModal';
import './MeetingMyMemberList.css';

export default function MeetingMyMemberList({
  members = [],
  maxVisible,
  onMemberAction,
  canManage = false,
  isOwner = false,
  ownerId,
  ownerLoginId,
  title,
  meetingId,
  onMore,
  currentUserId,
  isLoading = false,
  apiError = '',
}) {
  const [openMemberIndex, setOpenMemberIndex] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [transferTarget, setTransferTarget] = useState(null);
  const [removeTarget, setRemoveTarget] = useState(null);
  const [roleTarget, setRoleTarget] = useState(null);
  const pageSize = maxVisible ?? 24;
  const totalPages = maxVisible ? 1 : Math.ceil(members.length / pageSize);
  const firstMemberIndex = (currentPage - 1) * pageSize;
  const visibleMembers = maxVisible
    ? members.slice(0, maxVisible)
    : members.slice(firstMemberIndex, firstMemberIndex + pageSize);

  function moveToPage(page) {
    setCurrentPage(page);
    setOpenMemberIndex(null);
  }

  return (
    <div className="member-list-container">
      <MeetingMyMemberTitle
        HowManyUser={members.length}
        title={title}
        meetingId={meetingId}
        onMore={onMore}
        showMore={Boolean(maxVisible || onMore)}
      />
      <div className="member-list">
        {visibleMembers.length > 0 ? (
          visibleMembers.map((member, memberIndex) => (
            <MeetingMemberItem
              key={member.id ?? `${firstMemberIndex + memberIndex}`}
              member={member}
              currentUserId={currentUserId}
              canManage={canManage}
              isOwner={isOwner}
              ownerId={ownerId}
              ownerLoginId={ownerLoginId}
              isMenuOpen={openMemberIndex === memberIndex}
              onToggle={() =>
                setOpenMemberIndex((openIndex) => (openIndex === memberIndex ? null : memberIndex))
              }
              onMemberAction={(member, action) =>
                action === '모임장 넘기기'
                  ? setTransferTarget(member)
                  : action === '추방하기'
                    ? setRemoveTarget(member)
                    : action === '관리자 임명' || action === '관리자 해제'
                      ? setRoleTarget({ member, action })
                      : onMemberAction?.(member, action)
              }
            />
          ))
        ) : isLoading && !apiError ? (
          // 회원을 불러오는 동안 빈 칸 대신 프로필 모양의 스켈레톤을 보여줍니다.
          Array.from({ length: 3 }, (_, index) => (
            <div
              key={index}
              aria-hidden="true"
              style={{ display: 'flex', alignItems: 'center', gap: 10, width: 220, height: 82, padding: '16px 20px', boxSizing: 'border-box' }}
            >
              <Skeleton circle width={50} height={50} />
              <Skeleton text width={90} />
            </div>
          ))
        ) : !apiError ? (
          <EmptyState
            compact
            className="member-list__empty"
            title="모임 회원을 모아보세요"
            description="모임 회원이 표시되면 이곳에서 확인할 수 있어요."
          />
        ) : null}
      </div>
      {removeTarget && (
        <ConfirmationModal
          title="회원 추방"
          message={`${removeTarget.nickname ?? '이 회원'}님을 모임에서 추방하시겠습니까?`}
          confirmLabel="추방하기"
          cancelLabel="취소"
          onCancel={() => setRemoveTarget(null)}
          onConfirm={() => {
            onMemberAction?.(removeTarget, '추방하기');
            setRemoveTarget(null);
          }}
        />
      )}
      {roleTarget && (
        <ConfirmationModal
          title={roleTarget.action}
          message={
            roleTarget.action === '관리자 임명'
              ? `${roleTarget.member.nickname ?? '이 회원'}님을 관리자로 임명할까요?`
              : `${roleTarget.member.nickname ?? '이 회원'}님의 관리자 권한을 해제할까요?`
          }
          confirmLabel={roleTarget.action === '관리자 임명' ? '임명' : '해제'}
          cancelLabel="취소"
          danger={roleTarget.action !== '관리자 임명'}
          onCancel={() => setRoleTarget(null)}
          onConfirm={() => {
            onMemberAction?.(roleTarget.member, roleTarget.action);
            setRoleTarget(null);
          }}
        />
      )}
      {transferTarget && (
        <ConfirmationModal
          title="모임장 넘기기"
          message={`${transferTarget.nickname ?? '이 회원'}님에게 모임장을 넘길까요? 나는 일반 회원이 돼요.`}
          confirmLabel="넘기기"
          cancelLabel="취소"
          danger={false}
          onCancel={() => setTransferTarget(null)}
          onConfirm={() => {
            onMemberAction?.(transferTarget, '모임장 넘기기');
            setTransferTarget(null);
          }}
        />
      )}
      {totalPages > 1 && (
        <nav className="member-pagination" aria-label="회원 목록 페이지 이동">
          <button
            type="button"
            className="member-pagination-button member-pagination-arrow"
            onClick={() => moveToPage(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="이전 페이지"
          >
            &lt;
          </button>
          {Array.from({ length: totalPages }, (_, pageIndex) => {
            const page = pageIndex + 1;

            return (
              <button
                key={page}
                type="button"
                className={`member-pagination-button${currentPage === page ? ' is-active' : ''}`}
                onClick={() => moveToPage(page)}
                aria-current={currentPage === page ? 'page' : undefined}
              >
                {page}
              </button>
            );
          })}
          <button
            type="button"
            className="member-pagination-button member-pagination-arrow"
            onClick={() => moveToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="다음 페이지"
          >
            &gt;
          </button>
        </nav>
      )}
    </div>
  );
}

function MeetingMemberItem({
  member,
  currentUserId,
  canManage,
  isOwner,
  ownerId,
  ownerLoginId,
  isMenuOpen,
  onToggle,
  onMemberAction,
}) {
  const status = String(member.status ?? '').toUpperCase();
  const memberRole = getMemberRole(member, { ownerId, ownerLoginId });
  const isMemberOwner = memberRole === 'OWNER';
  const isManager = memberRole === 'MANAGER';

  return (
    <MeetingMyMemberProfile
      id={member.nickname ?? member.name ?? ''}
      role={isMemberOwner ? '모임장' : isManager ? '관리자' : '회원'}
      profile_image={member.profileImage ?? member.profile_image ?? member.profileImageUrl}
      isMenuOpen={isMenuOpen}
      onToggle={onToggle}
      interactive={
        canManage &&
        !isMemberOwner &&
        String(member.userId ?? member.id) !== String(currentUserId) &&
        (isOwner || !isManager)
      }
      dangerActionItems={['관리자 해제', '추방하기']}
      actionItems={
        // 관리자 임명·해제와 모임장 넘기기는 모임장만, 가입 승인과 추방은 관리자도 할 수 있습니다.
        isManager
          ? ['모임장 넘기기', '관리자 해제', '추방하기']
          : status === 'PENDING'
            ? ['가입 승인', ...(isOwner ? ['관리자 임명'] : []), '추방하기']
            : [...(isOwner ? ['관리자 임명', '모임장 넘기기'] : []), '추방하기']
      }
      onAction={(action) => onMemberAction?.(member, action)}
    />
  );
}
