import './ProfilePage.css';
import ProfileInfo from '../../components/profile/ProfileInfo/ProfileInfo';
import Layout from '../../components/common/Layout/Layout';
import ProfileActionButtons from '../../components/profile/ProfileActionButtons/ProfileActionButtons';
import PageTabNavigation from '../../components/common/PageTabNavigation/PageTabNavigation';

/** 사용자 프로필 화면을 표시합니다. */
function ProfilePage() {
  const menuItems = [
    { label: '게시물', isActive: true },
    { label: '모임', isActive: false },
    { label: '친구', isActive: false },
  ];

  return (
    <Layout className="profile-layout">
      <div id='profile-box'>
        <ProfileInfo></ProfileInfo>
        <ProfileActionButtons />
        <PageTabNavigation ariaLabel="프로필 콘텐츠 메뉴" items={menuItems} />
      </div>
    </Layout>
  );
}

export default ProfilePage;
