import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const ctx=vm.createContext({window:{}});
for(const filename of [
  'uk-vehicle-catalogue.js',
  'vehicle-market.js',
  'vehicle-accuracy.js',
  'vehicle-photos.js'
]){
  const src=readFileSync(new URL('../beta/'+filename,import.meta.url),'utf8');
  new vm.Script(src,{filename}).runInContext(ctx);
}
const UK=ctx.window.MotorTradeUKCatalogue;
const M=ctx.window.MotorTradeMarket;
const A=ctx.window.MotorTradeAccuracy;
const PH=ctx.window.MotorTradePhotos;
const all=Object.values(M.CATALOGUE).flat();
const newRows=Object.values(UK.CATALOGUE).flat();
const find=title=>all.find(x=>x.title===title);

test('beta loads UK catalogue before its spec registry and the market engine',()=>{
  const html=readFileSync(new URL('../beta/index.html',import.meta.url),'utf8');
  const i=html.indexOf('uk-vehicle-catalogue.js');
  const evidence=html.indexOf('vehicle-accuracy.js');
  const market=html.indexOf('vehicle-market.js');
  assert.ok(i>0&&evidence>i&&market>evidence,'Source and manufacturer evidence must load before use');
});

test('expanded UK beta contains 200 distinct vehicle derivatives in valid tiers',()=>{
  assert.equal(UK.added,145);
  assert.equal(newRows.length,145);
  assert.equal(all.length,200);
  assert.equal(new Set(all.map(v=>v.title)).size,200);
  assert.deepEqual(Object.keys(M.CATALOGUE),['starter','modern','premium','luxury']);
  for(const tier of Object.values(M.CATALOGUE)){
    for(const car of tier){
      assert.match(car.title,/^20\d\d /);
      assert.ok(['Petrol','Diesel','Hybrid','Electric','Plug-in Hybrid'].includes(car.fuel));
      assert.ok(['Manual','Automatic'].includes(car.gearbox));
      assert.ok(Number.isSafeInteger(car.guide)&&Number.isSafeInteger(car.retail));
      assert.ok(car.guide>0&&car.retail>car.guide);
      assert.ok(car.miles>0&&car.grade>=1&&car.grade<=5);
    }
  }
});

test('classic template positions remain untouched and authentic UK breadth is present',()=>{
  assert.equal(find('2016 Ford Focus Zetec').templateId,'starter-0');
  assert.equal(find('2021 Vauxhall Corsa SE Premium').templateId,'modern-0');
  assert.equal(find('2022 Tesla Model 3 RWD').templateId,'premium-0');
  assert.equal(find('2022 Porsche Macan 2.0 PDK').templateId,'luxury-0');
  for(const title of [
    '2018 Toyota Aygo x-play',
    '2017 Toyota Auris Icon Hybrid',
    '2019 Toyota RAV4 Design Hybrid',
    '2018 Nissan Micra Acenta',
    '2021 Nissan Juke N-Connecta',
    '2023 Nissan Qashqai N-Connecta e-POWER',
    '2018 Volkswagen Golf GTI Performance',
    '2018 Volkswagen Golf R',
    '2022 Audi S3 Sportback',
    '2022 Audi RS 3 Sportback',
    '2021 Skoda Kamiq SE L',
    '2020 SEAT Leon FR',
    '2021 Volvo V60 Momentum B4',
    '2020 Jaguar XE R-Dynamic S D180',
    '2023 BYD Atto 3 Design',
  ])assert.ok(find(title),'Missing genuine UK model '+title);
});

test('only exact manufacturer-backed specifications receive certified evidence',()=>{
  assert.equal(UK.VERIFIED.length,6);
  for(const row of UK.VERIFIED){
    const car=find(row[0]);
    assert.ok(car,'Missing verified UK derivative '+row[0]);
    assert.equal(A.lookup(car).status,'manufacturer');
    assert.equal(A.lookup(car).url,row[5]);
  }
  assert.equal(A.lookup(find('2017 Nissan Juke N-Connecta')).status,'pending');
  assert.equal(A.lookup(find('2023 BYD Atto 3 Design')).status,'pending');
  assert.equal(A.summary(M.CATALOGUE).total,200);
});

test('new prices are transparently unverified and classic pricing is untouched',()=>{
  for(const car of newRows){
    const base=find(car[0]);
    assert.equal(M.priceFor(base,'uk2026').priceAudit.status,'unverified',base.title);
    assert.equal(M.priceFor(base,'classic'),base);
  }
  assert.equal(M.priceFor(find('2022 Nissan Qashqai Acenta Premium'),'uk2026').priceAudit.status,'retail-comparable');
});

test('2026 market selection remains deterministic and respects unlocked tiers',()=>{
  for(const tier of ['starter','modern','premium','luxury']){
    for(let day=2;day<=100;day++){
      const a=M.pick('auction',tier,day,1,new Set(),'uk2026');
      const b=M.pick('auction',tier,day,1,new Set(),'uk2026');
      assert.equal(a?.title,b?.title);
      assert.ok(a&&a.retail>a.guide);
    }
  }
});

test('unknown photo generation is disclosed rather than misrepresented',()=>{
  const base=find('2022 Audi RS 3 Sportback');
  const car={...base,...PH.describe(base)};
  assert.equal(car.model,'Audi RS 3 Sportback');
  assert.equal(car.generation,'Generation not yet verified');
  assert.equal(PH.select(car),null);
  assert.equal(PH.identity(find('2018 Volkswagen Golf R')).generation,'Mk7');
});
