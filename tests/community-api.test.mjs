import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';

const server = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
});
after(async () => {
  await server.close();
});
const memory = new Map([
  ['ieum.accessToken', 'test-token'],
  ['ieum.demoStore.v1', '{"reader:neighbor.posts":[{"id":999,"title":"local only"}]}'],
]);
globalThis.window = {
  localStorage: {
    getItem: (key) => memory.get(key) ?? null,
    setItem: (key, value) => memory.set(key, value),
    removeItem: (key) => memory.delete(key),
  },
  location: new URL('https://frontend.test/neighbor'),
};
const calls = [];
let reply = {};
globalThis.fetch = async (url, options) => {
  calls.push({ url: new URL(url), options });
  return new Response(JSON.stringify(reply), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
const { communityPostApi } = await server.ssrLoadModule('/src/api/client.js');
const { loadCommunityPosts } = await server.ssrLoadModule('/src/api/pageData/community.js');
const { loadOtherProfilePage } = await server.ssrLoadModule('/src/api/pageData/profile.js');
const { getRouteKey, getRouteId } = await server.ssrLoadModule('/src/app/routes.js');
const { loadMeetingDetailPage } = await server.ssrLoadModule('/src/api/pageData/meetings.js');

test('shared posts come from server with numeric author profile links, not local demo data', async () => {
  reply = {
    posts: [
      {
        id: 11,
        authorId: 2,
        author: {
          userId: 2,
          loginId: 'other',
          profileImageUrl: '/uploads/images/other.png',
        },
        title: 'server post',
        likedByMe: true,
        comments: [{ author: { loginId: 'reader' }, content: 'hello' }],
      },
    ],
    hasNext: true,
    totalCount: 21,
  };
  const result = await loadCommunityPosts({ page: 1 });
  assert.equal(result.posts[0].id, 11);
  assert.equal(result.posts[0].author.id, 'other');
  assert.equal(result.posts[0].profileHref, '/profile/2');
  assert.equal(result.posts[0].isLiked, true);
  assert.equal(result.posts[0].comments[0].profileId, 'reader');
  assert.equal(result.totalCount, 21);
  assert.equal(calls.at(-1).url.searchParams.get('page'), '1');
  assert.equal(calls.at(-1).options.headers.get('Authorization'), 'Bearer test-token');
  await loadCommunityPosts({ mine: true });
  assert.equal(calls.at(-1).url.searchParams.get('mine'), 'true');
  await loadCommunityPosts({ authorId: 2 });
  assert.equal(calls.at(-1).url.searchParams.get('authorId'), '2');
});

test('create uploads multipart JSON and image without a client-supplied owner', async () => {
  reply = { id: 12 };
  const image = new File(['png'], 'photo.png', { type: 'image/png' });
  await communityPostApi.create({ title: 'title', content: 'body' }, image);
  const call = calls.at(-1);
  assert.equal(call.options.method, 'POST');
  assert.equal(call.options.headers.has('Content-Type'), false);
  assert.equal(call.options.body.get('file').name, 'photo.png');
  assert.deepEqual(JSON.parse(await call.options.body.get('request').text()), {
    title: 'title',
    content: 'body',
  });
});

test('profile routes keep the selected author id and reject missing author', async () => {
  assert.equal(getRouteKey('/profile/2'), '/profile');
  assert.equal(getRouteId('/profile/2'), 2);
  assert.equal(getRouteId('/profile/3'), 3);
  await assert.rejects(() => loadOtherProfilePage({}), /작성자/);
});

test('server membership cannot be overwritten by stale saved meeting metadata', async () => {
  memory.set(
    'ieum.demoStore.v1',
    JSON.stringify({
      'reader:meetings': [
        {
          id: 7,
          _apiBacked: true,
          membershipStatus: 'NOT_JOINED',
          canJoin: true,
        },
      ],
    }),
  );
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    const path = new URL(url).pathname;
    const payload = path.endsWith('/membership')
      ? { membershipStatus: 'JOINED', canJoin: false }
      : path.endsWith('/members')
        ? []
        : path.endsWith('/notices')
          ? { notices: [] }
          : { id: 7, membershipStatus: 'JOINED', canJoin: false };
    return new Response(JSON.stringify(payload), { status: 200 });
  };
  try {
    const result = await loadMeetingDetailPage({
      selectedId: 7,
      demoScope: 'reader',
    });
    assert.equal(result.meeting.membershipStatus, 'JOINED');
    assert.equal(result.meeting.canJoin, false);
    assert.equal(result.membership.canJoin, false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('other profile renders the actual author and never an owner-only delete button', async () => {
  const React = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { MemoryRouter } = await import('react-router-dom');
  const { default: Profile } = await server.ssrLoadModule(
    '/src/pages/Profile/ProfilePageContent.jsx',
  );
  const html = renderToStaticMarkup(
    React.createElement(
      MemoryRouter,
      null,
      React.createElement(Profile, {
        profile: { userId: 2, id: 'other-author', introduction: 'author bio' },
        currentUserId: 1,
        posts: [
          {
            id: 11,
            author: { id: 'other-author' },
            title: 'shared title',
            profileHref: '/profile/2',
          },
        ],
      }),
    ),
  );
  assert.match(html, /other-author/);
  assert.match(html, /author bio/);
  assert.match(html, /href="\/profile\/2"/);
  assert.match(html, /shared title/);
  assert.doesNotMatch(html, /삭제하기/);
});
