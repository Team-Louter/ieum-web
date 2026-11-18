import { useState } from 'react';
import './SettingSidebar.css';
import ConfirmationModal from '../../common/ConfirmationModal/ConfirmationModal';
import myAccountIcon from '../../../assets/images/myAccount.svg';
import generalSettingsIcon from '../../../assets/images/generalSettings.svg';
import newFeatureIcon from '../../../assets/images/newFeature.svg';
import customerSupportIcon from '../../../assets/images/customerSupport.svg';
import logoutIcon from '../../../assets/images/logout.svg';
import deleteAccountIcon from '../../../assets/images/trashcan.svg';

const settingMenuGroups = [
  {
    title: '설정',
    items: [
      { id: 'account', label: '내 계정', icon: myAccountIcon },
      { id: 'general', label: '일반 설정', icon: generalSettingsIcon },
    ],
  },
  {
    title: '도움',
    items: [
      { id: 'feature', label: '새로운 기능', icon: newFeatureIcon },
      { id: 'support', label: '고객센터', icon: customerSupportIcon },
    ],
  },
];

function SettingSidebar({ activeSection, onSelect, onLogout, onAccountDelete }) {
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

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
                  <img src={item.icon} alt="" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </section>
      ))}

      <div className="setting-sidebar__account-actions">
        <button className="setting-sidebar__account-action" type="button" onClick={() => setIsLogoutConfirmOpen(true)}>
          <img src={logoutIcon} alt="로그아웃 아이콘" />
          로그아웃 하기
        </button>
        <button
          className="setting-sidebar__account-action setting-sidebar__account-action--danger"
          type="button"
          onClick={() => setIsDeleteConfirmOpen(true)}
        >
          <img src={deleteAccountIcon} alt="계정 삭제 아이콘" />
          계정 삭제하기
        </button>
      </div>
      {isLogoutConfirmOpen && (
        <ConfirmationModal
          title="로그아웃"
          message="로그아웃 하시겠습니까?"
          confirmLabel="로그아웃"
          cancelLabel="취소"
          onCancel={() => setIsLogoutConfirmOpen(false)}
          onConfirm={() => {
            setIsLogoutConfirmOpen(false);
            onLogout?.();
          }}
        />
      )}
      {isDeleteConfirmOpen && (
        <ConfirmationModal
          title="계정 삭제"
          message="계정을 삭제하시겠습니까? 삭제한 계정은 되돌릴 수 없습니다."
          confirmLabel="계정 삭제"
          cancelLabel="취소"
          onCancel={() => setIsDeleteConfirmOpen(false)}
          onConfirm={() => {
            setIsDeleteConfirmOpen(false);
            onAccountDelete?.();
          }}
        />
      )}
    </aside>
  );
}

export default SettingSidebar;
