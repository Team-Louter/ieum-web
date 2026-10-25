import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';
import { getCurrentUser } from '../../../api/client';
import profileImg from '../../../assets/images/profile.png';
import neighborIcon from '../../../assets/images/neighbor.svg';
import marketIcon from '../../../assets/images/market.svg';
import meetingIcon from '../../../assets/images/meeting.svg';
import addfriendIcon from '../../../assets/images/addfriend.svg';
import mapfriendIcon from '../../../assets/images/mapfriend.svg';
import chattingIcon from '../../../assets/images/chatting.svg';
import guardianIcon from '../../../assets/images/guardian.svg';
import settingIcon from '../../../assets/images/setting.svg';

const sidebarMenuItems = [
  { id: 'neighbor', href: '/neighbor', icon: neighborIcon, label: '이웃마당' },
  { id: 'market', href: '/market', icon: marketIcon, label: '중고장터' },
  { id: 'meeting', href: '/meeting', icon: meetingIcon, label: '만남의 장' },
  { id: 'add-friend', href: '/addfriend', icon: addfriendIcon, label: '친구 추가' },
  { id: 'friend-location', href: '/friends/location', icon: mapfriendIcon, label: '친구 위치' },
  { id: 'chat', href: '/chatting', icon: chattingIcon, label: '채팅' },
  { id: 'guardian', href: '/guardian', icon: guardianIcon, label: '보호자 기능' },
  { id: 'setting', href: '/settings', icon: settingIcon, label: '설정' },
];

/** 현재 주소와 일치하는 메뉴의 식별자를 반환합니다. */
function getActiveMenuId(currentPath) {
  return (
    sidebarMenuItems.find(
      (menuItem) =>
        menuItem.href !== '#' &&
        (currentPath === menuItem.href || currentPath.startsWith(`${menuItem.href}/`)),
    )?.id ?? null
  );
}

/** 마우스 오버 또는 키보드 포커스 시 확장되는 공통 사이드바를 표시합니다. */
function Sidebar({ role }) {
  const [isHovered, setIsHovered] = useState(false);
  const [hasKeyboardFocus, setHasKeyboardFocus] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname.replace(/\/$/, '') || '/';
  const loginId = getCurrentUser().loginId;
  const profileLabel = loginId || '내 프로필';
  const activeMenuId = getActiveMenuId(currentPath);
  const isExpanded = isHovered || hasKeyboardFocus;
  const isMyProfileActive = currentPath === '/myProfile' || currentPath.startsWith('/myProfile/');
  const visibleMenuItems = sidebarMenuItems.filter(
    (menuItem) => menuItem.id !== 'guardian' || role === 'ROLE_GUARDIAN',
  );

  /** 키보드 사용자가 사이드바를 벗어났는지 확인합니다. */
  function handleBlur(event) {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setHasKeyboardFocus(false);
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
      <Link
        className={`sidebar__profile${isMyProfileActive ? ' is-active' : ''}`}
        to="/myProfile"
        aria-current={isMyProfileActive ? 'page' : undefined}
        aria-label={loginId ? `내 프로필: ${loginId}` : '내 프로필'}
        title={profileLabel}
      >
        <img className="sidebar__icon" src={profileImg} alt="" />
        <span className="sidebar__label">{profileLabel}</span>
      </Link>

      <nav className="sidebar__menu" aria-label="서비스 메뉴">
        {visibleMenuItems.map((menuItem) => {
          const { href, icon, label } = menuItem;
          const isActive = activeMenuId === menuItem.id;

          return (
            <Link
              className={`sidebar__menu-item${isActive ? ' is-active' : ''}`}
              to={href}
              key={label}
              aria-current={isActive ? 'page' : undefined}
              aria-label={label}
              title={label}
            >
              <img className="sidebar__icon" src={icon} alt="" />
              <span className="sidebar__label">{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export default Sidebar;
