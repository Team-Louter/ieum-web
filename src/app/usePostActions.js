import { communityPostApi, sharingApi, uploadApi } from '../api/client';

// 동네 게시물과 나눔 게시물의 동작입니다.
export default function usePostActions({ runAction, movePage, patchPost }) {
  const applyResult = patchPost ? { applyResult: patchPost } : undefined;

  async function updateSharing(original, values) {
    const imageFile = values.media instanceof File ? values.media : null;
    await runAction(async () => {
      const request = {
        name: values.title,
        description: values.content,
        region: values.region,
        price: Number(values.price),
        complete: Boolean(original.complete),
      };
      // 새 파일을 고르지 않으면 기존 이미지 주소를 그대로 유지합니다.
      if (!imageFile && (original.imageUrl || original.image)) {
        request.imageUrl = original.imageUrl ?? original.image;
      }
      return sharingApi.update(original.id, request, imageFile);
    }, '나눔 게시물을 수정했습니다.');
    movePage('/market/my');
  }

  async function createSharing(values) {
    const result = await runAction(() => {
      const imageFile = values.media instanceof File ? values.media : null;
      const request = {
        name: values.title,
        description: values.content,
        region: values.region,
        price: Number(values.price),
        complete: false,
      };

      if (!imageFile && values.imageUrl) request.imageUrl = values.imageUrl;
      return sharingApi.create(request, imageFile);
    }, '나눔 게시물을 등록했습니다.');

    movePage('/market');
    return result;
  }

  async function createNeighborPost(values) {
    // 사진은 최대 5장까지 한 번에 올립니다.
    const imageFiles = (Array.isArray(values.media) ? values.media : [values.media]).filter(
      (file) => file instanceof File,
    );
    const post = await runAction(async () => {
      if (imageFiles.length > 5) {
        throw new Error('사진은 최대 5장까지 올릴 수 있습니다.');
      }
      if (imageFiles.some((file) => !['image/jpeg', 'image/png'].includes(file.type))) {
        throw new Error('JPG 또는 PNG 사진만 올릴 수 있습니다.');
      }
      if (imageFiles.some((file) => file.size > 5 * 1024 * 1024)) {
        throw new Error('사진은 5MB 이하로 올려주세요.');
      }

      return communityPostApi.create(
        { title: values.title, content: values.content },
        imageFiles.length > 0 ? imageFiles : null,
      );
    }, '게시물을 등록했습니다.');
    movePage('/neighbor');
    return post;
  }

  function toggleNeighborLike(post, isLiked) {
    return runAction(
      () => (isLiked ? communityPostApi.like(post.id) : communityPostApi.unlike(post.id)),
      isLiked ? '좋아요를 눌렀습니다.' : '좋아요를 취소했습니다.',
      applyResult,
    ).catch(() => {});
  }

  function addNeighborComment(post, content) {
    return runAction(
      () => communityPostApi.createComment(post.id, { content }),
      '댓글을 등록했습니다.',
      applyResult,
    ).catch(() => {});
  }

  // 게시물 수정 (제목·내용). 내 게시물에서만 호출됩니다.
  // 사진을 고칠 때는 새 파일을 먼저 올려 주소를 받은 뒤, 남길 사진 주소와 함께 imageUrls로 보냅니다.
  // (파일을 직접 보내면 기존 사진 전체가 교체되므로 쓰지 않습니다. imageUrls를 생략하면 기존 사진이 유지됩니다.)
  function updateNeighborPost(post, values) {
    return runAction(
      async () => {
        const request = { title: values.title, content: values.content };
        if (Array.isArray(values.keptImageUrls)) {
          const uploaded = [];
          for (const file of values.newImages ?? []) uploaded.push(await uploadApi.image(file));
          request.imageUrls = [...values.keptImageUrls, ...uploaded];
        }
        return communityPostApi.update(post.id, request);
      },
      '게시물을 수정했습니다.',
      applyResult,
    );
  }

  // 댓글 수정·삭제는 댓글 작성자만 할 수 있습니다.
  function updateNeighborComment(post, comment, content) {
    return runAction(
      () => communityPostApi.updateComment(post.id, comment.id, { content }),
      '댓글을 수정했습니다.',
      applyResult,
    ).catch(() => {});
  }

  function deleteNeighborComment(post, comment) {
    return runAction(
      () => communityPostApi.removeComment(post.id, comment.id),
      '댓글을 삭제했습니다.',
      applyResult,
    ).catch(() => {});
  }

  function deleteNeighborPost(postId) {
    return runAction(() => communityPostApi.remove(postId), '게시물을 삭제했습니다.').catch(
      () => {},
    );
  }

  async function markSharingComplete(productId) {
    await runAction(() => sharingApi.complete(productId), '나눔 완료로 표시했습니다.');
  }

  async function deleteSharing(productId) {
    await runAction(() => sharingApi.remove(productId), '나눔 게시물을 삭제했습니다.');
  }

  return {
    updateSharing,
    createSharing,
    createNeighborPost,
    toggleNeighborLike,
    addNeighborComment,
    updateNeighborPost,
    updateNeighborComment,
    deleteNeighborComment,
    deleteNeighborPost,
    markSharingComplete,
    deleteSharing,
  };
}
