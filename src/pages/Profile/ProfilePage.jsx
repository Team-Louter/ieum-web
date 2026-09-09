import './ProfilePage.css';
import ProfileInfo from '../../components/profile/ProfileInfo/ProfileInfo';
import Layout from '../../components/common/Layout/Layout';
import ProfileActionButtons from '../../components/profile/ProfileActionButtons/ProfileActionButtons';
import ProfileNavigation from '../../components/profile/ProfileNavigation/ProfileNavigation';

/** 사용자 프로필 화면을 표시합니다. */
function ProfilePage() {
  return (
    <Layout>
      <div id='profile-box'>
        <ProfileInfo></ProfileInfo>
        <ProfileActionButtons />
        <ProfileNavigation list1="게시물" list2="모임" list3="친구" />
      </div>
    </Layout>
  );
}

export default ProfilePage;
