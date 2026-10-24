import { sharingApi } from '../api/client';
import { fileToDataUrl, isDemoFallbackError, readDemoValue, updateDemoValue } from '../api/demoStore';

// 동네 게시물과 나눔 게시물의 동작입니다.
export default function usePostActions({
  demoScope,
  user,
  runAction,
  movePage,
  setFeedback,
  setFeedbackIsError,
  setReloadKey,
}) {
  async function createSharing(values) {
    const result = await runAction(async () => {
      const imageUrl = values.media instanceof File
        ? await fileToDataUrl(values.media)
        : values.imageUrl ?? '';
      const sharing = {
        id: Date.now(),
        name: values.title,
        title: values.title,
        description: values.content,
        region: values.region,
        imageUrl,
        price: Number(values.price),
        owner: user.loginId,
        complete: false,
      };

      updateDemoValue('market.posts', (posts) => [sharing, ...posts], [], demoScope);
      return sharing;
    }, '나눔 게시물을 등록했습니다.');

    movePage('/market');
    return result;
  }

  async function createNeighborPost(values) {
    const image = values.media instanceof File ? await fileToDataUrl(values.media) : '';
    const profile = readDemoValue('profile', {}, demoScope);
    const post = {
      id: Date.now(),
      owner: user.loginId,
      author: { id: user.loginId, profileImage: profile.profileImageUrl ?? '' },
      title: values.title,
      content: values.content,
      image,
      likeCount: 0,
      isLiked: false,
      comments: [],
      createdAt: new Date().toISOString(),
    };

    updateDemoValue('neighbor.posts', (posts) => [post, ...posts], [], demoScope);
    setFeedback('게시물을 등록했습니다.');
    setFeedbackIsError(false);
    setReloadKey((current) => current + 1);
    movePage('/neighbor');
    return post;
  }

  function toggleNeighborLike(post, isLiked) {
    updateDemoValue('neighbor.posts', (posts) => posts.map((item) => {
      if (String(item.id) !== String(post.id)) return item;

      const likeCount = Number(item.likeCount ?? 0) + (isLiked ? 1 : -1);
      return { ...item, isLiked, likeCount: Math.max(0, likeCount) };
    }), [], demoScope);
    setReloadKey((current) => current + 1);
  }

  function addNeighborComment(post, content) {
    const comment = {
      id: Date.now(),
      profileId: user.loginId,
      content,
      createdAt: new Date().toISOString(),
    };

    updateDemoValue('neighbor.posts', (posts) => posts.map((item) => (
      String(item.id) === String(post.id)
        ? { ...item, comments: [...(item.comments ?? []), comment] }
        : item
    )), [], demoScope);
    setReloadKey((current) => current + 1);
  }

  function deleteNeighborPost(postId) {
    updateDemoValue(
      'neighbor.posts',
      (posts) => posts.filter((post) => String(post.id) !== String(postId)),
      [],
      demoScope,
    );
    setFeedback('게시물을 삭제했습니다.');
    setFeedbackIsError(false);
    setReloadKey((current) => current + 1);
  }

  async function markSharingComplete(productId) {
    await runAction(async () => {
      try {
        await sharingApi.complete(productId);
      } catch (error) {
        if (!isDemoFallbackError(error)) throw error;

        updateDemoValue('market.posts', (posts) => posts.map((post) => (
          String(post.id) === String(productId) ? { ...post, complete: true } : post
        )), [], demoScope);
      }
    }, '나눔 완료로 표시했습니다.');
  }

  async function deleteSharing(productId) {
    await runAction(async () => {
      try {
        await sharingApi.remove(productId);
      } catch (error) {
        if (!isDemoFallbackError(error)) throw error;

        updateDemoValue(
          'market.posts',
          (posts) => posts.filter((post) => String(post.id) !== String(productId)),
          [],
          demoScope,
        );
        updateDemoValue(
          'market.deletedIds',
          (ids) => [...new Set([...ids, String(productId)])],
          [],
          demoScope,
        );
      }
    }, '나눔 게시물을 삭제했습니다.');
  }

  return {
    createSharing,
    createNeighborPost,
    toggleNeighborLike,
    addNeighborComment,
    deleteNeighborPost,
    markSharingComplete,
    deleteSharing,
  };
}
