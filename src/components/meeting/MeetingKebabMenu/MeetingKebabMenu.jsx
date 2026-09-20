import { useState } from "react";
import { useNavigate } from "react-router-dom";
import './MeetingKebabMenu.css';

export default function MeetingKebabMenu({ image }) {

  const [ isKebabMenu, setIsKebabMenu ] = useState(false);
  const navigate = useNavigate();
  
  return (
    <button className="meeting-card-dot-container" onClick={() => {setIsKebabMenu(!isKebabMenu);}}>
      <img className="meeting-card-dot-setting" src={image} alt="세팅 이미지" />
      {isKebabMenu && (
        <ul className="meeting-kebab-menu">
          <li
            className="delete"
            onClick={(event) => {
              event.stopPropagation();
              navigate("/meeting-management");
            }}
          >
            모임 관리하기
          </li>
          <li className="delete">모임 탈퇴하기</li>
          <li>모임 삭제하기</li>
        </ul>
      )}
    </button>
  )
}
