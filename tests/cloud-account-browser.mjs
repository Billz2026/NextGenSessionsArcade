import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const base='http://127.0.0.1:4173';
const guestKey='the-motor-trade-career-v1';
const ID='11111111-1111-4111-8111-111111111111';
const server={users:new Map(),careers:new Map()};
const browser=await chromium.launch({headless:true});
const errors=[];
async function backend(op,payload={}){
  switch(op){
    case 'signup': {
      const user={id:ID,email:payload.email,user_metadata:{username:payload.username}};
      server.users.set(payload.email,{user,password:payload.password});
      return {user};
    }
    case 'login': {
      const entry=server.users.get(payload.email);
      return entry?.password===payload.password?{user:entry.user}:null;
    }
    case 'read':
      return server.careers.get(payload.userId)||null;
    case 'write': {
      const row=server.careers.get(payload.userId);
      if(!payload.userId || payload.userId!==payload.expectedUserId)
        return {error:'Account session changed'};
      if(row && row.revision!==payload.revision)return {conflict:true};
      if(!row && payload.revision!==0)return {conflict:true};
      const updated={career:payload.career,revision:(row?.revision||0)+1,
        updated_at:new Date().toISOString()};
      server.careers.set(payload.userId,updated);
      return {row:updated};
    }
    default:throw new Error('Unknown test operation '+op);
  }
}
async function context(){
  const ctx=await browser.newContext({viewport:{width:1440,height:900}});
  await ctx.exposeFunction('__motorTradeTestBackend',backend);
  await ctx.route('**/supabase.min.js',route=>route.fulfill({
    status:200,contentType:'application/javascript',body:'/* auth test injected by context */'
  }));
  await ctx.addInitScript(() => {
    const getUser=()=>{
      try{return JSON.parse(localStorage.getItem('__fake_auth_player')||'null');}
      catch{return null;}
    };
    const listeners=[];
    const emit=(event,user)=>{for(const fn of listeners)fn(event,user?{user}:null);};
    const client={
      auth:{
        onAuthStateChange(fn){listeners.push(fn);return {data:{subscription:{unsubscribe(){}}}};},
        async getUser(){return {data:{user:getUser()},error:null};},
        async signUp({email,password,options}){
          const result=await window.__motorTradeTestBackend('signup',{
            email,password,username:options?.data?.username
          });
          return {data:{user:result.user,session:null},error:null};
        },
        async signInWithPassword({email,password}){
          const result=await window.__motorTradeTestBackend('login',{email,password});
          if(!result)return {data:null,error:{message:'Invalid login credentials'}};
          localStorage.setItem('__fake_auth_player',JSON.stringify(result.user));
          emit('SIGNED_IN',result.user);
          return {data:{user:result.user},error:null};
        },
        async signOut(){
          localStorage.removeItem('__fake_auth_player');emit('SIGNED_OUT',null);
          return {error:null};
        },
        async resetPasswordForEmail(){return {data:{},error:null};},
        async updateUser(){return {data:{},error:null};}
      },
      async rpc(name,args){
        if(name==='motor_trade_cloud_ready')return {data:true,error:null};
        if(name==='motor_trade_save_career'){
          const result=await window.__motorTradeTestBackend('write',{
            userId:getUser()?.id,expectedUserId:args.expected_user_id,
            revision:args.expected_revision,career:args.new_career
          });
          if(result.error)return {data:null,error:{message:result.error}};
          if(result.conflict)return {data:[],error:null};
          return {data:[{revision:result.row.revision,updated_at:result.row.updated_at}],error:null};
        }
        return {data:null,error:{message:'Unknown RPC'}};
      },
      from(table){
        if(table!=='motor_trade_careers')throw new Error('Unknown table');
        return {select(){
          return {eq(){
            return {async maybeSingle(){
              const result=await window.__motorTradeTestBackend('read',{userId:getUser()?.id});
              return {data:result,error:null};
            }};
          }};
        }};
      }
    };
    window.supabase={createClient:()=>client};
  });
  const page=await ctx.newPage();
  page.on('pageerror',e=>errors.push(e.stack||e.message));
  page.on('dialog',d=>d.accept());
  return {ctx,page};
}
async function eventually(check,label){
  for(let i=0;i<70;i++){
    if(check())return;
    await new Promise(r=>setTimeout(r,100));
  }
  throw new Error('Timed out: '+label);
}
async function signIn(page){
  await page.locator('#menu-account-toggle').click();
  await page.locator('#cloud-auth-form').waitFor({state:'visible'});
  await page.locator('#cloud-email').fill('tester@example.com');
  await page.locator('#cloud-password').fill('securePassword123');
  await page.locator('#cloud-auth-submit').click();
  await page.locator('#cloud-auth-user').waitFor({state:'visible'});
}
try{
  const first=await context();
  const p1=first.page;
  await p1.goto(base+'/',{waitUntil:'domcontentloaded'});
  await p1.locator('#menu-new-career').click();
  await p1.locator('#dealership-name').fill('Guest Test Motors');
  await p1.locator('.setup-submit').click();
  await p1.locator('#screen-career').waitFor({state:'visible'});
  assert.equal(await p1.evaluate(k=>JSON.parse(localStorage.getItem(k)).day,guestKey),1);
  await p1.locator('[data-cloud-action="open-account"]').click();
  await p1.locator('#cloud-auth-form').waitFor({state:'visible'});
  await p1.locator('#cloud-mode-signup').click();
  await p1.locator('#cloud-username').fill('Tester');
  await p1.locator('#cloud-email').fill('tester@example.com');
  await p1.locator('#cloud-password').fill('securePassword123');
  await p1.locator('#cloud-auth-submit').click();
  await p1.getByText('Check your email').first().waitFor({state:'visible'});
  await p1.locator('#cloud-password').fill('securePassword123');
  await p1.locator('#cloud-auth-submit').click();
  await p1.locator('#cloud-auth-user').waitFor({state:'visible'});
  await p1.locator('#cloud-upload-career').waitFor({state:'visible'});
  await p1.locator('#cloud-upload-career').click();
  await p1.locator('#screen-career').waitFor({state:'visible'});
  await eventually(()=>server.careers.get(ID)?.career?.day===1,'guest career upload');
  assert.equal(await p1.evaluate(k=>JSON.parse(localStorage.getItem(k)).day,guestKey),1,
    'Guest career is not erased when uploaded');
  await p1.locator('#continue-day').click();
  await eventually(()=>server.careers.get(ID)?.career?.day===2,'first device day 2 cloud save');

  const second=await context();
  const p2=second.page;
  await p2.goto(base+'/',{waitUntil:'domcontentloaded'});
  await signIn(p2);
  await p2.locator('#cloud-load-career').waitFor({state:'visible'});
  await p2.locator('#cloud-load-career').click();
  await p2.locator('#screen-career').waitFor({state:'visible'});
  assert.match(await p2.locator('[data-bind="day-label"]').first().textContent(),/DAY 02/);
  await p2.locator('#continue-day').click();
  await eventually(()=>server.careers.get(ID)?.career?.day===3,'second device day 3 cloud save');
  const serverRevision=server.careers.get(ID).revision;

  // The first device still holds day 2. It must NOT overwrite day 3.
  await p1.locator('#continue-day').click();
  await p1.locator('#cloud-career-warning').getByText('CLOUD CONFLICT', {exact:false})
    .waitFor({state:'visible',timeout:15000}).catch(async()=>{
      await p1.waitForFunction(()=>document.getElementById('cloud-career-warning')
        .textContent.includes('CLOUD CONFLICT'));
    });
  assert.equal(server.careers.get(ID).revision,serverRevision,
    'Out-of-date device did not overwrite newer cloud revision');
  assert.equal(server.careers.get(ID).career.day,3);

  await p2.locator('[data-cloud-action="open-account"]').click();
  await p2.locator('#cloud-signout').click();
  await p2.locator('#cloud-auth-guest').waitFor({state:'visible'});
  assert.equal(await p2.evaluate(k=>localStorage.getItem(k),guestKey),null,
    'Signed-out device must not expose another account career as guest');

  await p1.locator('[data-cloud-action="open-account"]').click();
  await p1.locator('#cloud-signout').click();
  await p1.locator('#screen-career').waitFor({state:'visible'});
  await p1.waitForFunction(()=>document.getElementById('cloud-auth-user').hidden);
  assert.equal(await p1.evaluate(k=>JSON.parse(localStorage.getItem(k)).day,guestKey),1,
    'Signing out returns the original guest career');
  assert.equal(server.careers.get(ID).career.day,3);
  assert.deepEqual(errors,[]);
  console.log('CLOUD_ACCOUNT_BROWSER_PASS — registration, login, upload, cross-device resume, revision conflicts, logout and guest isolation');
  await first.ctx.close();
  await second.ctx.close();
} finally {
  await browser.close();
}
