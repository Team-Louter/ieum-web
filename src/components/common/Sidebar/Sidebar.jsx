import { useState } from 'react';
import './Sidebar.css';
import profileImg from '../../../assets/images/profile.png';
import neighborIcon from '../../../assets/images/neighbor.svg';
import marketIcon from '../../../assets/images/market.svg';
import meetingIcon from '../../../assets/images/meeting.svg';
import addfriendIcon from '../../../assets/images/addfriend.svg';
import mapfriendIcon from '../../../assets/images/mapfriend.svg';
import chattingIcon from '../../../assets/images/chatting.svg';
import settingIcon from '../../../assets/images/setting.svg';

const sidebarMenuItems = [
  { id: 'neighbor', href: '/neighbor', icon: neighborIcon, label: '이웃마당' },
  { id: 'market', href: '/market', icon: marketIcon, label: '중고장터' },
  { id: 'meeting', href: '/meeting-show', icon: meetingIcon, label: '만남의 장' },
  { id: 'add-friend', href: '#', icon: addfriendIcon, label: '친구 추가' },
  { id: 'friend-location', href: '/friends/location', icon: mapfriendIcon, label: '친구 위치' },
  { id: 'chat', href: '/chatting', icon: chattingIcon, label: '채팅' },
  { id: 'setting', href: '#', icon: settingIcon, label: '설정' },
];

/** 현재 주소와 일치하는 메뉴의 식별자를 반환합니다. */
function getActiveMenuId(currentPath) {
  return sidebarMenuItems.find((menuItem) => (
    menuItem.href !== '#' && (
      currentPath === menuItem.href || currentPath.startsWith(`${menuItem.href}/`)
    )
  ))?.id ?? null;
}

/** 마우스 오버 또는 키보드 포커스 시 확장되는 공통 사이드바를 표시합니다. */
function Sidebar() {
  const [isHovered, setIsHovered] = useState(false);
  const [hasKeyboardFocus, setHasKeyboardFocus] = useState(false);
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
  const [activeMenuId, setActiveMenuId] = useState(() => getActiveMenuId(currentPath));
  const isExpanded = isHovered || hasKeyboardFocus;
  const isMyProfileActive = currentPath === '/myProfile' || currentPath.startsWith('/myProfile/');

  /** 키보드 사용자가 사이드바를 벗어났는지 확인합니다. */
  function handleBlur(event) {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setHasKeyboardFocus(false);
    }
  }

  /** 메뉴 클릭 상태를 유지하고, 준비 중인 메뉴의 기본 이동을 막습니다. */
  function handleMenuClick(event, menuItem) {
    setActiveMenuId(menuItem.id);

    if (menuItem.href === '#') {
      event.preventDefault();
    }
  }

  return (
    <aside
      className={`sidebar${isExpanded ? ' sidebar--expanded' : ''}`}
      aria-label="주 메뉴"
      onBlur={handleBlur}
      onFocus={(event) => {
        if (event.target.matches(':focus-visible')) {
          setHasKeyboardFocus(true);
        }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <a className={`sidebar__profile${isMyProfileActive ? ' is-active' : ''}`} href="/myProfile" aria-current={isMyProfileActive ? 'page' : undefined} aria-label="내 프로필" title="내 프로필">
        <img className="sidebar__icon" src={profileImg} alt="" />
        <span className="sidebar__label">프로필 아이디</span>
      </a>

      <nav className="sidebar__menu" aria-label="서비스 메뉴">
        {sidebarMenuItems.map((menuItem) => {
          const { href, icon, label } = menuItem;
          const isActive = activeMenuId === menuItem.id;

          return (
            <a className={`sidebar__menu-item${isActive ? ' is-active' : ''}`} href={href} key={label} aria-current={isActive ? 'page' : undefined} aria-label={label} title={label} onClick={(event) => handleMenuClick(event, menuItem)}>
              <img className="sidebar__icon" src={icon} alt="" />
              <span className="sidebar__label">{label}</span>
            </a>
          );
        })}
      </nav>
    </aside>
  );
}

export default Sidebar;
