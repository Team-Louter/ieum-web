import { communityPostApi, resolveApiAssetUrl } from '../client';

export function toCommunityPost(post) {
  const author = post.author ?? {};
  return {
    ...post,
    image: resolveApiAssetUrl(post.imageUrl ?? ''),
    isLiked: post.likedByMe === true,
    author: {
      ...author,
      id: author.loginId,
      profileImage: resolveApiAssetUrl(author.profileImageUrl ?? ''),
    },
    profileHref: `/profile/${post.authorId}`,
    comments: (post.comments ?? []).map((comment) => ({
      ...comment,
      profileId: comment.author?.loginId ?? comment.profileId,
      profileImage: resolveApiAssetUrl(comment.author?.profileImageUrl ?? ''),
    })),
  };
}

// Read the shared server feed, never account-scoped browser demo posts.
export async function loadCommunityPosts(options = {}) {
  const first = await communityPostApi.list(options);
  return {
    posts: first.posts.map(toCommunityPost),
    hasNext: first.hasNext,
    totalCount: first.totalCount,
  };
}
