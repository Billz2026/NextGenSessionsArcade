'use strict';
/*
 * Looping (Europe) local-ROM browser test. This page serves no game ROMs.
 * All 14 chip sizes/checksums below are from the MAME 0.243 looping.cpp driver.
 * The file selector processes ZIP metadata in-browser, no unzip dependency.
 * The third-party emulator script runs in this origin and has access to the
 * locally selected file once the user explicitly chooses LOAD.
 */
const MAME_EXPECTED = Object.freeze({
  'loop551.bin':[4096,0xd6bb6db6],'loop552.bin':[4096,0xbc32956d],
  'loop553.bin':[4096,0x5f8b9aed],'loop554b.bin':[4096,0x381a9625],
  'loop555.bin':[4096,0x0ef4c922],'loop556.bin':[4096,0x3419a5d5],
  'loop557.bin':[4096,0xd430e287],'loopc13.bin':[4096,0xff9ac4ec],
  'loopa13.bin':[4096,0x1de29f25],'loopa11.bin':[4096,0x61c74c79],
  'cop.bin':[1024,0xd47fecec],'loopaa8.bin':[2048,0xef3284ac],
  'loopaa6.bin':[2048,0xc434c14c],'loopvp1.bin':[32,0x6a0c7d87]
});
const get = id => document.getElementById(id);
const rom = get('rom'), upload=get('drop-zone'), start=get('start');
let selected=null, launching=false, blobUrl=null, selectionToken=0;
function status(message,tone='info'){get('status').textContent=message;get('status').dataset.tone=tone;}
function checked(state,message){get('verification').dataset.state=state;get('verification').querySelector('b').textContent=message;}
function reset(){if(launching)return;selectionToken++;selected=null;rom.value='';start.disabled=true;get('selected').hidden=true;checked('','AWAITING FILE');status('Ready to inspect your ROM. No game has been loaded.');}
function readCentralDirectory(arrayBuffer) {
  const dv=new DataView(arrayBuffer);
  const len=dv.byteLength;
  let eocd=-1;
  for(let i=len-22;i>=Math.max(0,len-22-65535);i--) {
    if(dv.getUint32(i,true)===0x06054b50){eocd=i;break;}
  }
  if(eocd<0)throw Error('This file is not a valid ZIP archive.');
  const count=dv.getUint16(eocd+10,true),offset=dv.getUint32(eocd+16,true);
  if(count===0 || count>1000 || offset>=len)throw Error('Unsupported ZIP archive.');
  const chips=new Map();
  let pos=offset;
  const decode=new TextDecoder('utf-8');
  for(let i=0;i<count;i++){
    if(pos+46>len||dv.getUint32(pos,true)!==0x02014b50)throw Error('ZIP directory is damaged.');
    const crc=dv.getUint32(pos+16,true),size=dv.getUint32(pos+24,true);
    const flags=dv.getUint16(pos+8,true),n=dv.getUint16(pos+28,true);
    const extra=dv.getUint16(pos+30,true),comment=dv.getUint16(pos+32,true);
    if(flags & 1)throw Error('Password-protected ZIPs are not supported.');
    if(pos+46+n+extra+comment>len)throw Error('ZIP entry is incomplete.');
    const name=decode.decode(new Uint8Array(arrayBuffer,pos+46,n)).split('/').pop().toLowerCase();
    if(chips.has(name))throw Error('ZIP has duplicate chip filenames.');
    chips.set(name,[size,crc]);
    pos+=46+n+extra+comment;
  }
  return chips;
}
async function choose(file){
  if(launching||!file)return;
  reset();
  const token=selectionToken;
  if(!file.name.toLowerCase().endsWith('.zip')){status('Select the original looping.zip archive.','bad');checked('bad','WRONG FILE TYPE');return;}
  if(file.size<1000||file.size>8*1024*1024){status('File must be a ZIP smaller than 8 MB.','bad');checked('bad','SIZE INVALID');return;}
  try{
    checked('','VALIDATING 14 ROM CHIPS…');status('Checking the ZIP contents and expected MAME 0.243 checksums…');
    const chips=readCentralDirectory(await file.arrayBuffer());
    if(token!==selectionToken)return;
    const missing=[];
    for(const [name,expected] of Object.entries(MAME_EXPECTED)){
      const chip=chips.get(name);
      if(!chip||chip[0]!==expected[0]||chip[1]!==expected[1])missing.push(name);
    }
    if(missing.length){
      checked('bad','ROM SET MISMATCH');
      status('This is not the matching Looping (Europe) set. Missing or different: '+missing.join(', ')+'.','bad');
      return;
    }
    selected=file;
    get('chosen').textContent=file.name;
    get('rom-result').textContent='14 of 14 MAME 0.243 chips matched ('+(file.size/1024).toFixed(1)+' KB)';
    get('selected').hidden=false;
    checked('ok','14 / 14 ROM CHIPS PASS');
    start.disabled=false;
    status('ROM set verified. Press LOAD INTO ARCADE CABINET to try MAME in Chrome.','ok');
  }catch(e){if(token===selectionToken){checked('bad','ZIP VALIDATION FAILED');status(e.message||'Cannot read ZIP file.','bad');}}
}
rom.addEventListener('change',()=>choose(rom.files?.[0]));
get('remove').addEventListener('click',reset);
for(const type of ['dragenter','dragover'])upload.addEventListener(type,e=>{e.preventDefault();if(!launching)upload.classList.add('drag');});
for(const type of ['dragleave','drop'])upload.addEventListener(type,e=>{e.preventDefault();upload.classList.remove('drag');});
upload.addEventListener('drop',e=>{if(!launching)choose(e.dataTransfer?.files?.[0]);});
start.addEventListener('click',()=>{
  if(!selected||launching)return;
  launching=true;start.hidden=true;upload.style.pointerEvents='none';rom.disabled=true;get('remove').disabled=true;get('again').hidden=false;
  get('standby').hidden=true;
  get('machine-state').textContent='LOADING EMULATOR / EXTERNAL CORE';
  status('ROM validated. Connecting to the third-party MAME 0.243 browser emulator…');
  blobUrl=URL.createObjectURL(selected);
  // Publicly documented API from emulatorjs.com: MAME0.243 core + game URL.
  window.EJS_player='#game';
  window.EJS_core='mame0.243';
  window.EJS_gameUrl=blobUrl;
  window.EJS_gameName='looping';
  window.EJS_startOnLoaded=false;
  window.EJS_color='#ff5b50';
  window.EJS_ready=()=>{status('MAME loaded. Use the START GAME control inside the monitor.','ok');get('machine-state').textContent='EMULATOR READY';};
  window.EJS_onGameStart=()=>{status('Game launched. Press 5 to insert a coin, then 1 to start.','ok');get('machine-state').textContent='ARCADE IN PLAY';};
  const script=document.createElement('script');
  script.src='https://www.emulatorjs.com/loader.js';
  script.async=true;
  script.onerror=()=>{status('The third-party emulator download failed. Browser loading is not verified. You can reload the page to retry.','bad');get('machine-state').textContent='CORE DOWNLOAD FAILED';get('standby').hidden=false;};
  document.head.append(script);
});
get('again').addEventListener('click',()=>location.reload());
window.addEventListener('pagehide',()=>{if(blobUrl)URL.revokeObjectURL(blobUrl);});
