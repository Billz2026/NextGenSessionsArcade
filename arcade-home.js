'use strict';
// Public homepage. The ROM remains in the user-selected file inside the same-origin
// iframe under /lab/looping-browser/. No game binaries are served by this page.
const frame=document.getElementById('game-frame');
const machine=document.getElementById('arcade-machine');
const state=document.getElementById('cabinet-state');
const stateWrapper=document.querySelector('.machine-state');
const upperButton=document.getElementById('fullscreen-top');
const deckButton=document.getElementById('fullscreen-machine');
const resetButton=document.getElementById('reset-machine');
const messages=Object.freeze({
  'rom-ready':'ROM VERIFIED — PRESS LOAD',
  loading:'BOOTING ORIGINAL ARCADE',
  ready:'EMULATOR READY — PRESS START',
  playing:'CABINET RUNNING',
  error:'GAME LOADING PROBLEM'
});
window.addEventListener('message',event=>{
  // Do not accept cross-site or unrelated iframe messages.
  if(event.origin!==window.location.origin||event.source!==frame.contentWindow)return;
  const data=event.data;
  if(!data||data.channel!=='ngs-arcade'||!Object.prototype.hasOwnProperty.call(messages,data.type))return;
  state.textContent=messages[data.type];
  stateWrapper.dataset.state=data.type;
});
async function toggleFullscreen(){
  try{
    if(document.fullscreenElement===machine)await document.exitFullscreen();
    else if(document.fullscreenElement)await document.exitFullscreen();
    else await machine.requestFullscreen();
  }catch(error){
    state.textContent='FULLSCREEN UNAVAILABLE';
    stateWrapper.dataset.state='error';
    console.warn('Fullscreen unavailable',error);
  }
}
for(const button of [upperButton,deckButton])button.addEventListener('click',toggleFullscreen);
document.addEventListener('fullscreenchange',()=>{
  const active=document.fullscreenElement===machine;
  for(const button of [upperButton,deckButton]){
    button.setAttribute('aria-pressed',String(active));
    button.setAttribute('aria-label',active?'Exit arcade fullscreen':'Enter arcade fullscreen');
    button.innerHTML=active?'<span aria-hidden="true">⛶</span> EXIT FULLSCREEN':'<span aria-hidden="true">⛶</span> FULLSCREEN';
  }
});
resetButton.addEventListener('click',()=>{
  // Only reload the inner player; the public arcade page and machine stay put.
  frame.src='./lab/looping-browser/?embed=1&reset='+Date.now();
  state.textContent='INSERT YOUR ROM TO PLAY';
  delete stateWrapper.dataset.state;
});
