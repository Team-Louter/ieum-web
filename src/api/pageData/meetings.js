import { meetingApi } from '../client';
import { toMeetingCard } from '../adapters';
import { readDemoValue } from '../demoStore';
import { asArray, loadApiOrEmpty } from './common';

export async function loadMeetingListPage({ path, demoScope, loginId }) {
  const remoteMeetings = asArray(await loadApiOrEmpty(() => meetingApi.list()));
  const localMeetings = asArray(readDemoValue('meetings', [], demoScope));

  const meetings = [...localMeetings, ...remoteMeetings]
    .filter((meeting, index, list) => list.findIndex((candidate) => (
      String(candidate.id) === String(meeting.id)
    )) === index)
    .map(toMeetingCard);

  return {
    meetings: path === '/meeting/my'
      ? meetings.filter((meeting) => meeting.owner === loginId)
      : meetings,
  };
}

export async function loadMeetingDetailPage({ selectedId, demoScope }) {
  const localMeetings = asArray(readDemoValue('meetings', [], demoScope));
  const localMeeting = localMeetings.find((meeting) => String(meeting.id) === String(selectedId));
  const meeting = toMeetingCard(localMeeting ?? await meetingApi.get(selectedId));

  return { meeting, announcement: null, members: [] };
}
