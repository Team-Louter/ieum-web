import './MeetingMyMemberProfile.css';
import defaultImage from '../../../assets/images/profile.png';

export default function MeetingMyMemberProfile({
  profile_image,
  id,
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
      <img
        src={profile_image || defaultImage}
        alt="프로필 사진"
        onError={(event) => {
          event.currentTarget.onerror = null;
          event.currentTarget.src = defaultImage;
        }}
      />
      <p>{role === '회원' ? id : `${id} (${role})`}</p>
    </>
  );

  return(
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
              className={dangerActionItems.includes(actionItem) ? 'member-action-menu__danger' : undefined}
              onClick={() => onAction?.(actionItem)}
            >
              {actionItem}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
