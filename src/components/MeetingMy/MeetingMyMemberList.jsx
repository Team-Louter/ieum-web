import { useState } from "react";
import MeetingMyMemberProfile from "./MeetingMyMemberProfile";
import MeetingMyMemberTitle from "./MeetingMyMemberTitle";
import './MeetingMyMemberList.css';

export default function MeetingMyMemberList({ maxVisible }) {
  const [openMemberIndex, setOpenMemberIndex] = useState(null);
  const members = [
    { id: "아이디", role: "회원" },
    { id: "아이디", role: "회원" },
    { id: "아이디", role: "회원" },
    { id: "아이디", role: "회원" },
    { id: "아이디", role: "회원" },
    { id: "아이디", role: "회원" },
    { id: "아이디", role: "회원" },
  ];
  const visibleMembers = maxVisible ? members.slice(0, maxVisible) : members;

  return (
    <div className="member-list-container">
      <MeetingMyMemberTitle HowManyUser={members.length}/>
      <div className="member-list">
        {visibleMembers.map((member, index) => (
          <MeetingMyMemberProfile
            key={`${member.id}-${index}`}
            id={member.id}
            role={member.role}
            isMenuOpen={openMemberIndex === index}
            onToggle={() => setOpenMemberIndex((openIndex) => (
              openIndex === index ? null : index
            ))}
          />
        ))}
      </div>
    </div>
  )
}