'use strict';
/* 2026 UK independent workshop RECONDITIONING MODEL — illustrative estimates,
 * never confirmed vehicle defects, actual supplier quotes or VAT advice.
 *
 * Benchmarks:
 * BookMyGarage, UK Nov 2026: front discs+pad £278, rear £248
 * https://bookmygarage.com/blog/brake-pads-and-discs-cost/
 * FixMyCar, UK 2026 full-service average quote ~£206
 * https://www.whocanfixmycar.com/lp/services/full-service
 * GarageDesk, July 2026: independent regional labour £40–£110/hr
 * https://garagedesk.co/garage-labour-rates-uk/
 * Timing-belt prices are case-dependent; see:
 * https://mendcost.com/uk/repair-costs/timing-belt/peugeot-1-2-puretech-wet-belt-replacement-cost/
 */
(() => {
  const VAT_RATE=0.20;  // Gross supplier cash includes VAT; recovery requires eligible invoices/registration.
  const REGIONAL_LABOUR_RATE=72; // ASSUMED ex-VAT, not a universal garage quote.
  const JOBS=Object.freeze({
    service:{name:'Full service, filters and fluids',hours:1.5,parts:62},
    diagnostics:{name:'OBD and multipoint safety checks',hours:0.75,parts:10},
    frontBrakes:{name:'Front brake discs and pads (if required)',hours:1.5,parts:124},
    rearBrakes:{name:'Rear brake discs and pads (if required)',hours:1.25,parts:117},
    tyres:{name:'Two mid-range tyres, fitted and balanced (if required)',hours:0.8,parts:138},
    suspension:{name:'Suspension arm repair and alignment (if required)',hours:2.0,parts:137},
    paint:{name:'Minor panel/bodywork rectification (if required)',hours:2.25,parts:94},
    evService:{name:'EV health/safety and underbody check',hours:1.2,parts:38},
    evDiagnostics:{name:'12V/charging-system diagnostic check',hours:1.0,parts:30},
    puretechWetBelt:{name:'PureTech wet belt and strainer inspection/replacement exposure',hours:5.0,parts:244},
    ecoboostWetBelt:{name:'EcoBoost wet/oil-pump belt exposure, if fitted',hours:6.0,parts:270},
    clutchFlywheel:{name:'Clutch and dual-mass flywheel replacement exposure',hours:6.0,parts:470},
    dpf:{name:'DPF investigation and possible repair exposure',hours:3.0,parts:300},
    evCharger:{name:'On-board charging hardware repair exposure',hours:4.0,parts:540}
  });
  function quote(jobId,{labourRate=REGIONAL_LABOUR_RATE}={}){
    const job=JOBS[jobId];
    if(!job||!Number.isFinite(labourRate)||labourRate<40||labourRate>160)return null;
    const labourNet=Math.round(job.hours*labourRate*100)/100;
    const partsNet=job.parts;
    const subtotal=labourNet+partsNet;
    const vat=Math.round(subtotal*VAT_RATE*100)/100;
    const gross=Math.round(subtotal+vat);
    return {jobId,item:job.name,hours:job.hours,labourRate,labourNet,partsNet,
      vat,gross,cost:gross,vatBasis:'illustrative UK VAT-registered external garage'};
  }
  function powertrainRisk(car){
    const engine=String(car.engineSpec||car.profile?.engine||'').toLowerCase();
    const title=String(car.title||'');
    const year=Number(title.slice(0,4))||2018;
    const miles=Number(car.miles)||0;
    if(miles<62000)return null;
    // A risk flag is not a diagnosed fault or confirmation that a belt is due.
    const puretech=engine.includes('puretech')||
      (year>=2020&&title.includes('Vauxhall Corsa')&&engine.includes('1.2 turbo'));
    if(puretech)return {jobId:'puretechWetBelt',
      note:'Confirm exact engine generation, manufacturer interval, recall/warranty eligibility and dated belt invoice. Not an assumed failed belt.'};
    if(engine.includes('ecoboost')&&engine.includes('1.0'))return {
      jobId:'ecoboostWetBelt',
      note:'Confirm engine build, belt configuration and documented oil/timing belt service before reserving this cost. No fault presumed.'};
    if(car.fuel==='Diesel'&&miles>110000)return {
      jobId:'dpf',note:'High-mileage diesel aftertreatment exposure; inspection and emissions testing needed, not a diagnosed DPF failure.'};
    return null;
  }
  function plan(car){
    const grade=Number(car.grade)||3;
    const ev=car.fuel==='Electric';
    const hybrid=car.fuel==='Hybrid'||car.fuel==='Plug-in Hybrid';
    const work=ev?['evService','evDiagnostics']:['service','diagnostics'];
    if(grade>=3)work.push(grade%2?'frontBrakes':'rearBrakes');
    if(grade>=4)work.push('tyres');
    if(grade>=5)work.push('suspension');
    const jobs=work.map(id=>quote(id));
    const knownRepairs=jobs.map(j=>({item:j.item,cost:j.gross,
      hours:j.hours,labourRate:j.labourRate,partsNet:j.partsNet,vat:j.vat,jobId:j.jobId}));
    const basePrep=knownRepairs.reduce((n,j)=>n+j.cost,0);
    const risk=powertrainRisk(car);
    const exposure=risk?quote(risk.jobId):null;
    // Risk allowances are financial contingency, not invoices or proved faults.
    const conditionRisk=grade>=4?385:grade===3?220:120;
    const powertrainReserve=exposure?Math.round(exposure.gross*.35):0;
    const riskAllowance=conditionRisk+powertrainReserve+(hybrid?70:0);
    return {knownRepairs,basePrep,riskAllowance,
      repairBasis:'2026 regional UK indicative external garage; labour £72/hour ex VAT, parts and 20% output VAT shown in job cards',
      majorExposure:exposure?{item:exposure.item,maxIndicativeCost:exposure.gross,
        note:risk.note}:null};
  }
  window.MotorTradeRepairPrices=Object.freeze({VAT_RATE,REGIONAL_LABOUR_RATE,JOBS,quote,powertrainRisk,plan});
})();
