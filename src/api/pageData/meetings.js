import { meetingApi } from '../client';
import { toMeetingCard, toMeetingMember, toMeetingNotice } from '../adapters';
import { readDemoValue } from '../demoStore';
import { asArray, loadApiOrEmpty } from './common';

const ACTIVE_MEMBERSHIP_STATUSES = new Set(['ACTIVE', 'APPROVED', 'JOINED', 'MEMBER']);
const PENDING_MEMBERSHIP_STATUSES = new Set([
  'PENDING',
  'PENDING_APPROVAL',
  'WAITING',
  'WAITING_APPROVAL',
  'REQUESTED',
]);

function isParticipatingMeeting(meeting) {
  const status = String(meeting.membershipStatus ?? '').toUpperCase();
  return (
    meeting.canLeave === true ||
    ACTIVE_MEMBERSHIP_STATUSES.has(status) ||
    PENDING_MEMBERSHIP_STATUSES.has(status)
  );
}

export async function loadMeetingListPage({ path, demoScope, loginId, userId }) {
  const remoteMeetings = asArray(await loadApiOrEmpty(() => meetingApi.list()));
  const localMeetings = asArray(readDemoValue('meetings', [], demoScope));

  const meetings = [...localMeetings, ...remoteMeetings]
    .filter(
      (meeting, index, list) =>
        list.findIndex((candidate) => String(candidate.id) === String(meeting.id)) === index,
    )
    .map(toMeetingCard);

  return {
    meetings:
      path === '/meeting/my'
        ? meetings.filter(
            (meeting) =>
              (meeting.ownerId != null && String(meeting.ownerId) === String(userId)) ||
              meeting.owner === loginId ||
              isParticipatingMeeting(meeting),
          )
        : meetings,
  };
}

export async function loadMeetingDetailPage({ selectedId, demoScope }) {
  const localMeetings = asArray(readDemoValue('meetings', [], demoScope));
  const localMeeting = localMeetings.find((meeting) => String(meeting.id) === String(selectedId));
  if (localMeeting && !localMeeting._apiBacked) {
    return {
      meeting: toMeetingCard(localMeeting),
      membership: null,
      announcement: readDemoValue('meeting.announcement', {}, demoScope),
      notices: [],
      members: asArray(readDemoValue('meeting.members', [], demoScope)).map(toMeetingMember),
    };
  }

  const [remoteMeeting, remoteMembers, membership, noticePage] = await Promise.all([
    meetingApi.get(selectedId),
    loadApiOrEmpty(() => meetingApi.members(selectedId)),
    meetingApi.membership(selectedId).catch((error) => {
      if (error?.status === 404) return null;
      throw error;
    }),
    loadApiOrEmpty(() => meetingApi.notices(selectedId)),
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
    ...(localMeeting ?? {}),
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
