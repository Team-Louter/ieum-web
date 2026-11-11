import { sharingApi } from '../client';
import { toSharingCard } from '../adapters';
import { asArray } from './common';

export async function loadMarketListPage({ path, loginId, userId }) {
  const sharings = asArray(await sharingApi.list()).map(toSharingCard);
  const products =
    path === '/market/my'
      ? sharings.filter(
          (sharing) =>
            (sharing.sellerId != null && String(sharing.sellerId) === String(userId)) ||
            sharing.seller?.loginId === loginId,
        )
      : sharings;

  return { products, posts: products };
}

export async function loadMarketDetailPage({ selectedId }) {
  return { selectedPost: toSharingCard(await sharingApi.get(selectedId)) };
}
