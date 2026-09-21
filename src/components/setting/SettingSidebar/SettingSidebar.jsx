import './SettingSidebar.css';
import profileIcon from '../../../assets/images/profile.png';
import meetingIcon from '../../../assets/images/meeting.svg';
import settingIcon from '../../../assets/images/setting.svg';

const settingMenuGroups = [
  {
    title: '설정',
    items: [
      { id: 'account', label: '내 계정', icon: profileIcon },
      { id: 'guardian', label: '보호자 설정', icon: meetingIcon },
      { id: 'general', label: '일반 설정', icon: settingIcon },
    ],
  },
  {
    title: '도움',
    items: [
      { id: 'feature', label: '새로운 기능', symbol: '✦' },
      { id: 'notification', label: '알림 설정', symbol: '♩' },
    ],
  },
];

function SettingSidebar({ activeSection, onSelect }) {
  return (
    <aside className="setting-sidebar" aria-label="설정 메뉴">
      {settingMenuGroups.map((group) => (
        <section className="setting-sidebar__group" key={group.title}>
          <h2>{group.title}</h2>
          <div className="setting-sidebar__menu-list">
            {group.items.map((item) => {
              const isActive = activeSection === item.id;

              return (
                <button
                  className={`setting-sidebar__menu-button${isActive ? ' is-active' : ''}`}
                  type="button"
                  key={item.id}
                  onClick={() => onSelect(item.id)}
                  aria-pressed={isActive}
                >
                  {item.icon ? <img src={item.icon} alt="" /> : <span aria-hidden="true">{item.symbol}</span>}
                  {item.label}
                </button>
              );
            })}
          </div>
        </section>
      ))}

      <div className="setting-sidebar__account-actions">
        <button className="setting-sidebar__account-action" type="button">
          <span aria-hidden="true">⇥</span>
          로그아웃 하기
        </button>
        <button className="setting-sidebar__account-action setting-sidebar__account-action--danger" type="button">
          <span aria-hidden="true">♜</span>
          계정 삭제하기
        </button>
      </div>
    </aside>
  );
}

export default SettingSidebar;
