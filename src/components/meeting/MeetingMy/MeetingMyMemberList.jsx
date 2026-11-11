import { useState } from 'react';
import MeetingMyMemberProfile from './MeetingMyMemberProfile';
import MeetingMyMemberTitle from './MeetingMyMemberTitle';
import EmptyState from '../../common/EmptyState/EmptyState';
import ConfirmationModal from '../../common/ConfirmationModal/ConfirmationModal';
import './MeetingMyMemberList.css';

export default function MeetingMyMemberList({
  members = [],
  maxVisible,
  onMemberAction,
  canManage = false,
  isOwner = false,
  meetingId,
  onMore,
  currentUserId,
  isLoading = false,
  apiError = '',
}) {
  const [openMemberIndex, setOpenMemberIndex] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [transferTarget, setTransferTarget] = useState(null);
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
              isMenuOpen={openMemberIndex === memberIndex}
              onToggle={() =>
                setOpenMemberIndex((openIndex) => (openIndex === memberIndex ? null : memberIndex))
              }
              onMemberAction={(member, action) =>
                action === '모임장 넘기기'
                  ? setTransferTarget(member)
                  : onMemberAction?.(member, action)
              }
            />
          ))
        ) : !isLoading && !apiError ? (
          <EmptyState
            compact
            className="member-list__empty"
            title="아직 모임 회원이 없어요"
            description="모임 회원이 표시되면 이곳에서 확인할 수 있어요."
          />
        ) : null}
      </div>
      {transferTarget && (
        <ConfirmationModal
          message={`${transferTarget.loginId ?? transferTarget.nickname ?? '이 회원'}님에게 모임장을 넘길까요? 나는 일반 회원이 돼요.`}
          confirmLabel="넘기기"
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
  isMenuOpen,
  onToggle,
  onMemberAction,
}) {
  const status = String(member.status ?? '').toUpperCase();
  const isManager = String(member.role ?? '').toUpperCase() === 'MANAGER';

  return (
    <MeetingMyMemberProfile
      id={member.loginId ?? member.nickname ?? member.name ?? member.id ?? ''}
      role={isManager ? '관리자' : '회원'}
      profile_image={member.profileImage ?? member.profile_image ?? member.profileImageUrl}
      isMenuOpen={isMenuOpen}
      onToggle={onToggle}
      interactive={canManage && String(member.userId ?? member.id) !== String(currentUserId)}
      actionItems={
        isManager
          ? ['관리자 해제', ...(isOwner ? ['모임장 넘기기'] : []), '추방하기']
          : status === 'PENDING'
            ? ['가입 승인', '관리자 임명', '추방하기']
            : ['관리자 임명', ...(isOwner ? ['모임장 넘기기'] : []), '추방하기']
      }
      onAction={(action) => onMemberAction?.(member, action)}
    />
  );
}
