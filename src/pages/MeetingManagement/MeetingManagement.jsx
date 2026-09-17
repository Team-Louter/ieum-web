import MeetingInputBox from "../../components/MeetingMake/MeetingInputBox";
import MeetingMakeOption from "../../components/MeetingMake/MeetingMakeOption";
import MeetingMakeOptionSelect from "../../components/MeetingMake/MeetingMakeOptionSelect";
import MeetingMyMemberProfile from "../../components/MeetingMy/MeetingMyMemberProfile";
import "./MeetingManagement.css";

export default function MeetingManagement() {
  const managers = [
    { id: "아이디", role: "개설자" },
    { id: "아이디", role: "관리자" },
    { id: "아이디", role: "관리자" },
  ];

  return (
    <div className="meeting-management">
      <MeetingInputBox />
      <div className="meeting-management-options">
        <MeetingMakeOption
          title="가입 승인 설정"
          desc="가입 시 관리자가 가입 승인을 해야 모임 가입이 완료 되는 설정입니다"
        />
        <MeetingMakeOption
          title="모임 비공개 설정"
          desc="모임이 비공개로 전환되고 초대 링크로만 초대가 가능합니다."
        />
        <MeetingMakeOptionSelect
          option1="개설자"
          option2="관리자 이상"
          option3="모든 회원"
          title="초대 링크 생성 설정"
          desc="모임 초대 링크 생성 권한을 설정합니다."
        />
        <MeetingMakeOptionSelect
          option1="1일"
          option2="7일"
          option3="기한 없음"
          title="초대 링크 기한 기본 설정"
          desc="초대 링크의 사용 기한을 설정합니다."
        />
      </div>
      <div className="meeting-management-divider" />
      <section className="meeting-management-managers">
        <h2>관리자 ({managers.length}명)</h2>
        <div className="meeting-management-manager-list">
          {managers.map((manager, index) => (
            <MeetingMyMemberProfile
              key={`${manager.id}-${manager.role}-${index}`}
              id={manager.id}
              role={manager.role}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
