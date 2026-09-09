import './NeighborNavigation.css';

/** 이웃마당 화면 간 이동을 제공하는 탭 메뉴입니다. */
function NeighborNavigation({
  list1 = '게시물 보기',
  list2 = '내 게시물',
  list3 = '게시물 만들기',
}) {
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/neighbor';
  const menuItems = [
    { label: list1, path: '/neighbor' },
    { label: list2, path: '/neighbor/my' },
    { label: list3, path: '/neighbor/create' },
  ];

  return (
    <div id="meeting-menu-container">
      <ul id="meeting-menu">
        {menuItems.map(({ label, path }) => (
          <li key={path} className={currentPath === path ? 'is-active' : ''}>
            <a href={path} aria-current={currentPath === path ? 'page' : undefined}>
              {label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default NeighborNavigation;
