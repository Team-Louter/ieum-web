import './MyProfilePageContent.css';
import MyProfileInfo from '../../components/myProfile/MyProfileInfo/MyProfileInfo';
import Layout from '../../components/common/Layout/Layout';
import MyProfileEditButtons from '../../components/myProfile/MyProfileEditButtons/MyProfileEditButtons';
import PageTabNavigation from '../../components/common/PageTabNavigation/PageTabNavigation';
import MyPostCard from '../../components/neighbor/MyPostCard/MyPostCard';

/** 사용자 프로필 화면을 표시합니다. */
function MyProfilePageContent() {
  const menuItems = [
    { label: '내 게시물', href: '/myProfile', isActive: true },
    { label: '내 모임', href: '/myProfile/meetings', isActive: false },
    { label: '내 친구', href: '/myProfile/friends', isActive: false },
  ];

  return (
    <Layout className="profile-layout">
      <div id="profile-box">
        <MyProfileInfo />
        <MyProfileEditButtons />
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

export default MyProfilePageContent;
