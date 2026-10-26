import { sharingApi } from '../client';
import { toSharingCard } from '../adapters';
import { readDemoValue } from '../demoStore';
import { asArray, loadApiOrEmpty } from './common';

export async function loadMarketListPage({ path, demoScope, loginId, userId }) {
  const remoteSharings = asArray(await loadApiOrEmpty(() => sharingApi.list()));
  const localSharings = asArray(readDemoValue('market.posts', [], demoScope));
  const deletedIds = asArray(readDemoValue('market.deletedIds', [], demoScope));
  const ownersById = readDemoValue('market.owners', {}, demoScope);

  const sharings = [...localSharings, ...remoteSharings]
    .filter(
      (sharing, index, list) =>
        list.findIndex((candidate) => String(candidate.id) === String(sharing.id)) === index,
    )
    .filter((sharing) => !deletedIds.includes(String(sharing.id)))
    .map((sharing) => ({
      ...sharing,
      owner: sharing.owner ?? ownersById[String(sharing.id)] ?? '',
    }))
    .map(toSharingCard);
  const products =
    path === '/market/my'
      ? sharings.filter(
          (sharing) =>
            (sharing.sellerId != null && String(sharing.sellerId) === String(userId)) ||
            sharing.owner === loginId,
        )
      : sharings;

  return { products, posts: products };
}

export async function loadMarketDetailPage({ selectedId, demoScope }) {
  const localSharings = asArray(readDemoValue('market.posts', [], demoScope));
  const localSharing = localSharings.find((sharing) => String(sharing.id) === String(selectedId));
  const sharing = localSharing ?? (await sharingApi.get(selectedId));
  const ownersById = readDemoValue('market.owners', {}, demoScope);

  return {
    selectedPost: toSharingCard({
      ...sharing,
      owner: sharing.owner ?? ownersById[String(selectedId)] ?? '',
    }),
  };
}
