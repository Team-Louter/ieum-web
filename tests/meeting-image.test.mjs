import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
const server=await createServer({server:{middlewareMode:true,hmr:false},appType:'custom'});
after(()=>server.close());
const claims=Buffer.from(JSON.stringify({sub:'image-test',id:1,exp:Math.floor(Date.now()/1000)+300})).toString('base64url');
globalThis.window={localStorage:{getItem:(key)=>key==='ieum.accessToken'?`test.${claims}.test`:null},atob:(s)=>Buffer.from(s,'base64').toString('binary')};
const { default: createMeetingActions }=await server.ssrLoadModule('/src/app/useMeetingActions.js');
const calls=[];let navigation;
globalThis.fetch=async(url,options)=>{calls.push({url,options});return new Response(JSON.stringify({id:22,imageUrl:'https://api.ieum.louter.site/uploads/images/test.png'}),{status:200});};
const actions=createMeetingActions({runAction:async(action)=>action(),movePage:(path)=>{navigation=path;}});
test('meeting image creates multipart request and navigates only after server success',async()=>{
 const file=new File(['image'],'photo.png',{type:'image/png'});
 await actions.createMeeting({title:'등산 모임',description:'소개',region:'대구',image:file});
 const call=calls.at(-1);assert.equal(call.options.method,'POST');assert.ok(call.options.body instanceof FormData);
 assert.equal(call.options.headers.has('Content-Type'),false);
 assert.equal(call.options.body.get('file').name,'photo.png');
 const request=JSON.parse(await call.options.body.get('request').text());assert.equal(request.name,'등산 모임');assert.equal(request.owner,undefined);assert.equal(navigation,'/meeting/my');
});
test('meeting update uploads a replacement image with PUT',async()=>{
 await actions.updateMeeting({id:22,name:'before',description:'소개',region:'대구'},{title:'after',image:new File(['image'],'new.png',{type:'image/png'})});
 assert.equal(calls.at(-1).options.method,'PUT');assert.match(calls.at(-1).url,/meetings\/22$/);assert.ok(calls.at(-1).options.body instanceof FormData);
});
test('invalid image is rejected before a network request',async()=>{
 const count=calls.length;await assert.rejects(()=>actions.createMeeting({image:new File(['gif'],'photo.gif',{type:'image/gif'})}),/JPEG/);assert.equal(calls.length,count);
});
test('meeting without image keeps the existing JSON API',async()=>{
 await actions.createMeeting({title:'사진 없음',description:'소개',region:'대구'});assert.equal(calls.at(-1).options.headers.get('Content-Type'),'application/json');assert.equal(JSON.parse(calls.at(-1).options.body).name,'사진 없음');
});
