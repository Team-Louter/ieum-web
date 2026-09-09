import './ProfileNavigation.css';

/** 프로필 하위 콘텐츠를 구분하는 메뉴입니다. */
function ProfileNavigation({ list1, list2, list3 }) {
  return (
    <div id="meeting-menu-container">
      <ul id="meeting-menu">
        <li>
          <button>{list1}</button>
        </li>
        <li>
          <button>{list2}</button>
        </li>
        <li>
          <button>{list3}</button>
        </li>
      </ul>
    </div>
  );
}

export default ProfileNavigation;
