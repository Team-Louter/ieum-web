import './MeetingMyMemberProfile.css'
import default_image from '../../assets/images/profile.png'

export default function MeetingMyMemberProfile({ profile_image, id, role, isMenuOpen, onToggle }) {
  return(
    <div className="member-profile-item">
      <button
        className="member-profile"
        type="button"
        onClick={onToggle}
        aria-expanded={isMenuOpen}
        aria-label={`${id} 프로필 메뉴`}
      >
        <img  src={profile_image ?? default_image} alt="프로필 사진"/>
        <p>{id} ({role})</p>
      </button>
      {isMenuOpen && (
        <div className="member-action-menu">
          <button type="button">관리자 임명</button>
          <button type="button">추방하기</button>
          <button type="button">차단하기</button>
        </div>
      )}
    </div>
  )
}
