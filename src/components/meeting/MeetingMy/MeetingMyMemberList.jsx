import { useState } from "react";
import MeetingMyMemberProfile from "./MeetingMyMemberProfile";
import MeetingMyMemberTitle from "./MeetingMyMemberTitle";
import './MeetingMyMemberList.css';

export default function MeetingMyMemberList({ maxVisible }) {
  const [openMemberIndex, setOpenMemberIndex] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const members = Array.from({ length: 30
   }, (_, memberIndex) => ({
    id: '아이디',
    role: memberIndex === 0 ? '회장' : memberIndex < 3 ? '관리자' : '회원',
  }));
  const pageSize = maxVisible ?? 24;
  const totalPages = maxVisible ? 1 : Math.ceil(members.length / pageSize);
  const firstMemberIndex = (currentPage - 1) * pageSize;
  const visibleMembers = members.slice(firstMemberIndex, firstMemberIndex + pageSize);

  function moveToPage(page) {
    setCurrentPage(page);
    setOpenMemberIndex(null);
  }

  return (
    <div className="member-list-container">
      <MeetingMyMemberTitle HowManyUser={members.length}/>
      <div className="member-list">
        {visibleMembers.map((member, memberIndex) => (
          <MeetingMyMemberProfile
            key={`${member.id}-${firstMemberIndex + memberIndex}`}
            id={member.id}
            role={member.role}
            isMenuOpen={openMemberIndex === memberIndex}
            onToggle={() => setOpenMemberIndex((openIndex) => (
              openIndex === memberIndex ? null : memberIndex
            ))}
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
  )
}