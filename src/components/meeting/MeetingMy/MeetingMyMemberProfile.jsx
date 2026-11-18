import './MeetingMyMemberProfile.css';
import defaultImage from '../../../assets/images/profile.png';

export default function MeetingMyMemberProfile({
  profile_image,
  id,
  subtitle,
  role,
  isMenuOpen,
  onToggle,
  onAction,
  interactive = true,
  actionItems = ['관리자 임명', '추방하기', '차단하기'],
  dangerActionItems = [],
}) {
  const profileContent = (
    <>
      <img loading="lazy" decoding="async"
        src={profile_image || defaultImage}
        alt="프로필 사진"
        onError={(event) => {
          event.currentTarget.onerror = null;
          event.currentTarget.src = defaultImage;
        }}
      />
      <div className="member-profile__text">
        <div className="member-profile__name-row">
          <p title={id}>{id}</p>
          {/* 모임장·관리자 태그는 이름 오른쪽에 둡니다. 이름이 길면 이름만 ...으로 줄고 태그는 그대로 보입니다. */}
          {(role === '모임장' || role === '관리자') && (
            <span className={`member-profile__tag member-profile__tag--${role === '모임장' ? 'owner' : 'manager'}`}>
              {role}
            </span>
          )}
        </div>
        {subtitle && <small title={subtitle}>{subtitle}</small>}
      </div>
    </>
  );

  return (
    <div className="member-profile-item">
      {interactive ? (
        <button
          className="member-profile"
          type="button"
          onClick={onToggle}
          aria-expanded={isMenuOpen}
          aria-label={`${id} 프로필 메뉴`}
        >
          {profileContent}
        </button>
      ) : (
        <div className="member-profile member-profile-static">{profileContent}</div>
      )}
      {interactive && isMenuOpen && (
        <div className="member-action-menu">
          {actionItems.map((actionItem) => (
            <button
              type="button"
              key={actionItem}
              className={
                dangerActionItems.includes(actionItem) ? 'member-action-menu__danger' : undefined
              }
              onClick={() => onAction?.(actionItem)}
            >
              {actionItem}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
