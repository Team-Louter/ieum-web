import MeetingMyAnnouncement from '../../../components/meeting/MeetingMy/MeetingMyAnnouncement';
import mulchongsae from '../../../assets/images/meeting-cover.jpg';
import dotSetting from '../../../assets/dot_setting.svg';
import './MeetingMyPage.css';
import MeetingKebabMenu from '../../../components/meeting/MeetingKebabMenu/MeetingKebabMenu';
import MeetingMyMemberList from '../../../components/meeting/MeetingMy/MeetingMyMemberList';


export default function MeetingMyPage() {

  return (
    <div className="contents-layout">
      <div className="meeting-my-card">
        <div className="meeting-my-contents">
          <img className="meeting-card-img" src={mulchongsae} alt="예시 이미지"/>
          <div className="meeting-card-info">
            <p className="meeting-card-info-title">모임 이름</p>
            <p className="meeting-card-info-desc">모임 소개</p>
            <p className="meeting-card-info-meta">모임 지역 • 회원수</p>
          </div>
        </div>
        <MeetingKebabMenu image={dotSetting} />
      </div>
      <div className="contents-horizen"></div>
      <MeetingMyAnnouncement/>
      <div className="contents-horizen"></div>
      <MeetingMyMemberList maxVisible={6}/>
    </div>
  )
}
