import './Sidebar.css';
import profileImg from '../../../assets/images/profile.png';
import neighborIcon from '../../../assets/images/neighbor.svg';
import marketIcon from '../../../assets/images/market.svg';
import meetingIcon from '../../../assets/images/meeting.svg';
import addfriendIcon from '../../../assets/images/addfriend.svg';
import mapfriendIcon from '../../../assets/images/mapfriend.svg';
import chattingIcon from '../../../assets/images/chatting.svg';
import settingIcon from '../../../assets/images/setting.svg';

function Sidebar() {
  return (
    <aside id="sidebar">
      <a href="#" id="sidebar-profile-container">
        <img src={profileImg} alt="프로필 아이콘" />
        <p>프로필 아이디</p>
      </a>
      <nav id="sidebar-menu">
        <a href="/neighbor" id="sidebar-menu-item">
          <img src={neighborIcon} alt="아이콘" />
          <p>이웃마당</p>
        </a>
        <a href="#" id="sidebar-menu-item">
          <img src={marketIcon} alt="아이콘" />
          <p>중고장터</p>
        </a>
        <a href="#" id="sidebar-menu-item">
          <img src={meetingIcon} alt="아이콘" />
          <p>만남의 장</p>
        </a>
        <a href="#" id="sidebar-menu-item">
          <img src={addfriendIcon} alt="아이콘" />
          <p>친구 추가</p>
        </a>
        <a href="#" id="sidebar-menu-item">
          <img src={mapfriendIcon} alt="아이콘" />
          <p>친구 위치</p>
        </a>
        <a href="#" id="sidebar-menu-item">
          <img src={chattingIcon} alt="아이콘" />
          <p>채팅</p>
        </a>
        <a href="#" id="sidebar-menu-item">
          <img src={settingIcon} alt="아이콘" />
          <p>설정</p>
        </a>
      </nav>
    </aside>
  );
}

export default Sidebar;
