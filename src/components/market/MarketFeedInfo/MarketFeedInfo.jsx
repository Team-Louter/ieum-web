import './MarketFeedInfo.css';
import { useNavigate } from 'react-router-dom';
import backIcon from '../../../assets/images/arrow.svg';

function MarketFeedInfo({
  img,
  title,
  price,
  content,
  userImg,
  sellerLoginId,
  address,
  complete = false,
  showChat = true,
  onChat,
}) {
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
            <p className="market-feed-info__title">{title}</p>
            {complete && <p className="market-feed-info__status">거래완료</p>}
            <p className="market-feed-info__price">{price}</p>
            <p className="market-feed-info__content">{content}</p>
          </div>
          {showChat && <button type="button" onClick={onChat}>채팅하기</button>}
        </div>
      </div>
      <div id="user-info">
        <img src={userImg} alt="" />
        <div>
          <p>{sellerLoginId}</p>
          <p>{address}</p>
        </div>
      </div>
    </div>
  );
}

export default MarketFeedInfo;
