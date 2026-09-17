import MeetingMyMemberProfile from "./MeetingMyMemberProfile";
import MeetingMyMemberTitle from "./MeetingMyMemberTitle";
import './MeetingMyMemberList.css';

export default function MeetingMyMemberList({ maxVisible }) {
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
          />
        ))}
      </div>
    </div>
  )
}