import './ChattingPage.css';
import profileImage from '../../assets/images/profile.png';
import searchIcon from '../../assets/images/search.svg';

function ChattingPage() {
  const chatUsers = [
    '재인',
    '주',
    '일림',
    '오피피림',
    '오미누',
    '우앙님',
    '날파리',
    '예니',
    '평식님',
    '소삐언니',
    '콘님',
  ];

  return (
    <div className="chatting-page">

      {/* 채팅 목록 */}
      <div className="chat-list-section">

        <div className="chat-search">
          <img src={searchIcon} alt="검색하기" />
          <input
            type="text"
            placeholder="검색하기"
          />
        </div>

        <div className="chat-list">
          {chatUsers.map((user, index) => (
            <div className="chat-list-item" key={index}>
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
  );
}

export default ChattingPage;