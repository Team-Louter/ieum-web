import './MyProfilePageContent.css';
import MyProfileInfo from '../../components/myProfile/MyProfileInfo/MyProfileInfo';
import Layout from '../../components/common/Layout/Layout';
import MyProfileEditButtons from '../../components/myProfile/MyProfileEditButtons/MyProfileEditButtons';
import PageTabNavigation from '../../components/common/PageTabNavigation/PageTabNavigation';
import MyPostCard from '../../components/neighbor/MyPostCard/MyPostCard';
import { dummyMyPosts, dummyMyProfile } from '../../constants/dummy/dummyProfiles';

/** 사용자 프로필 화면을 표시합니다. */
function MyProfilePageContent({
  profile = dummyMyProfile,
  posts = dummyMyPosts,
  onDeletePost,
  onProfileUpdate,
}) {
  const menuItems = [
    { label: '내 게시물', href: '/myProfile', isActive: true },
    { label: '내 모임', href: '/myProfile/meetings', isActive: false },
    { label: '내 친구', href: '/myProfile/friends', isActive: false },
  ];

  return (
    <Layout className="profile-layout">
      <div id="profile-box">
        <MyProfileInfo profile={profile} />
        <MyProfileEditButtons profile={profile} onProfileUpdate={onProfileUpdate} />
        <PageTabNavigation ariaLabel="프로필 콘텐츠 메뉴" items={menuItems} />
        <div id="content-container">
          {posts.map((post, index) => (
            <MyPostCard
              key={post.id ?? index}
              post={post}
              onDelete={onDeletePost}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
}

export default MyProfilePageContent;
