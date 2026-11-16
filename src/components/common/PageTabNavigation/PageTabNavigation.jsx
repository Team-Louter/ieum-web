import { Link } from 'react-router-dom';
import './PageTabNavigation.css';

/** 여러 페이지에서 사용하는 공통 탭 메뉴를 표시합니다. */
function PageTabNavigation({ ariaLabel, isFixed = false, items }) {
  const navigationClassName = [
    'page-tab-navigation',
    isFixed ? 'page-tab-navigation--fixed' : 'page-tab-navigation--inline',
  ].join(' ');

  return (
    <nav className={navigationClassName} aria-label={ariaLabel}>
      <ul className="page-tab-navigation__list">
        {items.map(({ href, isActive, label, onClick }) => (
          <li key={label} className={`page-tab-navigation__item${isActive ? ' is-active' : ''}`}>
            {href ? (
              <Link to={href} aria-current={isActive ? 'page' : undefined}>
                {label}
              </Link>
            ) : (
              <button type="button" onClick={onClick} aria-pressed={isActive}>
                {label}
              </button>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default PageTabNavigation;
