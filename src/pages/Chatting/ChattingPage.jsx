import './ChattingPage.css';
import profileImage from '../../assets/images/profile.png';
import searchIcon from '../../assets/images/search.svg';
import Sidebar from '../../components/common/Sidebar/Sidebar'

function ChattingPage() {
  const chatUsers = [
    '김도현',
    '이정연',
    '하강호',
    '강현우',
    '우희린',
    '라우터',
  ];

  return (
    <>
    <Sidebar />

    <div className="chatting-page">

      {/* 채팅 목록 */}
      <div className="user-list-section">

        <div className="user-search">
          <img src={searchIcon} alt="검색하기" />
          <input type="text" placeholder="검색하기"/>
        </div>

        <div className="user-list">
          {chatUsers.map((user, index) => (
            <div className="user-list-item" key={index}>
              <img src={profileImage} alt="프로필" />
              <span>{user}</span>
            </div>
          ))}
        </div>

      </div>

      {/* 채팅창 */}
      <div className="chat-room">

        <div className="chat-room-header">
          <img src={profileImage} alt="프로필" />
          <span>아이디</span>
        </div>

        <div className="chat-messages">

          <div className="message received">
            채팅 내용
          </div>

          <div className="message sent">
            채팅 내용
          </div>

        </div>

      </div>

    </div>
    </>
  );
}

export default ChattingPage;