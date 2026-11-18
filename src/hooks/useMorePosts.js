import { useState } from 'react';
import { communityPostApi } from '../api/client';
import { toCommunityPost } from '../api/adapters';

/**
 * 첫 페이지(20개) 뒤의 게시물을 이어서 불러옵니다.
 * query: { mine, authorId } — 처음 목록을 불러올 때와 같은 조건입니다.
 * posts가 새로 불러와지면(작성·삭제 등) 이어 붙인 목록은 처음부터 다시 시작합니다.
 */
export default function useMorePosts({ posts, hasNext, query = {} }) {
  const [state, setState] = useState({ base: posts, items: [], page: 0, more: hasNext, loading: false });
  const current =
    state.base === posts ? state : { base: posts, items: [], page: 0, more: hasNext, loading: false };

  async function loadMore() {
    if (!current.more || current.loading) return;
    setState({ ...current, loading: true });
    try {
      const response = await communityPostApi.list({ ...query, page: current.page + 1 });
      const list = Array.isArray(response) ? response : (response?.posts ?? response?.content ?? []);
      const known = new Set([...posts, ...current.items].map((post) => String(post.id)));
      const items = list.map(toCommunityPost).filter((post) => !known.has(String(post.id)));
      setState({
        base: posts,
        items: [...current.items, ...items],
        page: current.page + 1,
        more: Boolean(response?.hasNext) && list.length > 0,
        loading: false,
      });
    } catch {
      // 실패하면 더 불러오지 않고, 이미 받은 게시물은 그대로 보여줍니다.
      setState({ ...current, more: false, loading: false });
    }
  }

  return {
    posts: current.items.length > 0 ? [...posts, ...current.items] : posts,
    hasNext: current.more,
    isLoadingMore: current.loading,
    loadMore,
  };
}
