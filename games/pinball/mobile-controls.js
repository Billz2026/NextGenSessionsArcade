/* Keep the original pinball Start / Hold-to-launch button above the
   playfield on compact devices. This script runs after the HTML is parsed
   and moves the EXISTING node, retaining game.mjs pointer listeners. */
(()=>{
 const panel=document.getElementById('primary-action');
 const dock=document.getElementById('mobile-action-dock');
 const hud=document.querySelector('.hud.hud-v2');
 if(!panel||!dock||!hud)return;
 const marker=document.createComment('Neon Tilt desktop action position');
 hud.insertBefore(marker,panel);
 function position(){
  const compact=window.innerWidth<=1120;
  if(compact){
   if(panel.parentNode!==dock)dock.appendChild(panel);
  }else if(panel.parentNode!==hud){
   hud.insertBefore(panel,marker.nextSibling);
  }
 }
 window.addEventListener('resize',position,{passive:true});
 window.visualViewport?.addEventListener?.('resize',position,{passive:true});
 window.matchMedia('(max-width:1120px)').addEventListener?.('change',position);
 document.addEventListener('visibilitychange',position);
 position();
})();
