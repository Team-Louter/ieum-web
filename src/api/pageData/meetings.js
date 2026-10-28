import { meetingApi } from '../client';
import { toMeetingCard, toMeetingMember, toMeetingNotice } from '../adapters';
import { asArray, loadApiOrEmpty } from './common';

export async function loadMeetingListPage({ path }) {
  const response = path === '/meeting/my' ? await meetingApi.mine(true) : await meetingApi.list();
  const apiMeetings = Array.isArray(response)
    ? response
    : (response?.meetings ?? response?.content ?? []);
  return {
    meetings: asArray(apiMeetings).map(toMeetingCard),
  };
}

export async function loadMeetingDetailPage({ selectedId }) {
  const [remoteMeeting, membership] = await Promise.all([
    meetingApi.get(selectedId),
    meetingApi.membership(selectedId),
  ]);
  const state = membership?.membershipStatus ?? membership?.status;
  const canReadNotices = ['OWNER', 'JOINED'].includes(state);
  const [remoteMembers, noticePage] = await Promise.all([
    membership?.canManage ? meetingApi.members(selectedId) : [],
    canReadNotices ? loadApiOrEmpty(() => meetingApi.notices(selectedId)) : [],
  ]);

  const members = asArray(remoteMembers).map(toMeetingMember);
  const notices = asArray(Array.isArray(noticePage) ? noticePage : noticePage?.notices)
    .map(toMeetingNotice)
    .sort((first, second) => {
      const firstTime = new Date(first.createdAt ?? 0).getTime();
      const secondTime = new Date(second.createdAt ?? 0).getTime();
      return secondTime - firstTime;
    });
  const meeting = toMeetingCard({
    ...remoteMeeting,
    memberCount: remoteMeeting.memberCount ?? members.length,
  });

  return {
    meeting,
    membership,
    announcement: notices[0] ?? {},
    notices,
    members,
  };
}
