'use strict';
/*
 * Account UI controller for The Motor Trade (static GitHub Pages edition).
 * Account saves and guest saves have independent localStorage keys. Switching
 * between them is explicit, never a silent overwrite or automatic migration.
 */
(() => {
  const CLOUD = window.MotorTradeCloud;
  const SAVES = window.MotorTradeCareerStorage;
  const $ = id => document.getElementById(id);
  let app = null;
  let user = null;
  let cloudReady = false;
  let serviceMessage = 'Checking the account service…';
  let record = null;
  let fetching = false;
  let activeAccount = null;
  let revision = 0;
  let authMode = 'signin';
  let recovery = false;
  let open = false;
  let busy = false;
  let feedback = '';
  let syncMessage = '';
  let queued = null;
  let syncing = false;
  let syncBlocked = false;
  let conflict = false;
  let syncPromise = null;

  function errorText(error) {
    return String(error?.message || error || 'An unexpected error occurred.')
      .slice(0, 300);
  }
  function showFeedback(message) {feedback=message;renderUI();}
  function isCloudMode() {return !!(activeAccount && user?.id === activeAccount);}
  function showAccountPanel() {
    open=true;
    app?.showMenu();
    renderUI();
  }
  function renderUI() {
    if (!app) return;
    $('cloud-account-panel').hidden=!open;
    $('menu-account-toggle').setAttribute('aria-expanded',String(open));
    $('menu-account-toggle').querySelector?.('strong')?.replaceChildren?.(
      document.createTextNode(user ? 'MY CLOUD ACCOUNT' : 'PLAYER ACCOUNT')
    );
    $('cloud-service-message').textContent=serviceMessage;
    $('cloud-auth-guest').hidden=!cloudReady || !!user || recovery;
    $('cloud-auth-user').hidden=!cloudReady || !user || recovery;
    $('cloud-password-recovery').hidden=!cloudReady || !recovery;
    $('cloud-username-field').hidden=authMode!=='signup';
    $('cloud-password-field').hidden=authMode==='reset';
    $('cloud-username').required=authMode==='signup';
    $('cloud-password').required=authMode!=='reset';
    $('cloud-auth-submit').textContent=authMode==='signup'?'CREATE ACCOUNT':
      authMode==='reset'?'SEND RESET LINK':'SIGN IN';
    $('cloud-mode-signin').setAttribute('aria-pressed',String(authMode==='signin'));
    $('cloud-mode-signup').setAttribute('aria-pressed',String(authMode==='signup'));
    $('cloud-forgot').textContent=authMode==='reset'?'Back to sign in':'Forgot password?';
    $('cloud-auth-submit').disabled=busy;
    $('cloud-account-feedback').hidden=!feedback;
    $('cloud-account-feedback').textContent=feedback;

    if(user) {
      const display=String(user.user_metadata?.username || user.email || 'PLAYER');
      $('cloud-user-display').textContent=display;
      $('cloud-career-summary').textContent=fetching?'Checking your account career…':
        record?'CLOUD: '+record.career.name+' · DAY '+record.career.day+
          ' · Saved '+new Date(record.updated_at).toLocaleString('en-GB'):
          'No cloud career saved yet. Start a guest career, then upload it to this account.';
      $('cloud-load-career').hidden=!record;
      $('cloud-load-career').disabled=busy || fetching;
      $('cloud-load-career').textContent=isCloudMode()?'RELOAD CLOUD CAREER':'LOAD CLOUD CAREER';
      $('cloud-upload-career').hidden=!!record || !app.getCareer() || isCloudMode();
      $('cloud-upload-career').disabled=busy || fetching;
      $('cloud-signout').disabled=busy;
      $('cloud-save-status').textContent=isCloudMode()
        ? (syncMessage || 'Cloud career active. Changes save automatically to your account.')
        : 'Guest mode is active. This device\'s career is not yet linked to cloud saves.';
    }
    const hud=$('cloud-career-warning');
    if(hud) {
      const warning=isCloudMode()?syncMessage:
        (user && app.getCareer()?'You are playing a local guest career. Upload it from PLAYER ACCOUNT to use cloud saves.':'');
      hud.textContent=warning;
      hud.hidden=!warning;
    }
  }
  function switchAuthMode(mode) {
    authMode=mode;
    feedback='';
    $('cloud-password').value='';
    renderUI();
  }
  async function refreshRecord() {
    if(!cloudReady || !user) return;
    const identity=user.id;
    fetching=true;renderUI();
    try {
      const fetched=await CLOUD.getCareer();
      if(user?.id!==identity)return;
      if(fetched && !app.normalize(fetched.career))
        throw new Error('The cloud career did not pass game integrity validation. It was not loaded.');
      record=fetched;
    }catch(error) {
      if(user?.id===identity) {
        feedback='Unable to read cloud career: '+errorText(error)+
          ' No local career has been overwritten.';
      }
    }finally {fetching=false;renderUI();}
  }
  async function signedIn(newUser) {
    if(!newUser)return;
    if(user?.id!==newUser.id) record=null;
    user=newUser;
    cloudReady=true;
    serviceMessage='Signed in. Cloud careers are stored against your account.';
    await refreshRecord();
  }
  function returnToGuest(message) {
    activeAccount=null;
    revision=0;
    queued=null;
    syncing=false;
    syncBlocked=false;
    conflict=false;
    syncPromise=null;
    syncMessage='';
    SAVES.setNamespace(null);
    const restored=SAVES.load(app.normalize);
    app.setCareer(restored.career,message||'Returned to your separate guest career.');
  }
  async function loggedOut() {
    user=null;
    record=null;
    recovery=false;
    if(activeAccount) returnToGuest('Signed out. Your guest save is available separately.');
    feedback='Signed out. Guest careers remain on this browser.';
    renderUI();
  }
  async function handleAuth(event, nextUser) {
    if(event==='PASSWORD_RECOVERY') {
      user=nextUser;
      recovery=true;
      open=true;
      feedback='Enter a new account password below.';
      app.showMenu();
      renderUI();
    } else if(event==='SIGNED_OUT') {
      await loggedOut();
    } else if(event==='SIGNED_IN' && nextUser && cloudReady) {
      if(user?.id!==nextUser.id) await signedIn(nextUser);
      else {user=nextUser;renderUI();}
    } else if(event==='USER_UPDATED' && nextUser) {
      user=nextUser;renderUI();
    }
  }
  async function submitAuth(event) {
    event.preventDefault();
    if(busy || !cloudReady)return;
    const email=$('cloud-email').value.trim();
    const password=$('cloud-password').value;
    const username=$('cloud-username').value.trim();
    if(authMode==='signup' && !/^[A-Za-z0-9_-]{3,20}$/.test(username)) {
      showFeedback('Username must be 3–20 letters, numbers, underscores or dashes.');
      return;
    }
    busy=true;feedback='';renderUI();
    try {
      if(authMode==='reset') {
        await CLOUD.resetPassword(email);
        feedback='If this email belongs to an account, a reset link has been requested. Check your inbox.';
        authMode='signin';
      } else if(authMode==='signup') {
        if(password.length<8)throw new Error('Use a password with at least 8 characters.');
        const result=await CLOUD.signUp(email,password,username);
        feedback=result.needsConfirmation
          ? 'Account requested. Check your email and follow the confirmation link, then sign in.'
          : 'Account created. Your existing guest career is still separate until uploaded.';
        authMode='signin';
      } else {
        await signedIn(await CLOUD.signIn(email,password));
        feedback='Signed in. Select LOAD CLOUD CAREER, or upload your guest career if there is no cloud save.';
      }
      $('cloud-password').value='';
    }catch(error){feedback=errorText(error);}
    finally{busy=false;renderUI();}
  }
  async function updatePassword(event) {
    event.preventDefault();
    if(busy || !recovery)return;
    busy=true;feedback='';renderUI();
    try {
      const password=$('cloud-new-password').value;
      if(password.length<8)throw new Error('Use a password with at least 8 characters.');
      await CLOUD.updatePassword(password);
      $('cloud-new-password').value='';
      recovery=false;
      feedback='Password updated. You are signed in.';
      if(user)await refreshRecord();
    }catch(error){feedback=errorText(error);}
    finally{busy=false;renderUI();}
  }
  async function loadCloud() {
    if(!user || busy)return;
    busy=true;feedback='';renderUI();
    const prior=activeAccount;
    try {
      const live=await CLOUD.getCareer();
      if(!live)throw new Error('No cloud career exists for this account.');
      const career=app.normalize(live.career);
      if(!career)throw new Error('Cloud data failed integrity checks. Nothing has been loaded.');
      const current=app.getCareer();
      if(current && !window.confirm('Load "'+career.name+'" from cloud (Day '+career.day+')? '+
        'Your current device career will remain in its separate guest/account backup, but any '+
        'unuploaded changes on this device will not be in the cloud version. Export a backup first if unsure.'))return;
      if(prior && prior!==user.id)throw new Error('Sign out before switching accounts.');
      SAVES.setNamespace(user.id);
      const local=SAVES.load(app.normalize);
      if(local.career && JSON.stringify(local.career)!==JSON.stringify(career) &&
        !window.confirm('This device also contains a different local account save. '+
          'Replacing it with the cloud version could discard unsynced progress. Export it first. Continue?')) {
        SAVES.setNamespace(prior);
        SAVES.load(app.normalize);
        return;
      }
      const saved=SAVES.save(career,app.normalize,{force:true,backupPrevious:true});
      activeAccount=user.id;
      revision=Number(live.revision);
      record=live;
      queued=null;syncBlocked=false;conflict=false;
      syncMessage=saved.ok?'Cloud career loaded. Auto-save is active.':
        'Cloud career loaded, but local device backup failed: '+saved.message;
      app.setCareer(career,'Loaded your account career. Progress will auto-save to cloud.');
    }catch(error){feedback=errorText(error);}
    finally{busy=false;renderUI();}
  }
  async function uploadGuest() {
    if(!user || busy || isCloudMode())return;
    const source=app.getCareer();
    const career=source && app.normalize(source);
    if(!career){showFeedback('Start a career first; there is no valid local career to upload.');return;}
    if(!window.confirm('Upload "'+career.name+'" (Day '+career.day+') to this account? '+
      'Your guest career will remain on this device as a separate copy.'))return;
    busy=true;feedback='';renderUI();
    try {
      const remote=await CLOUD.getCareer();
      if(remote) {
        record=remote;
        throw new Error('This account already has a cloud career. No overwrite was performed. '+
          'Load your cloud career or export the guest save first.');
      }
      const written=await CLOUD.saveCareer(career,0);
      record={career,revision:written.revision,updated_at:written.updatedAt};
      SAVES.setNamespace(user.id);
      SAVES.load(app.normalize);
      const stored=SAVES.save(career,app.normalize,{force:true,backupPrevious:true});
      activeAccount=user.id;
      revision=written.revision;
      queued=null;syncBlocked=false;conflict=false;
      syncMessage=stored.ok?'Career uploaded. Automatic cloud saving is now active.':
        'Career uploaded to cloud, but device backup failed: '+stored.message;
      app.setCareer(career,'Career linked to your account. You can now resume on another device.');
    }catch(error){feedback=errorText(error);}
    finally{busy=false;renderUI();}
  }
  async function signOut() {
    if(!user || busy)return;
    if(isCloudMode()) {
      if(syncPromise)await syncPromise;
      if((queued || syncBlocked) &&
        !window.confirm('Some changes have NOT reached the cloud. '+
          'They will remain in this browser\'s account-only backup, but another device will not see them. Sign out anyway?'))
        return;
    }
    busy=true;renderUI();
    try {
      await CLOUD.signOut();
      await loggedOut();
    }catch(error){feedback=errorText(error);}
    finally{busy=false;renderUI();}
  }
  async function performSync() {
    if(syncing || !isCloudMode() || syncBlocked)return;
    syncing=true;
    const identity=activeAccount;
    try {
      while(queued && identity===activeAccount && user?.id===identity) {
        const snapshot=queued;
        queued=null;
        syncMessage='Saving to cloud…';renderUI();
        try {
          const updated=await CLOUD.saveCareer(snapshot,revision);
          if(activeAccount!==identity)return;
          revision=updated.revision;
          record={career:snapshot,revision,updated_at:updated.updatedAt};
          syncMessage='Cloud saved · '+new Date(updated.updatedAt).toLocaleTimeString('en-GB');
        }catch(error) {
          if(activeAccount!==identity)return;
          queued=queued || snapshot;
          syncBlocked=true;
          conflict=error.code==='CAREER_REVISION_CONFLICT';
          syncMessage=(conflict?'CLOUD CONFLICT — ':'CLOUD SAVE FAILED — ')+errorText(error)+
            (conflict?'':' Open PLAYER ACCOUNT to retry.');
          break;
        }
      }
    }finally {
      syncing=false;
      syncPromise=null;
      renderUI();
    }
  }
  function notifyCareerSaved(career) {
    if(!isCloudMode() || !app.normalize(career))return;
    queued=JSON.parse(JSON.stringify(career));
    if(!syncBlocked && !syncing) syncPromise=performSync();
    renderUI();
  }
  async function retryCloud() {
    if(!isCloudMode())return;
    if(conflict){showFeedback('A newer cloud revision exists. Export this local career, then load the cloud career.');return;}
    syncBlocked=false;
    if(queued && !syncing)syncPromise=performSync();
    renderUI();
  }
  function startGuestMode() {
    const previousAccount=activeAccount;
    if(previousAccount) {
      if((queued || syncing || syncBlocked) &&
        !window.confirm('Unsynced cloud changes may exist. Starting a separate guest career will '+
          'not upload these changes. Export the current account save before continuing.'))return false;
      activeAccount=null;
      revision=0;
      queued=null;
      syncBlocked=false;
      conflict=false;
      syncMessage='';
    }
    SAVES.setNamespace(null);
    SAVES.load(app.normalize);
    renderUI();
    return true;
  }
  function restoreAccountMode(id) {
    if(!id)return;
    SAVES.setNamespace(id);
    SAVES.load(app.normalize);
    activeAccount=id;
    renderUI();
  }
  async function boot(callbacks) {
    app=callbacks;
    document.addEventListener('click',event=>{
      const button=event.target.closest('[data-cloud-action]');
      if(!button)return;
      const action=button.dataset.cloudAction;
      if(!action)return;
      if(action==='toggle-account'){open=!open;renderUI();}
      else if(action==='open-account')showAccountPanel();
      else if(action==='signin-mode')switchAuthMode('signin');
      else if(action==='signup-mode')switchAuthMode('signup');
      else if(action==='forgot-password')switchAuthMode(authMode==='reset'?'signin':'reset');
      else if(action==='load-cloud')void loadCloud();
      else if(action==='upload-guest')void uploadGuest();
      else if(action==='signout')void signOut();
      else if(action==='retry-cloud')void retryCloud();
    });
    $('cloud-auth-form').addEventListener('submit',event=>{void submitAuth(event);});
    $('cloud-recovery-form').addEventListener('submit',event=>{void updatePassword(event);});
    CLOUD?.onAuth((event,nextUser)=>handleAuth(event,nextUser));
    if(typeof window.addEventListener==='function')
      window.addEventListener('online',()=>{if(syncBlocked && !conflict)void retryCloud();});
    renderUI();
    const state=await (CLOUD?.initialise?.() || Promise.resolve({
      ready:false,error:'Cloud library is unavailable; continue as a guest.'}));
    cloudReady=state.ready;
    serviceMessage=cloudReady?'Account service connected. Guest careers remain separate.':
      state.error;
    if(cloudReady && state.user)await signedIn(state.user);
    renderUI();
  }

  window.MotorTradeAccountUI=Object.freeze({
    boot,renderUI,notifyCareerSaved,startGuestMode,restoreAccountMode,
    isCloudMode,get activeAccount(){return activeAccount;},
    get status(){return syncMessage;}
  });
})();
