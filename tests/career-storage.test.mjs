import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const code=readFileSync(new URL('../career-storage.js',import.meta.url),'utf8');
const KEY='the-motor-trade-career-v1';
const BACKUP='the-motor-trade-career-backup-v1';
const validCareer=(day=1)=>({version:14,name:'Test Motors',day,cash:12500,ledger:[]});
function normalize(state){
  return state && state.version===14 && state.name==='Test Motors' &&
    Number.isSafeInteger(state.day) && state.day>0 &&
    state.cash===12500 && Array.isArray(state.ledger)
    ? {...state,ledger:[...state.ledger]} : null;
}
function harness(initial={}, failSet=()=>false){
  const values=new Map(Object.entries(initial));
  const localStorage={
    getItem(key){return values.has(key)?values.get(key):null;},
    setItem(key,value){
      if(failSet(key,value))throw new Error('QuotaExceededError');
      values.set(key,String(value));
    }
  };
  const window={localStorage};
  vm.runInNewContext(code,{window,Date,JSON});
  return {api:window.MotorTradeCareerStorage,values,storage:localStorage};
}

test('previous unsuffixed browser career loads unchanged without migration',()=>{
  const original=JSON.stringify(validCareer(9));
  const {api,values}=harness({[KEY]:original});
  const loaded=api.load(normalize);
  assert.equal(loaded.career.day,9);
  assert.equal(loaded.primaryDamaged,false);
  assert.equal(values.get(KEY),original);
});

test('the first save and subsequent save create a validated previous-state backup',()=>{
  const {api,values}=harness();
  api.load(normalize);
  assert.equal(api.save(validCareer(1),normalize).ok,true);
  assert.equal(values.get(BACKUP),undefined);
  assert.equal(api.save(validCareer(2),normalize).ok,true);
  assert.equal(JSON.parse(values.get(KEY)).day,2);
  assert.equal(JSON.parse(values.get(BACKUP)).day,1);
  // A same-day save must not overwrite the more useful prior-day recovery.
  assert.equal(api.save({...validCareer(2),note:'inbox opened'},normalize).ok,true);
  assert.equal(JSON.parse(values.get(BACKUP)).day,1);
  const recovered=api.recover(normalize);
  assert.equal(recovered.ok,true);
  assert.equal(recovered.career.day,1);
  assert.equal(JSON.parse(values.get(KEY)).day,1);
  assert.equal(JSON.parse(values.get(BACKUP)).day,2);
});

test('damaged primary never silently creates a new career or replaces the original',()=>{
  const broken='{broken JSON';
  const {api,values}=harness({[KEY]:broken,[BACKUP]:JSON.stringify(validCareer(14))});
  const loaded=api.load(normalize);
  assert.equal(loaded.career,null);
  assert.equal(loaded.primaryDamaged,true);
  assert.equal(loaded.backupAvailable,true);
  assert.equal(values.get(KEY),broken);
  const recovered=api.recover(normalize);
  assert.equal(recovered.ok,true);
  assert.equal(recovered.career.day,14);
  assert.equal(JSON.parse(values.get(KEY)).day,14);
});

test('missing primary plus available backup offers recovery without auto-writing',()=>{
  const {api,values}=harness({[BACKUP]:JSON.stringify(validCareer(4))});
  const loaded=api.load(normalize);
  assert.equal(loaded.career,null);
  assert.equal(loaded.backupOnly,true);
  assert.equal(values.has(KEY),false);
  assert.equal(api.recover(normalize).ok,true);
  assert.equal(JSON.parse(values.get(KEY)).day,4);
});

test('invalid backup is never offered as valid recovery',()=>{
  const {api}=harness({[KEY]:'bad', [BACKUP]:'{"version":999}'});
  const loaded=api.load(normalize);
  assert.equal(loaded.backupAvailable,false);
  assert.equal(api.recover(normalize).ok,false);
});

test('write failure preserves the old primary even when local backup cannot be written',()=>{
  const old=JSON.stringify(validCareer(2));
  const {api,values}=harness({[KEY]:old},key=>key===KEY);
  api.load(normalize);
  const result=api.save(validCareer(3),normalize);
  assert.equal(result.ok,false);
  assert.equal(values.get(KEY),old);
});

test('backup storage quota failure does not sacrifice a successful primary save',()=>{
  const old=JSON.stringify(validCareer(2));
  const {api,values}=harness({[KEY]:old},key=>key===BACKUP);
  api.load(normalize);
  assert.equal(api.save(validCareer(3),normalize).ok,true);
  assert.equal(JSON.parse(values.get(KEY)).day,3);
  assert.equal(values.get(BACKUP),undefined);
});

test('a second tab cannot silently overwrite a newer valid career',()=>{
  const old=JSON.stringify(validCareer(2));
  const {api,values,storage}=harness({[KEY]:old});
  api.load(normalize);
  storage.setItem(KEY,JSON.stringify(validCareer(3)));
  const result=api.save(validCareer(4),normalize);
  assert.equal(result.ok,false);
  assert.match(result.message,/another tab/);
  assert.equal(JSON.parse(values.get(KEY)).day,3);
});

test('invalid in-memory state is rejected without touching local storage',()=>{
  const old=JSON.stringify(validCareer(2));
  const {api,values}=harness({[KEY]:old});
  api.load(normalize);
  assert.equal(api.save({...validCareer(4),cash:-999},normalize).ok,false);
  assert.equal(values.get(KEY),old);
});

test('export round-trip validates the format and preserves state while rejecting tampering',()=>{
  const {api,values}=harness({[KEY]:JSON.stringify(validCareer(7))});
  api.load(normalize);
  const exported=api.exportText(validCareer(7),normalize);
  const parsed=JSON.parse(exported);
  assert.equal(parsed.type,'the-motor-trade-career-export');
  assert.equal(parsed.format,1);
  assert.equal(api.importText(exported,normalize).career.day,7);
  assert.equal(api.importText(JSON.stringify({...parsed,format:999}),normalize).ok,false);
  assert.equal(api.importText(JSON.stringify({...parsed,career:{...validCareer(8),cash:500000}}),normalize).ok,false);
  assert.equal(api.importText('not json',normalize).ok,false);
  assert.equal(api.importText('x'.repeat(api.MAX_IMPORT_BYTES+1),normalize).ok,false);
  assert.equal(JSON.parse(values.get(KEY)).day,7);
});

test('unavailable browser storage is reported, never mistaken for an empty valid save',()=>{
  const window={get localStorage(){throw new Error('disabled');}};
  vm.runInNewContext(code,{window,Date,JSON});
  const api=window.MotorTradeCareerStorage;
  assert.equal(api.load(normalize).available,false);
  assert.equal(api.status(normalize).available,false);
  assert.equal(api.save(validCareer(),normalize).ok,false);
});
