import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
const server = await createServer({server:{middlewareMode:true,hmr:false},appType:'custom'});
after(() => server.close());
const claims = Buffer.from(JSON.stringify({sub:'membership-test',id:1,exp:Math.floor(Date.now()/1000)+300})).toString('base64url');
globalThis.window = {localStorage:{getItem:(key)=>key==='ieum.accessToken'?`test.${claims}.test`:null},atob:(s)=>Buffer.from(s,'base64').toString('binary')};
const {loadMeetingListPage} = await server.ssrLoadModule('/src/api/pageData/meetings.js');
const {default:createMeetingActions} = await server.ssrLoadModule('/src/app/useMeetingActions.js');
test('my meetings requests pending memberships and preserves owner/joined/pending states', async () => {
 let requested;
 globalThis.fetch = async (url) => {
  requested=url;
  return new Response(JSON.stringify([{id:1,name:'created',membershipStatus:'OWNER'},{id:2,name:'joined',membershipStatus:'JOINED'},{id:3,name:'waiting',membershipStatus:'PENDING'}]));
 };
 const data=await loadMeetingListPage({path:'/meeting/my'});
 assert.match(requested,/\/meetings\/my\?includePending=true$/);
 assert.deepEqual(data.meetings.map(m=>m.membershipStatus),['OWNER','JOINED','PENDING']);
});
test('failed creation does not navigate to an empty list as if it succeeded', async () => {
 let navigated=false;
 globalThis.fetch=async()=>new Response('생성 실패',{status:500});
 const actions=createMeetingActions({runAction:async fn=>fn(),movePage:()=>{navigated=true;}});
 await assert.rejects(()=>actions.createMeeting({title:'test'}));
 assert.equal(navigated,false);
});
test('join sends authenticated bodyless request and distinguishes pending from joined', async () => {
 for(const state of ['JOINED','PENDING']) {
  let message;
  globalThis.fetch=async(url,options)=>{
   assert.match(url,/\/meetings\/12\/join$/);
   assert.equal(options.method,'POST');
   assert.match(options.headers.get('Authorization'),/^Bearer /);
   return new Response(JSON.stringify({membershipStatus:state}));
  };
  const actions=createMeetingActions({runAction:async(fn,success)=>{const result=await fn();message=success(result);return result;},movePage:()=>{}});
  const result=await actions.joinMeeting(12);
  assert.equal(result.membershipStatus,state);
  assert.equal(message,state==='PENDING'?'모임 가입 신청을 보냈습니다.':'모임에 가입했습니다.');
 }
});
