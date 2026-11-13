import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

const root=new URL('../',import.meta.url);
const js=readFileSync(new URL('cloud-careers.js',root),'utf8');
const config=readFileSync(new URL('cloud-config.js',root),'utf8');
const sql=readFileSync(new URL('supabase/20261113_player_accounts.sql',root),'utf8');
const ID='11111111-1111-4111-8111-111111111111';

function harness({ready=true}={}){
  let currentUser=null;
  let row=null;
  const seen=[];
  const user={id:ID,email:'player@example.com',user_metadata:{username:'Tester'}};
  const client={
    auth:{
      onAuthStateChange(){return {data:{subscription:{unsubscribe(){}}}};},
      async getUser(){return {data:{user:currentUser},error:null};},
      async signInWithPassword({email,password}){
        if(email!==user.email||password!=='veryStrongPassword')
          return {data:null,error:{message:'Invalid credentials'}};
        currentUser=user;
        return {data:{user},error:null};
      },
      async signUp({email,password,options}){
        seen.push(['signup',email,password,options]);
        return {data:{user,session:null},error:null};
      },
      async signOut(){currentUser=null;return {error:null};},
      async resetPasswordForEmail(email,options){
        seen.push(['reset',email,options]);return {error:null};
      },
      async updateUser({password}){
        seen.push(['update',password]);return {error:null};
      }
    },
    async rpc(method,args){
      if(method==='motor_trade_cloud_ready')
        return ready?{data:true,error:null}:{data:null,error:{message:'missing'}};
      if(method!=='motor_trade_save_career')throw Error('Unexpected RPC '+method);
      seen.push(['write',args]);
      if(!currentUser || args.expected_user_id!==currentUser.id)
        return {data:null,error:{message:'Account mismatch'}};
      if(row && row.revision!==args.expected_revision)return {data:[],error:null};
      if(!row && args.expected_revision!==0)return {data:[],error:null};
      const revision=(row?.revision||0)+1;
      row={career:args.new_career,revision,updated_at:'2026-11-13T16:10:00Z'};
      return {data:[{revision,updated_at:row.updated_at}],error:null};
    },
    from(table){
      assert.equal(table,'motor_trade_careers');
      return {
        select(columns){
          assert.equal(columns,'career,revision,updated_at');
          return {eq(field,value){
            assert.equal(field,'user_id');
            assert.equal(value,currentUser?.id);
            return {async maybeSingle(){return {data:row,error:null};}};
          }};
        }
      };
    }
  };
  const window={supabase:{createClient:(url,key,options)=>{
    assert.match(url,/^https:\/\//);
    assert.match(key,/^sb_publishable_/);
    assert.equal(options.auth.persistSession,true);
    return client;
  }}};
  vm.runInNewContext(config,{window});
  vm.runInNewContext(js,{window,console,Promise,Date});
  return {api:window.MotorTradeCloud,seen,getRow:()=>row};
}

test('public config includes publishable key only, never privileged credentials',()=>{
  assert.match(config,/sb_publishable_/);
  assert.doesNotMatch(config,/['"](?:sb_secret_|service_role|postgresql:\/\/)/);
  assert.match(config,/ebzkyflbvfzqheslssis/);
});

test('SQL enforces owner-only RLS and atomic account-bound RPC saves',()=>{
  assert.match(sql,/enable row level security/i);
  assert.match(sql,/grant select on table public\.motor_trade_careers to authenticated/i);
  assert.match(sql,/revoke all on table public\.motor_trade_careers from public, anon, authenticated/i);
  assert.match(sql,/auth\.uid\(\)/);
  assert.match(sql,/expected_user_id is distinct from actor/);
  assert.match(sql,/where existing\.revision = expected_revision/);
  assert.match(sql,/security definer/i);
  assert.match(sql,/grant execute on function public\.motor_trade_save_career\(uuid,bigint,jsonb\)\s+to authenticated/);
  assert.doesNotMatch(sql,/grant (insert|update|delete|all) on table public\.motor_trade_careers to authenticated/i);
});

test('account signup, login, read, save and optimistic revision protection',async()=>{
  const {api,seen,getRow}=harness();
  const initial=await api.initialise();
  assert.equal(initial.ready,true);
  assert.equal(initial.user,null);
  const signup=await api.signUp('player@example.com','veryStrongPassword','Tester');
  assert.equal(signup.needsConfirmation,true);
  const user=await api.signIn('player@example.com','veryStrongPassword');
  assert.equal(user.id,ID);
  assert.equal(api.currentUser.id,ID);
  assert.equal(await api.getCareer(),null);
  const first={version:14,name:'Test Motors',day:1,cash:12500,ledger:[]};
  const saved=await api.saveCareer(first,0,ID);
  assert.equal(saved.revision,1);
  assert.equal((await api.getCareer()).career.name,'Test Motors');
  const second={...first,day:2};
  assert.equal((await api.saveCareer(second,1,ID)).revision,2);
  assert.equal(getRow().career.day,2);
  await assert.rejects(api.saveCareer({...first,day:3},1,ID),err=>err.code==='CAREER_REVISION_CONFLICT');
  assert.equal(getRow().career.day,2);
  assert.equal(seen.filter(a=>a[0]==='write').length,3);
  await assert.rejects(api.saveCareer(first,2,'22222222-2222-4222-8222-222222222222'), error=>error.message==='Account mismatch');
  await api.resetPassword('player@example.com');
  await api.updatePassword('newStrongPassword');
  await api.signOut();
  assert.equal(api.currentUser,null);
});

test('client stays disabled until the server-side readiness migration exists',async()=>{
  const {api}=harness({ready:false});
  const state=await api.initialise();
  assert.equal(state.ready,false);
  await assert.rejects(api.signIn('a','b'),/not ready/);
});
