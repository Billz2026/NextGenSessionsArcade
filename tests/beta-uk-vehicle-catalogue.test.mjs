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
      assert.ok(car.guide>0&&car.retail>0);
      // Four legacy 2026 trade assumptions exceed observed retail guides.
      // The buying engine already quarantines them pending real wholesale evidence.
      if(!M.priceFor(car,'uk2026').priceAudit?.buyingRisk)
        assert.ok(M.priceFor(car,'uk2026').retail>car.guide,
        'Unquarantined guide must remain below retail: '+car.title);
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
  assert.equal(UK.VERIFIED.length,106,'Opening six and four 25-derivative UK evidence batches');
  const counts={manufacturer:0,corroborated:0};
  const checkedTitles=new Set();
  for(const row of UK.VERIFIED){
    const car=find(row[0]);
    assert.ok(car,'Missing reviewed UK derivative '+row[0]);
    assert.ok(!checkedTitles.has(row[0]),'Duplicate evidence: '+row[0]);
    checkedTitles.add(row[0]);
    assert.ok(['manufacturer','corroborated'].includes(row[4]));
    assert.ok(row[5].startsWith('https://'),'Missing source URL for '+row[0]);
    assert.ok(row[6].length>25,'Missing source qualification for '+row[0]);
    assert.equal(A.lookup(car).status,row[4]);
    assert.equal(A.lookup(car).url,row[5]);
    assert.equal(A.lookup(car).checkedAt,'2026-11-13');
    counts[row[4]]++;
  }
  assert.equal(counts.manufacturer,45);
  assert.equal(counts.corroborated,61);
  for(const title of [
    '2018 Toyota Aygo x-play','2017 Toyota Auris Icon Hybrid','2018 Toyota Prius Business Edition',
    '2018 Toyota C-HR Icon Hybrid','2022 Toyota Aygo X Pure','2020 Toyota Corolla Icon Hybrid',
    '2021 Toyota C-HR Design Hybrid','2020 Toyota Prius Business Edition',
    '2018 Nissan Micra Acenta','2016 Nissan Note Acenta','2017 Nissan X-Trail Acenta',
    '2019 Nissan Qashqai N-Connecta','2023 Nissan Juke Tekna Hybrid',
    '2023 Nissan Qashqai N-Connecta e-POWER',
    '2019 Volkswagen Golf GTD','2021 Volkswagen T-Cross SE','2019 Volkswagen T-Roc SE',
    '2020 Volkswagen Tiguan Match','2021 Volkswagen ID.3 Life Pro Performance',
    '2022 Volkswagen Golf GTI','2022 Volkswagen ID.4 Life Pro Performance',
    '2019 Audi A3 Sportback 35 TFSI S line','2022 Audi S3 Sportback',
    '2020 Audi Q2 30 TFSI Sport','2021 Audi RS Q3 Sportback'
  ])assert.ok(checkedTitles.has(title),'Missing first-batch verification: '+title);
  for(const title of [
      "2018 Ford Fiesta Titanium",
      "2018 Ford Focus ST-Line",
      "2019 Ford Fiesta ST-2",
      "2020 Ford Fiesta ST-Line",
      "2021 Ford Kuga Titanium PHEV",
      "2018 Vauxhall Astra SRi",
      "2019 Vauxhall Crossland X SE",
      "2021 Vauxhall Astra SRi",
      "2021 Vauxhall Mokka SRi",
      "2019 Kia Picanto 2",
      "2020 Kia Niro 2 Hybrid",
      "2021 Kia Ceed 2",
      "2021 Kia e-Niro 3",
      "2018 Hyundai i10 SE",
      "2018 Hyundai i30 SE",
      "2021 Hyundai i10 SE Connect",
      "2021 Hyundai i20 Premium",
      "2018 Skoda Fabia SE",
      "2020 Skoda Superb SE Technology",
      "2021 Skoda Kamiq SE L",
      "2021 Skoda Octavia vRS",
      "2018 SEAT Ibiza SE Technology",
      "2020 SEAT Leon FR",
      "2020 SEAT Arona FR",
      "2021 SEAT Ateca SE Technology"
  ]) {
    assert.ok(checkedTitles.has(title),'Missing Ford/Vauxhall/Kia/Hyundai/Skoda/SEAT review: '+title);
  }
  for(const title of [
  "2018 Peugeot 108 Active",
  "2018 Peugeot 2008 Allure",
  "2021 Peugeot 2008 Allure",
  "2021 Peugeot 3008 Allure",
  "2021 Peugeot 5008 Allure",
  "2018 Citroen C1 Feel",
  "2019 Citroen C3 Feel",
  "2021 Citroen C3 Aircross Shine",
  "2021 Citroen C5 Aircross Shine",
  "2018 Renault Clio Dynamique Nav",
  "2018 Renault Kadjar Dynamique Nav",
  "2022 Renault Clio Iconic",
  "2021 Renault Captur Iconic",
  "2020 Renault Zoe GT Line R135",
  "2018 Dacia Sandero Ambiance",
  "2018 Dacia Duster Comfort",
  "2022 Dacia Sandero Stepway Comfort",
  "2023 Dacia Jogger Expression",
  "2018 Suzuki Swift SZ3",
  "2019 Suzuki Ignis SZ3",
  "2020 Suzuki Vitara SZ-T",
  "2020 Suzuki Swift Sport",
  "2020 MG MG3 Excite",
  "2021 MG ZS Exclusive",
  "2022 MG HS Excite"
]) {
    assert.ok(checkedTitles.has(title),'Missing third-batch UK evidence: '+title);
  }
  assert.equal(batchThirdManufacturerCount(),5);
  function batchThirdManufacturerCount(){
    return UK.VERIFIED.slice(56,81).filter(x=>x[4]==='manufacturer').length;
  }
  for(const title of [
  "2018 Honda Civic SE",
  "2021 Honda Civic Sport",
  "2022 Honda HR-V Advance e:HEV",
  "2018 Mazda Mazda2 SE-L",
  "2020 Mazda Mazda3 SE-L",
  "2020 Mazda CX-5 SE-L",
  "2021 BMW 118i M Sport",
  "2019 BMW M140i Shadow Edition",
  "2022 BMW M135i xDrive",
  "2020 BMW X1 sDrive18i Sport",
  "2019 BMW 520d M Sport",
  "2022 BMW i4 eDrive40",
  "2021 BMW M3 Competition",
  "2021 Mercedes-AMG A35 4MATIC",
  "2019 Mercedes-Benz C220d AMG Line",
  "2021 Mercedes-Benz GLA200 AMG Line",
  "2021 Mercedes-AMG A45 S 4MATIC+",
  "2018 Volvo V40 D2 Momentum",
  "2021 Volvo V60 Momentum B4",
  "2020 Volvo XC60 D4 Momentum",
  "2020 Jaguar XE R-Dynamic S D180",
  "2021 Jaguar F-Type P300 R-Dynamic",
  "2019 Land Rover Discovery Sport SE TD4",
  "2022 Range Rover Evoque D200 R-Dynamic S",
  "2021 Land Rover Discovery D250 S"
]) {
    assert.ok(checkedTitles.has(title),'Missing Honda/Mazda/BMW/Mercedes/Volvo/JLR audit: '+title);
  }
  assert.equal(UK.VERIFIED.slice(81).filter(x=>x[4]==='manufacturer').length,9,
    'Fourth batch must maintain evidence classification');
  assert.equal(A.lookup(find('2020 Volvo XC60 D4 Momentum')).engine,
    '2.0 D4 Geartronic','Do not claim AWD without exact UK proof');
  assert.match(A.lookup(find('2022 BMW i4 eDrive40')).note,/GROSS.*NET/,
    'Electric vehicle usable battery must not be confused with gross capacity');
  assert.match(A.lookup(find('2021 BMW M3 Competition')).note,/NOT assumed/,
    'M3 rear-drive and optional xDrive require distinct records');
  // Changing a reviewed trim, powertrain or gearbox must demote evidence to pending.
  for(const original of UK.VERIFIED){
    const car=find(original[0]);
    const mutated={...car,engineSpec:'AUDIT INVALID ENGINE SPEC'};
    assert.equal(A.lookup(mutated).status,'pending','Stale evidence must fail closed: '+car.title);
  }
  assert.equal(A.lookup(find('2017 Nissan Juke N-Connecta')).status,'pending');
  assert.equal(A.lookup(find('2023 BYD Atto 3 Design')).status,'pending');
  const totals=A.summary(M.CATALOGUE);
  assert.equal(totals.total,200);
  assert.equal(totals.manufacturer,58);
  assert.equal(totals.corroborated,66);
  assert.equal(totals.pending,76);
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
      assert.ok(a&&a.retail>0&&a.guide>0);
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
