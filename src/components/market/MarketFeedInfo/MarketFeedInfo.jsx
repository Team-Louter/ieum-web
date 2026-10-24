import './MarketFeedInfo.css';
import { useNavigate } from 'react-router-dom';
import backIcon from '../../../assets/images/arrow.svg';

function MarketFeedInfo({ img, title, price, content, userImg, userId, address, onChat }) {
  const navigate = useNavigate();

  return (
    <div id="feed-in-container">
      <button id="back-btn" type="button" onClick={() => navigate('/market')}>
        <img src={backIcon} alt="" />
        <p>뒤로가기</p>
      </button>
      <div id="feed-info">
        <img src={img} alt="" />
        <div>
          <div>
            <p>{title}</p>
            <p>{price}</p>
            <p>{content}</p>
          </div>
          <button type="button" onClick={onChat}>채팅하기</button>
        </div>
      </div>
      <div id="user-info">
        <img src={userImg} alt="" />
        <div>
          <p>{userId}</p>
          <p>{address}</p>
        </div>
      </div>
    </div>
  );
}

export default MarketFeedInfo;
