import { communityPostApi, sharingApi } from '../api/client';
import {
  fileToDataUrl,
  isDemoFallbackError,
  readDemoValue,
  updateDemoValue,
  writeDemoValue,
} from '../api/demoStore';

// 동네 게시물과 나눔 게시물의 동작입니다.
export default function usePostActions({
  demoScope,
  user,
  runAction,
  movePage,
}) {
  async function createSharing(values) {
    const result = await runAction(async () => {
      const imageFile = values.media instanceof File ? values.media : null;
      const request = {
        name: values.title,
        description: values.content,
        region: values.region,
        price: Number(values.price),
        complete: false,
      };

      if (!imageFile && values.imageUrl) request.imageUrl = values.imageUrl;

      try {
        const createdSharing = await sharingApi.create(request, imageFile);
        if (createdSharing?.id != null) {
          const ownersById = readDemoValue('market.owners', {}, demoScope);
          writeDemoValue(
            'market.owners',
            {
              ...ownersById,
              [String(createdSharing.id)]: user.loginId,
            },
            demoScope,
          );
        }
        return createdSharing;
      } catch (error) {
        if (!isDemoFallbackError(error)) throw error;

        const imageUrl = imageFile ? await fileToDataUrl(imageFile) : (values.imageUrl ?? '');
        const localSharing = {
          ...request,
          id: Date.now(),
          title: values.title,
          imageUrl,
          owner: user.loginId,
        };
        updateDemoValue('market.posts', (posts) => [localSharing, ...posts], [], demoScope);
        return localSharing;
      }
    }, '나눔 게시물을 등록했습니다.');

    movePage('/market');
    return result;
  }

  async function createNeighborPost(values) {
    const imageFile = values.media instanceof File ? values.media : null;
    const post = await runAction(async () => {
      if (imageFile && !['image/jpeg', 'image/png'].includes(imageFile.type)) {
        throw new Error('JPG 또는 PNG 사진만 올릴 수 있습니다.');
      }
      if (imageFile && imageFile.size > 5 * 1024 * 1024) {
        throw new Error('사진은 5MB 이하로 올려주세요.');
      }

      try {
        return await communityPostApi.create(
          { title: values.title, content: values.content },
          imageFile,
        );
      } catch (error) {
        if (!isDemoFallbackError(error)) throw error;
        const image = imageFile ? await fileToDataUrl(imageFile) : '';
        const profile = readDemoValue('profile', {}, demoScope);
        const localPost = {
          id: Date.now(),
          owner: user.loginId,
          author: { id: user.loginId, loginId: user.loginId, profileImage: profile.profileImageUrl ?? '' },
          title: values.title,
          content: values.content,
          image,
          likeCount: 0,
          isLiked: false,
          comments: [],
          createdAt: new Date().toISOString(),
        };
        updateDemoValue('neighbor.posts', (posts) => [localPost, ...posts], [], demoScope);
        return localPost;
      }
    }, '게시물을 등록했습니다.');
    movePage('/neighbor');
    return post;
  }

  function toggleNeighborLike(post, isLiked) {
    return runAction(async () => {
      try {
        return await (isLiked ? communityPostApi.like(post.id) : communityPostApi.unlike(post.id));
      } catch (error) {
        if (!isDemoFallbackError(error)) throw error;
        updateDemoValue(
          'neighbor.posts',
          (posts) =>
            posts.map((item) => {
              if (String(item.id) !== String(post.id)) return item;
              const likeCount = Number(item.likeCount ?? 0) + (isLiked ? 1 : -1);
              return { ...item, isLiked, likeCount: Math.max(0, likeCount) };
            }),
          [],
          demoScope,
        );
      }
    }, isLiked ? '좋아요를 눌렀습니다.' : '좋아요를 취소했습니다.').catch(() => {});
  }

  function addNeighborComment(post, content) {
    return runAction(async () => {
      try {
        return await communityPostApi.createComment(post.id, { content });
      } catch (error) {
        if (!isDemoFallbackError(error)) throw error;
        const comment = {
          id: Date.now(),
          profileId: user.loginId,
          content,
          createdAt: new Date().toISOString(),
        };
        updateDemoValue(
          'neighbor.posts',
          (posts) =>
            posts.map((item) =>
              String(item.id) === String(post.id)
                ? { ...item, comments: [...(item.comments ?? []), comment] }
                : item,
            ),
          [],
          demoScope,
        );
        return comment;
      }
    }, '댓글을 등록했습니다.').catch(() => {});
  }

  function deleteNeighborPost(postId) {
    return runAction(async () => {
      try {
        return await communityPostApi.remove(postId);
      } catch (error) {
        if (!isDemoFallbackError(error)) throw error;
        updateDemoValue(
          'neighbor.posts',
          (posts) => posts.filter((post) => String(post.id) !== String(postId)),
          [],
          demoScope,
        );
      }
    }, '게시물을 삭제했습니다.').catch(() => {});
  }

  async function markSharingComplete(productId) {
    await runAction(async () => {
      try {
        return await sharingApi.complete(productId);
      } catch (error) {
        if (![405, 501].includes(error?.status)) throw error;

        updateDemoValue(
          'market.posts',
          (posts) =>
            posts.map((post) =>
              String(post.id) === String(productId) ? { ...post, complete: true } : post,
            ),
          [],
          demoScope,
        );
      }
    }, '나눔 완료로 표시했습니다.');
  }

  async function deleteSharing(productId) {
    await runAction(async () => {
      try {
        await sharingApi.remove(productId);
      } catch (error) {
        if (![405, 501].includes(error?.status)) throw error;

        updateDemoValue(
          'market.posts',
          (posts) => posts.filter((post) => String(post.id) !== String(productId)),
          [],
          demoScope,
        );
      }

      updateDemoValue(
        'market.deletedIds',
        (ids) => [...new Set([...ids, String(productId)])],
        [],
        demoScope,
      );
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
