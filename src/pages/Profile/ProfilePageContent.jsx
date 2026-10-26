import { useState } from 'react';
import PostPagination from '../../components/neighbor/PostPagination';
import './ProfilePageContent.css';
import ProfileInfo from '../../components/profile/ProfileInfo/ProfileInfo';
import Layout from '../../components/common/Layout/Layout';
import ProfileActionButtons from '../../components/profile/ProfileActionButtons/ProfileActionButtons';
import PageTabNavigation from '../../components/common/PageTabNavigation/PageTabNavigation';
import PostCard from '../../components/neighbor/PostCard/PostCard';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import { dummyMyPosts, dummyOtherProfile } from '../../constants/dummy/dummyProfiles';

/** 사용자 프로필 화면을 표시합니다. */
function ProfilePageContent({
  profile = dummyOtherProfile,
  posts = dummyMyPosts,
  onLike,
  onAddFriend,
  onProfileChat,
  currentUserId,
  onSubmitComment,
  isLoading = false,
  apiError = '',
  communityPage = 0,
  hasNext = false,
  onCommunityPageChange,
}) {
  const [activeCommentId, setActiveCommentId] = useState(null);
  const postItems = Array.isArray(posts) ? posts : [];
  const isEmpty = postItems.length === 0 && !isLoading && !apiError;
  const menuItems = [{ label: '게시물', href: `/profile/${profile.userId}`, isActive: true }];

  return (
    <Layout className="profile-layout">
      <div id="profile-box" className={isEmpty ? 'profile-box--empty' : undefined}>
        <ProfileInfo profile={profile} />
        {profile.userId != null && String(profile.userId) !== String(currentUserId) && (
          <ProfileActionButtons
            onAddFriend={() => onAddFriend?.(profile.userId)}
            onChat={() => onProfileChat?.(profile.userId)}
          />
        )}
        <PageTabNavigation ariaLabel="프로필 콘텐츠 메뉴" items={menuItems} />
        <div id="content-container">
          {postItems.length > 0 ? (
            postItems.map((post, index) => (
              <PostCard
                key={post.id ?? index}
                post={post}
                isCommentOpen={activeCommentId === post.id}
                onCommentToggle={() =>
                  setActiveCommentId(activeCommentId === post.id ? null : post.id)
                }
                onLikeToggle={(enabled) => onLike?.(post, enabled)}
                onSubmitComment={(content) => onSubmitComment?.(post, content)}
              />
            ))
          ) : isEmpty ? (
            <EmptyState title="게시물이 없어요" description="아직 작성된 게시물이 없습니다." />
          ) : null}
        </div>
      </div>
      <PostPagination
        communityPage={communityPage}
        hasNext={hasNext}
        onCommunityPageChange={onCommunityPageChange}
        isLoading={isLoading}
      />
    </Layout>
  );
}

export default ProfilePageContent;
