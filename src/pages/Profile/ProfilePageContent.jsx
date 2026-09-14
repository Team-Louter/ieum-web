import './ProfilePageContent.css';
import ProfileInfo from '../../components/profile/ProfileInfo/ProfileInfo';
import Layout from '../../components/common/Layout/Layout';
import ProfileActionButtons from '../../components/profile/ProfileActionButtons/ProfileActionButtons';
import PageTabNavigation from '../../components/common/PageTabNavigation/PageTabNavigation';
import MyPostCard from '../../components/neighbor/MyPostCard/MyPostCard';

/** 사용자 프로필 화면을 표시합니다. */
function ProfilePageContent() {
  const menuItems = [
    { label: '게시물', href: '/profile', isActive: true },
    { label: '모임', href: '/profile/meetings', isActive: false },
    { label: '친구', href: '/profile/friends', isActive: false },
  ];

  return (
    <Layout className="profile-layout">
      <div id="profile-box">
        <ProfileInfo />
        <ProfileActionButtons />
        <PageTabNavigation ariaLabel="프로필 콘텐츠 메뉴" items={menuItems} />
        <div id="content-container">
          <MyPostCard />
          <MyPostCard />
          <MyPostCard />
        </div>
      </div>
    </Layout>
  );
}

export default ProfilePageContent;
