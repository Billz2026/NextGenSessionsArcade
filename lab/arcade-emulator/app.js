'use strict';
// Isolated, local-file ROM loader. No game ROMs, BIOS files or game URLs are bundled.
const EJS_VERSION = '4.2.3';
const EJS_DATA = 'https://cdn.emulatorjs.org/' + EJS_VERSION + '/data/';
const MAX_ROM_BYTES = 64 * 1024 * 1024;
const SYSTEMS = Object.freeze({
  arcade: { name:'ARCADE / FBNeo', ext:['zip'], hint:'Arcade ZIP ROM set (.zip), up to 64 MB', desc:'FBNeo uses specific arcade ROM sets. A random MAME ZIP may not work. No BIOS or parent-ROM dependencies are supplied.' },
  mame2003: { name:'ARCADE / MAME 2003', ext:['zip'], hint:'MAME 2003-era ROM set (.zip), up to 64 MB', desc:'MAME 2003 expects ROMs matching its particular old set. Current MAME ROMs may be incompatible.' },
  nes: { name:'CONSOLE / NES', ext:['nes','zip'], hint:'NES ROM (.nes or .zip), up to 64 MB', desc:'Simple console-system compatibility test. Only use ROMs you are authorised to run.' },
  snes: { name:'CONSOLE / SNES', ext:['sfc','smc','zip'], hint:'SNES ROM (.sfc, .smc or .zip), up to 64 MB', desc:'SNES uses the Snes9x family. Actual play speed and mobile controls need device testing.' },
  segaMD: { name:'CONSOLE / MEGA DRIVE', ext:['md','bin','gen','zip'], hint:'Mega Drive ROM (.md, .bin, .gen or .zip), up to 64 MB', desc:'Mega Drive / Genesis compatibility test. Check six-button controls per title.' },
  gb: { name:'CONSOLE / GAME BOY', ext:['gb','gbc','zip'], hint:'Game Boy ROM (.gb, .gbc or .zip), up to 64 MB', desc:'Game Boy and Game Boy Color. This is included only as an additional emulator sanity check.' }
});
const $ = id => document.getElementById(id);
const systemSelect = $('system');
const input = $('rom-file');
const launchButton = $('launch');
const changeButton = $('change');
const zone = $('drop-zone');
const status = $('status');
let selected = null;
let booting = false;
let objectUrl = null;
const extOf = name => (name.split('.').pop() || '').toLowerCase();
function say(message, kind='info') {
  status.dataset.kind = kind;
  status.innerHTML = '';
  const led = document.createElement('span');
  led.className = 'status-led';
  led.setAttribute('aria-hidden','true');
  status.append(led, document.createTextNode(message));
}
function clearSelection() {
  if (booting) return;
  selected = null;
  input.value = '';
  $('file-card').hidden = true;
  launchButton.disabled = true;
  say('Choose a ROM to begin. No game has been loaded.');
}
function chooseFile(file) {
  if (booting || !file) return;
  const system = SYSTEMS[systemSelect.value];
  if (!system.ext.includes(extOf(file.name))) {
    clearSelection();
    say('This file extension does not match ' + system.name + '. Select a compatible ROM.', 'error');
    return;
  }
  if (!file.size || file.size > MAX_ROM_BYTES) {
    clearSelection();
    say('Use a non-empty ROM file no larger than 64 MB for this first prototype.', 'error');
    return;
  }
  selected = file;
  input.value = '';
  $('file-card').hidden = false;
  $('file-name').textContent = file.name;
  $('file-meta').textContent = (file.size / 1024 / 1024).toFixed(2) + ' MB · ' + system.name;
  launchButton.disabled = false;
  say('File selected locally. Press LOAD INTO CABINET to initialise the emulator.', 'success');
}
systemSelect.addEventListener('change', () => {
  if (booting) return;
  clearSelection();
  const system = SYSTEMS[systemSelect.value];
  $('core-description').textContent = system.desc;
  $('file-hint').textContent = system.hint;
  input.accept = system.ext.map(x => '.' + x).join(',');
});
input.addEventListener('change', () => chooseFile(input.files && input.files[0]));
$('clear-file').addEventListener('click', clearSelection);
for(const name of ['dragenter','dragover']) zone.addEventListener(name, ev => {
  if (booting) return;
  ev.preventDefault();
  zone.classList.add('dragover');
});
for(const name of ['dragleave','drop']) zone.addEventListener(name, ev => {
  if (booting) return;
  ev.preventDefault();
  zone.classList.remove('dragover');
});
zone.addEventListener('drop', ev => {
  if (booting) return;
  const file = ev.dataTransfer && ev.dataTransfer.files && ev.dataTransfer.files[0];
  chooseFile(file);
});
function launch() {
  if (!selected || booting) return;
  const system = systemSelect.value;
  if (!SYSTEMS[system]) return;
  booting = true;
  launchButton.hidden = true;
  zone.style.pointerEvents = 'none';
  systemSelect.disabled = true;
  input.disabled = true;
  $('clear-file').disabled = true;
  changeButton.hidden = false;
  $('placeholder').hidden = true;
  say('Loading EmulatorJS ' + EJS_VERSION + '. Downloading emulator assets…');
  objectUrl = URL.createObjectURL(selected);
  // These global variables are EmulatorJS's documented integration interface.
  window.EJS_player = '#game';
  window.EJS_core = system;
  window.EJS_gameUrl = objectUrl;
  window.EJS_gameName = system + '-' + selected.name.replace(/\.[^.]+$/, '');
  window.EJS_pathtodata = EJS_DATA;
  window.EJS_color = '#ff534c';
  window.EJS_startOnLoaded = false;
  window.EJS_threads = false; // GitHub Pages does not offer arbitrary COOP/COEP response headers.
  window.EJS_ready = () => say('Emulator is ready. Press START GAME inside the cabinet.', 'success');
  window.EJS_onGameStart = () => say('Game started. Configure controls using the emulator toolbar.', 'success');
  window.EJS_onExit = () => say('Emulator exited. Reload this page to choose another ROM.');
  const loader = document.createElement('script');
  loader.src = EJS_DATA + 'loader.js';
  loader.async = true;
  loader.onerror = () => {
    $('placeholder').hidden = false;
    say('Emulator download failed. Check your connection or CDN access, then reload and retry.', 'error');
  };
  document.head.append(loader);
}
launchButton.addEventListener('click', launch);
changeButton.addEventListener('click', () => location.reload());
window.addEventListener('pagehide', () => { if(objectUrl) URL.revokeObjectURL(objectUrl); });
