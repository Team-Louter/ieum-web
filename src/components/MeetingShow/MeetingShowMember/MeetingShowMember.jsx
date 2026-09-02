import './MeetingShowMember.css'
import profile_image from '../../../assets/profile_image.png'

export default function MeetingShowMember() {
  return(
    <div>
      <div className="member-header">
        <p className="member-title">회원 (47명)</p>
        <p className="member-more">더보기</p>
      </div>
      <div className="member-list">
        <div className='member-profile'>
          <img src={profile_image} alt="프로필 사진"/>
          <p>아이디</p>
        </div>
        <div className='member-profile'>
          <img src={profile_image} alt="프로필 사진"/>
          <p>아이디</p>
        </div>
        <div className='member-profile'>
          <img src={profile_image} alt="프로필 사진"/>
          <p>아이디</p>
        </div>
        <div className='member-profile'>
          <img src={profile_image} alt="프로필 사진"/>
          <p>아이디</p>
        </div>
        <div className='member-profile'>
          <img src={profile_image} alt="프로필 사진"/>
          <p>아이디</p>
        </div>
        <div className='member-profile'>
          <img src={profile_image} alt="프로필 사진"/>
          <p>아이디</p>
        </div>
      </div>
    </div>
  )
}