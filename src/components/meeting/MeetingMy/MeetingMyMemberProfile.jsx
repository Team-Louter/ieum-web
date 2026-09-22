import './MeetingMyMemberProfile.css';
import defaultImage from '../../../assets/images/profile.png';

export default function MeetingMyMemberProfile({
  profile_image,
  id,
  role,
  isMenuOpen,
  onToggle,
  actionItems = ['관리자 임명', '추방하기', '차단하기'],
}) {
  return(
    <div className="member-profile-item">
      <button
        className="member-profile"
        type="button"
        onClick={onToggle}
        aria-expanded={isMenuOpen}
        aria-label={`${id} 프로필 메뉴`}
      >
        <img src={profile_image ?? defaultImage} alt="프로필 사진"/>
        <p>{role === '회원' ? id : `${id} (${role})`}</p>
      </button>
      {isMenuOpen && (
        <div className="member-action-menu">
          {actionItems.map((actionItem) => (
            <button type="button" key={actionItem}>{actionItem}</button>
          ))}
        </div>
      )}
    </div>
  )
}
