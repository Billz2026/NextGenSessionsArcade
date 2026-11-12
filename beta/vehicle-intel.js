'use strict';
/*
 * NextGen Sessions / The Motor Trade v0.4
 * Fictional vehicle intelligence. Stable data for a given lead ID; NO actual
 * DVLA registration, MOT record, private owner's data or real-market valuation.
 */
(() => {
  const clamp = (n,min,max) => Math.min(max,Math.max(min,n));
  const moneyRound = n => Math.round(n / 25) * 25;
  function seed(text) {
    let n=2166136261;
    for (const c of String(text)) {
      n = Math.imul((n ^ c.charCodeAt(0)),16777619);
    }
    return n >>> 0;
  }
  const power = {
    'Ford Focus':'1.5 TDCi','Ford Fiesta':'1.0 EcoBoost',
    'Volkswagen Polo':'1.2 TSI','Volkswagen Golf':'1.4 TSI',
    'Vauxhall Corsa':'1.4 16v','Nissan Qashqai':'1.5 dCi',
    'Peugeot 208':'1.2 PureTech','Hyundai i20':'1.2 MPI',
    'Toyota Yaris':'1.33 Dual VVT-i','Honda Jazz':'1.4 i-VTEC',
    'Kia Rio':'1.25 CVVT'
  };
  const lowFaults = [
    ['Rear brake pads and discs',315],['Battery and charging diagnosis',220],
    ['Suspension bush replacement',360],['Oil seep diagnosis and repair',425],
    ['Clutch hydraulics repair',475],['Cooling-system repair',390]
  ];
  const majorFaults = [
    ['Clutch and flywheel replacement',725],['DPF investigation and repair',650],
    ['Suspension arms and alignment',540],['Timing-system repair',680],
    ['Air-conditioning compressor',560]
  ];
  const electricFaults = [
    ['12V battery and electrical diagnosis',260],
    ['Charging port or onboard charger diagnosis',540],
    ['Thermal management / coolant service',490],
    ['High-voltage system diagnostic assessment',625]
  ];
  const hybridFaults = [
    ['Hybrid cooling system service',430],
    ['Hybrid control electronics diagnosis',525],
    ['Auxiliary battery replacement',280],
    ['Hybrid drive system inspection',480]
  ];
  const labels = {
    light:['Routine service and inspection','Front tyre replacement','Minor paint correction'],
    medium:['Service and fluids','Brakes / tyres allowance','Bodywork and trim correction'],
    heavy:['Service and safety inspection','Brakes and suspension allowance','Panel repair and refinish']
  };
  function gradeFor(car,hash) {
    const candidate = Number(car.grade);
    if ([1,2,3,4,5].includes(candidate)) return candidate;
    const miles=car.miles||75000;
    return clamp(2+(miles>90000?1:0)+(hash%5===0?1:0),2,5);
  }
  function profile(car) {
    const ref=String(car.id||car.origin||car.title);
    const hash=seed(ref);
    const grade=gradeFor(car,hash);
    const year=Number(String(car.title).slice(0,4)) || 2015;
    const name=String(car.title).replace(/^\d{4}\s+/,'');
    const vehicleEngine=(typeof car.engineSpec==='string'&&car.engineSpec.length<75
      ? car.engineSpec : Object.entries(power).find(([k]) => name.includes(k))?.[1]) ||
      (car.fuel==='Electric'?'Electric motor specification unverified':'Engine specification unverified');
    const repairPlan=car.repairScenario==='uk2026'?
      window.MotorTradeRepairPrices?.plan(car):null;
    if(car.repairScenario==='uk2026'&&!repairPlan)
      throw new Error('Load repair-prices.js before modern vehicle intelligence');
    const basePrep=repairPlan?.basePrep??
      Math.max(150,Math.round((Number(car.prep)||350)));
    const mode=grade>=4?'heavy':grade===3?'medium':'light';
    const labelsFor=car.fuel==='Electric'?
      ['EV safety / charging assessment','Tyres and brakes allowance','Cooling and software checks']:
      (car.fuel==='Hybrid'||car.fuel==='Plug-in Hybrid')?
      ['Hybrid system service','Brakes and tyres allowance','Electrical and cooling checks']:
      labels[mode];
    const splitA=moneyRound(basePrep*.42);
    const splitB=moneyRound(basePrep*.32);
    const knownRepairs=repairPlan?.knownRepairs||[
      {item:labelsFor[0],cost:splitA},
      {item:labelsFor[1],cost:splitB},
      {item:labelsFor[2],cost:basePrep-splitA-splitB}
    ];
    const hasFault=hash%100 < (grade===2?17:grade===3?37:grade===4?59:70);
    // Only full hybrids/PHEVs use hybrid-specific faults. Petrol/diesel
    // mild-hybrids retain an internal combustion engine and its repair risks.
    const faultPool=car.fuel==='Electric'?electricFaults:
      (car.fuel==='Hybrid'||car.fuel==='Plug-in Hybrid')?hybridFaults:
      (grade>=4?majorFaults:lowFaults);
    const chosen=faultPool[hash%faultPool.length];
    const hiddenFault=hasFault?{item:chosen[0],cost:chosen[1]}:null;
    const owners=1+(hash>>>3)%5;
    const motMonths=1+(hash>>>9)%12;
    const motRecordedMiles=Math.max(0,(Number(car.miles)||70000)-1000-((hash>>>5)%6000));
    const motAdvisories=grade>=3?
      [grade>=4?'Tyre and suspension wear recorded':'Brake wear noted at previous test']:[];
    const retail=moneyRound(Math.max(1000,Number(car.retail||5500)+
      ((hash>>>12)%9-4)*50));
    const demand=['LOW','STEADY','STRONG'][(hash>>>7)%3];
    const conditionDiscount=grade>=4?350:grade===3?200:75;
    const demandAdjustment=demand==='STRONG'?100:demand==='LOW'?250:170;
    const likelySale=moneyRound(Math.max(850,retail-conditionDiscount-demandAdjustment));
    const riskAllowance=repairPlan?.riskAllowance??(grade>=4?385:grade===3?220:120);
    const targetMargin=moneyRound(Math.max(575,likelySale*.13));
    const trade=moneyRound(Math.max(300,likelySale-basePrep-riskAllowance-targetMargin-225));
    const inspectionFee=car.kind==='auction'||car.source==='auction'?95:75;
    return {
      ref:'SIM-'+ref.toUpperCase().replace(/[^A-Z0-9-]/g,'').slice(0,28),
      year,engine:vehicleEngine,grade,owners,
      mot:{monthsRemaining:motMonths,recordedMiles:motRecordedMiles,
        result:'PASS',advisories:motAdvisories},
      knownRepairs,hiddenFault,basePrep,riskAllowance,
      ...(repairPlan?{repairBasis:repairPlan.repairBasis,majorExposure:repairPlan.majorExposure}:{}),
      inspectionFee,demand,retail,likelySale,trade,targetMargin,
      inspected:false,legacy:false
    };
  }
  function legacyProfile(vehicle) {
    // Never impose previously unknown repair costs on an existing saved car.
    const p=profile({...vehicle,id:vehicle.origin||'OLD-'+vehicle.id,
      kind:vehicle.source,prep:vehicle.prepBudget});
    p.basePrep=vehicle.prepBudget;
    p.knownRepairs=[{item:'Legacy preparation allowance',cost:vehicle.prepBudget}];
    p.hiddenFault=null;
    p.riskAllowance=0;
    p.retail=vehicle.retail;
    p.likelySale=Math.max(500,vehicle.retail-250);
    p.legacy=true;
    return p;
  }
  function quote(car,source,offer,inspected=false) {
    const p=car.profile||profile(car);
    const hidden=inspected&&p.hiddenFault?p.hiddenFault.cost:0;
    const prep=p.basePrep+(inspected?hidden:p.riskAllowance);
    const inspection=inspected?p.inspectionFee:0;
    const price=Number.isSafeInteger(offer)?offer:(source==='auction'?car.guide:car.ask);
    const published=source==='auction'&&car.feeModel==='bca-blue-2026';
    const fees=window.MotorTradeAuctionFees;
    const fee=source!=='auction'?0:published?
      (fees?.feeAtHammer(price)??null):Number(car.fee||0);
    const transport=published?window.MotorTradeTransport?.quote(car.id)?.gross??null:0;
    const feeQuoteRequired=published&&(fee===null||transport===null);
    const total=feeQuoteRequired?null:price+fee+transport+prep+inspection;
    // The new 2026 dealer starts voluntarily VAT-registered. Only the
    // PURCHASE-TO-SALE margin is taxed; reconditioning is not deductible
    // when calculating the margin scheme's VAT output.
    const vatModel=car.repairScenario==='uk2026'?window.MotorTradeVat:null;
    const outputVatAt=purchase=>vatModel?
      Math.ceil(vatModel.marginVatPence(p.likelySale,purchase)/100):0;
    const vatEstimatePence=vatModel?.marginVatPence(p.likelySale,price)??0;
    let maximumBid;
    if(published){
      // A fee-band increase AND changing VAT margin affect the next bid.
      maximumBid=0;
      for(let candidate=25;candidate<=fees.MAX_PUBLISHED_HAMMER;candidate+=25){
        const charge=fees.feeAtHammer(candidate);
        if(charge===null||candidate+charge+transport+prep+inspection+
          outputVatAt(candidate)+p.targetMargin>p.likelySale)break;
        maximumBid=candidate;
      }
    }else if(vatModel){
      maximumBid=0;
      for(let candidate=25;candidate<=p.likelySale;candidate+=25){
        if(candidate+fee+prep+inspection+outputVatAt(candidate)+
          p.targetMargin>p.likelySale)break;
        maximumBid=candidate;
      }
    }else{
      maximumBid=Math.max(0,moneyRound(p.likelySale-fee-prep-inspection-p.targetMargin));
    }
    return {likelySale:p.likelySale,trade:p.trade,retail:p.retail,
      prep,fee,transport,inspection,price,total,feeQuoteRequired,
      vatEstimatePence,
      expectedMargin:feeQuoteRequired?null:p.likelySale-total-
        Math.ceil(vatEstimatePence/100),
      targetMargin:p.targetMargin,maxBid:maximumBid,
      riskUncertain:!inspected};
  }
  function validProfile(p) {
    if(!p||typeof p!=='object'||Array.isArray(p))return false;
    if(typeof p.ref!=='string'||p.ref.length<4||p.ref.length>40 ||
       !Number.isSafeInteger(p.year)||p.year<1980||p.year>2035 ||
       typeof p.engine!=='string'||p.engine.length>75 ||
       !Number.isSafeInteger(p.grade)||p.grade<1||p.grade>5 ||
       !Number.isSafeInteger(p.owners)||p.owners<1||p.owners>9 ||
       !p.mot || !Number.isSafeInteger(p.mot.monthsRemaining) ||
       p.mot.monthsRemaining<0||p.mot.monthsRemaining>24 ||
       !Array.isArray(p.mot.advisories)||p.mot.advisories.length>6 ||
       !Number.isSafeInteger(p.mot.recordedMiles)||p.mot.recordedMiles<0 ||
       p.mot.recordedMiles>1000000 ||
       !p.mot.advisories.every(s=>typeof s==='string'&&s.length<160) ||
       !Array.isArray(p.knownRepairs)||p.knownRepairs.length>8 ||
       !p.knownRepairs.every(r=>r&&typeof r.item==='string'&&r.item.length<120&&
         Number.isSafeInteger(r.cost)&&r.cost>=0&&r.cost<10000))return false;
    const validCost=n=>Number.isSafeInteger(n)&&n>=0&&n<1000000;
    if(![p.basePrep,p.riskAllowance,p.inspectionFee,p.retail,
        p.likelySale,p.trade,p.targetMargin].every(validCost)||
       (p.hiddenFault!==null && (typeof p.hiddenFault!=='object'||
        typeof p.hiddenFault.item!=='string'||p.hiddenFault.item.length>120||
        !validCost(p.hiddenFault.cost)))||
       !['LOW','STEADY','STRONG'].includes(p.demand) ||
       typeof p.inspected!=='boolean'||typeof p.legacy!=='boolean')return false;
    return p.knownRepairs.reduce((n,r)=>n+r.cost,0)===p.basePrep;
  }
  window.MotorTradeIntel=Object.freeze({profile,legacyProfile,quote,validProfile});
})();
