'use strict';
/* The Motor Trade — Supabase client, authenticated cloud saves and revision CAS.
 * Guest gameplay stays functional when Supabase/CDN/database is unavailable.
 * All cloud writes use the SQL RPC, never direct table UPDATEs.
 */
(() => {
  const configuration = window.MotorTradeCloudConfig || {};
  const factory = window.supabase?.createClient;
  const available = !!(factory && /^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(configuration.url||'') &&
    /^sb_publishable_/.test(configuration.publishableKey||''));
  const client = available ? factory(configuration.url, configuration.publishableKey, {
    auth: {
      storageKey:'the-motor-trade-account-session-v1',
      persistSession:true, autoRefreshToken:true, detectSessionInUrl:true,
      flowType:'pkce'
    }
  }) : null;
  let ready = false;
  let lastUser = null;
  const listeners = new Set();

  function notice(event, user) {
    lastUser = user || null;
    for (const fn of listeners) {
      // Defer any other Supabase calls to avoid auth callback deadlocks.
      Promise.resolve().then(() => fn(event,lastUser)).catch(console.warn);
    }
  }
  if (client) client.auth.onAuthStateChange((event,session) => {
    if (event === 'SIGNED_OUT') notice('SIGNED_OUT',null);
    else if (event === 'PASSWORD_RECOVERY') notice('PASSWORD_RECOVERY',session?.user||null);
    else if (event === 'SIGNED_IN' || event === 'USER_UPDATED') notice(event,session?.user||null);
  });

  async function initialise() {
    if (!client) return {ready:false,user:null,
      error:'Account service could not load. Guest careers are still available.'};
    try {
      const probe = await client.rpc('motor_trade_cloud_ready');
      if (probe.error || probe.data !== true) return {
        ready:false, user:null,
        error:'Cloud database setup is incomplete. The owner must run the Supabase SQL setup first.'
      };
      ready = true;
      const {data,error} = await client.auth.getUser();
      if (error && !/session missing/i.test(error.message || '')) {
        return {ready:true,user:null,error:'Unable to verify the current login.'};
      }
      lastUser = data?.user || null;
      return {ready:true,user:lastUser};
    } catch (_) {
      return {ready:false,user:null,
        error:'Cloud service could not be reached. Guest careers are still available.'};
    }
  }

  function ensureReady() {
    if(!ready || !client) throw new Error('Cloud account service is not ready.');
  }
  async function signIn(email,password) {
    ensureReady();
    const {data,error}=await client.auth.signInWithPassword({email,password});
    if(error)throw error;
    lastUser=data.user || null;
    return lastUser;
  }
  async function signUp(email,password,username) {
    ensureReady();
    const {data,error}=await client.auth.signUp({
      email,password,
      options:{
        data:{username},
        emailRedirectTo:configuration.redirectUrl
      }
    });
    if(error)throw error;
    // Confirmation may be required before a new account has a session.
    return {user:data.user||null, needsConfirmation:!data.session};
  }
  async function resetPassword(email) {
    ensureReady();
    const {error}=await client.auth.resetPasswordForEmail(email, {
      redirectTo:configuration.redirectUrl
    });
    if(error)throw error;
  }
  async function updatePassword(password) {
    ensureReady();
    const {error}=await client.auth.updateUser({password});
    if(error)throw error;
  }
  async function signOut() {
    ensureReady();
    const {error}=await client.auth.signOut();
    if(error)throw error;
    lastUser=null;
  }
  async function getCareer() {
    ensureReady();
    const {data:userData,error:userError}=await client.auth.getUser();
    if(userError || !userData?.user)throw new Error('Please sign in again.');
    const {data,error}=await client.from('motor_trade_careers')
      .select('career,revision,updated_at')
      .eq('user_id',userData.user.id).maybeSingle();
    if(error)throw error;
    return data || null;
  }
  async function saveCareer(career,expectedRevision) {
    ensureReady();
    if(!Number.isSafeInteger(expectedRevision) || expectedRevision<0)
      throw new Error('Invalid cloud save revision.');
    const {data,error}=await client.rpc('motor_trade_save_career',{
      expected_revision:expectedRevision,
      new_career:career
    });
    if(error)throw error;
    const updated=Array.isArray(data)?data[0]:null;
    if(!updated || !Number.isSafeInteger(Number(updated.revision))) {
      const conflict=new Error(
        'Cloud save conflict: another device changed this career. Your local career remains intact. ' +
        'Export this device\'s career before loading the latest cloud version.'
      );
      conflict.code='CAREER_REVISION_CONFLICT';
      throw conflict;
    }
    return {revision:Number(updated.revision),updatedAt:updated.updated_at};
  }

  window.MotorTradeCloud = Object.freeze({
    available,initialise,onAuth:fn=>{listeners.add(fn);return ()=>listeners.delete(fn);},
    get currentUser(){return lastUser;},
    get ready(){return ready;},
    signIn,signUp,signOut,resetPassword,updatePassword,getCareer,saveCareer
  });
})();
