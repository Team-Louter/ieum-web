import { useState } from 'react';
import MeetingMyMemberProfile from './MeetingMyMemberProfile';
import MeetingMyMemberTitle from './MeetingMyMemberTitle';
import './MeetingMyMemberList.css';

export default function MeetingMyMemberList({
  members = [],
  maxVisible,
  onMemberAction,
  canManage = false,
  meetingId,
  onMore,
  currentUserId,
}) {
  const [openMemberIndex, setOpenMemberIndex] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
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
        {visibleMembers.map((member, memberIndex) => (
          <MeetingMemberItem
            key={member.id ?? `${firstMemberIndex + memberIndex}`}
            member={member}
            currentUserId={currentUserId}
            canManage={canManage}
            isMenuOpen={openMemberIndex === memberIndex}
            onToggle={() =>
              setOpenMemberIndex((openIndex) => (openIndex === memberIndex ? null : memberIndex))
            }
            onMemberAction={onMemberAction}
          />
        ))}
      </div>
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
          ? ['관리자 해제', '추방하기']
          : status === 'PENDING'
            ? ['가입 승인', '관리자 임명', '추방하기']
            : ['관리자 임명', '추방하기']
      }
      onAction={(action) => onMemberAction?.(member, action)}
    />
  );
}
