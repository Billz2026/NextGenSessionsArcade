'use strict';
/* The Motor Trade v0.5 — fictional staff, wages and reputation progression.
 * Payroll is SETTLED DAILY at 1/30 of an illustrative monthly wage, not a
 * simulation of UK payroll law. NI, pensions and formal employment contracts
 * are not modelled. Effects apply from the employee's second game day.
 */
(() => {
  const MAX_STAFF=3, HIRING_FEE=150, TRAINING_FEE=275;
  const ROLES=['sales','buyer','technician'];
  const CANDIDATES=Object.freeze({
    sales:[
      ['Daniel Harris',17,15,12,14,16,2350,6],
      ['Maya Collins',11,12,18,14,16,1850,2],
      ['Lewis Carter',8,10,11,12,13,1550,1],
      ['Amira Shah',15,17,17,13,18,2675,8]
    ],
    buyer:[
      ['James Bennett',13,18,12,17,16,2450,7],
      ['Sophie Reed',12,11,15,14,18,1750,2],
      ['Aaron Patel',11,9,12,10,12,1500,1],
      ['Eleanor Price',15,19,16,19,17,2900,10]
    ],
    technician:[
      ['Michael Turner',10,11,13,13,15,1925,3],
      ['Ryan Foster',9,10,14,10,11,1650,1],
      ['Priya Morgan',17,12,17,18,19,2700,7],
      ['Ben Walker',13,9,12,13,14,2250,4]
    ]
  });
  const integer=n=>Number.isSafeInteger(n);
  const skill=n=>integer(n)&&n>=1&&n<=20;
  const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
  function tier(score){
    return score>=80?'PRESTIGE DEALER':score>=60?'REGIONAL SPECIALIST':
      score>=40?'TRUSTED DEALER':score>=20?'LOCAL DEALER':'NEW TRADER';
  }
  function legacyScore(sold){return clamp(5+(sold||0)*2,0,100);}
  function initial(){return {reputationScore:5,staff:[],nextStaffId:1,
    payrollArrears:0,reputationHistory:[]};}
  function applicants(day){
    const cycle=Math.floor((day-1)/7);
    return ROLES.flatMap((role,index)=>{
      const source=CANDIDATES[role];
      const position=(cycle+index)%source.length;
      return [0,1].map(i=>{
        const v=source[(position+i*2)%source.length];
        const [name,ability,negotiation,care,knowledge,reliability,salary,experience]=v;
        const id='C-'+cycle+'-'+role+'-'+i;
        const skills={
          sales:role==='sales'?ability:clamp(ability-2,1,20),
          negotiation,care,knowledge,
          diagnostics:role==='technician'?ability:clamp(knowledge-5,1,20),
          efficiency:role==='technician'?clamp(ability+1,1,20):clamp(ability-3,1,20),
          reliability
        };
        return {id,name,role,skills,monthlySalary:salary,experience};
      });
    });
  }
  const dailyCost=employee=>Math.ceil(employee.monthlySalary/30);
  function active(state,role){
    if(state.payrollArrears>0)return null;
    return state.staff.find(s=>s.role===role&&state.day>=s.startDay&&
      (s.trainingUntil===null||state.day>=s.trainingUntil))||null;
  }
  function buyerDiscount(state){
    const buyer=active(state,'buyer');
    return buyer?clamp((buyer.skills.negotiation-10)*20,0,180):0;
  }
  function buyerEstimate(state,actual){
    const buyer=active(state,'buyer');
    if(!buyer)return null;
    const spread=clamp(300-(buyer.skills.knowledge-7)*14,65,300);
    const mid=Math.round(actual/50)*50;
    return {lower:Math.max(0,Math.round((mid-spread)/25)*25),
      upper:Math.round((mid+spread)/25)*25};
  }
  function salesBonus(state){
    const seller=active(state,'sales');
    if(!seller)return 0;
    return clamp((seller.skills.sales-9)*20,0,180);
  }
  function labourSaving(state,vehicle){
    const tech=active(state,'technician');
    if(!tech)return 0;
    // Only the basic labour/coordination share can improve, not parts or
    // undisclosed damage. Up to 12% of the known prep budget.
    const rate=clamp((tech.skills.efficiency-8)/100,0,.12);
    return Math.min(175,Math.round((vehicle.profile?.basePrep||vehicle.prepBudget)*rate/5)*5);
  }
  function reserve(state){
    return state.vehicles.filter(v=>v.status==='acquired')
      .reduce((n,v)=>n+v.prepBudget,0);
  }
  function expense(state,amount,label){
    if(amount<=0)return;
    state.cash-=amount;
    state.ledger.push({day:state.day,delta:-amount,note:label});
  }
  const failure=(code,message)=>({ok:false,code,message});
  const ok=message=>({ok:true,message});
  function hire(state,id){
    const candidate=applicants(state.day).find(c=>c.id===id);
    if(!candidate)return failure('expired','That applicant is no longer available this week.');
    if(state.staff.some(s=>s.role===candidate.role))
      return failure('role','You already employ somebody in that role at this dealership.');
    if(state.staff.length>=MAX_STAFF)
      return failure('capacity','This small dealership supports up to three employees.');
    const weeklyCover=dailyCost(candidate)*7;
    const required=HIRING_FEE+reserve(state)+weeklyCover+state.payrollArrears;
    if(state.cash<required)return failure('cash','Recruitment requires £'+required.toLocaleString('en-GB')+
      ' in available cash: joining fee, one week of wages and stock preparation.');
    expense(state,HIRING_FEE,'Recruitment and onboarding: '+candidate.name);
    state.staff.push({...candidate,candidateId:candidate.id,id:state.nextStaffId++,hiredDay:state.day,
      startDay:state.day+1,trainingUntil:null,lastTrainingDay:0,morale:72,
      deals:0,workDone:0});
    return ok(candidate.name+' hired as '+candidate.role+
      '. Starts next game day. £'+HIRING_FEE+' onboarding charged.');
  }
  function train(state,id){
    const employee=state.staff.find(s=>s.id===id);
    if(!employee)return failure('missing','Employee not found.');
    if(employee.trainingUntil!==null&&state.day<employee.trainingUntil)
      return failure('busy','Employee is already training.');
    if(employee.lastTrainingDay&&state.day-employee.lastTrainingDay<14)
      return failure('cooldown','Training can be repeated after 14 game days.');
    if(state.cash<TRAINING_FEE+reserve(state)+state.payrollArrears)
      return failure('cash','Insufficient unreserved cash for training.');
    expense(state,TRAINING_FEE,'Staff development: '+employee.name);
    employee.lastTrainingDay=state.day;
    employee.trainingUntil=state.day+2;
    const attribute=employee.role==='sales'?'sales':
      employee.role==='buyer'?'negotiation':'diagnostics';
    employee.skills[attribute]=clamp(employee.skills[attribute]+1,1,20);
    if(employee.role==='technician')
      employee.skills.efficiency=clamp(employee.skills.efficiency+1,1,20);
    if(employee.role==='sales')
      employee.skills.care=clamp(employee.skills.care+1,1,20);
    if(employee.role==='buyer')
      employee.skills.knowledge=clamp(employee.skills.knowledge+1,1,20);
    employee.morale=clamp(employee.morale+7,0,100);
    return ok(employee.name+' entered two days of training (£'+TRAINING_FEE+
      '). Their abilities have improved, but they are unavailable until day '+
      employee.trainingUntil+'.');
  }
  function release(state,id){
    const index=state.staff.findIndex(s=>s.id===id);
    if(index<0)return failure('missing','Employee not found.');
    const employee=state.staff[index];
    const notice=dailyCost(employee)*7;
    const covered=Math.min(Math.max(0,state.cash-reserve(state)),notice);
    expense(state,covered,'Staff exit and provisional notice payment: '+employee.name);
    state.payrollArrears+=notice-covered;
    state.staff.splice(index,1);
    return ok(employee.name+' released. Estimated seven-day notice cost £'+notice+
      (notice>covered?'; £'+(notice-covered)+' remains payable.':'.'));
  }
  function advance(state){
    const payroll=state.staff.reduce((total,employee)=>total+dailyCost(employee),0);
    const due=state.payrollArrears+payroll;
    const paid=Math.min(Math.max(0,state.cash-reserve(state)),due);
    expense(state,paid,'Staff payroll daily settlement');
    state.payrollArrears=due-paid;
    for(const employee of state.staff){
      if(state.payrollArrears>0)employee.morale=clamp(employee.morale-9,0,100);
      else if(state.day%7===0)employee.morale=clamp(employee.morale-1,0,100);
    }
    if(state.payrollArrears>0){
      const old=state.reputationScore;
      state.reputationScore=clamp(old-1,0,100);
      if(old!==state.reputationScore)record(state,-1,'Unpaid staff wages damaged trust');
    }
    if(state.staff.some(e=>e.morale<=15)){
      // Low-morale departures are deterministic and keep unpaid wage
      // liabilities; the game never silently writes off staff pay.
      const departures=state.staff.filter(e=>e.morale<=15).map(e=>e.name);
      state.staff=state.staff.filter(e=>e.morale>15);
      return {payroll,paid,arrears:state.payrollArrears,departures};
    }
    return {payroll,paid,arrears:state.payrollArrears,departures:[]};
  }
  function record(state,delta,reason){
    state.reputationHistory.push({day:state.day,delta,reason});
    if(state.reputationHistory.length>90)state.reputationHistory.shift();
  }
  function sale(state,vehicle,price,grossProfit){
    const worker=active(state,'sales');
    const service=worker?.skills.care??11;
    const grade=vehicle.profile?.grade??3;
    const fair=vehicle.profile?.likelySale??price;
    let change=1;
    let reason='Completed retail sale';
    if(grade<=2){change+=1;reason='Well-prepared, high-grade car sold';}
    if(grade>=4){change-=3;reason='High-condition-risk stock reduced customer trust';}
    if(price>fair+250){change-=1;reason+='; price exceeded expected retail value';}
    if(service>=16){change+=1;reason+='; excellent sales care';}
    if(service<=7){change-=1;reason+='; poor customer care';}
    if(state.payrollArrears>0){change-=1;reason+='; outstanding staff obligations';}
    const before=state.reputationScore;
    state.reputationScore=clamp(before+change,0,100);
    const applied=state.reputationScore-before;
    record(state,applied,reason);
    let commission=0;
    if(worker){
      worker.deals++;
      worker.morale=clamp(worker.morale+2,0,100);
      commission=Math.max(0,Math.round(grossProfit*.03));
      const paid=Math.min(state.cash,commission);
      expense(state,paid,'Sales commission: '+worker.name);
      state.payrollArrears+=commission-paid;
    }
    return {reputationDelta:applied,reason,commission};
  }
  function worked(state){
    const tech=active(state,'technician');
    if(tech){tech.workDone++;tech.morale=clamp(tech.morale+1,0,100);}
  }
  function valid(state,day){
    if(!integer(state.reputationScore)||state.reputationScore<0||state.reputationScore>100||
       !Array.isArray(state.staff)||state.staff.length>MAX_STAFF||
       !integer(state.nextStaffId)||state.nextStaffId<1||
       !integer(state.payrollArrears)||state.payrollArrears<0||
       state.payrollArrears>10000000||
       !Array.isArray(state.reputationHistory)||state.reputationHistory.length>90)return false;
    const keys=new Set(),roles=new Set();
    for(const s of state.staff){
      if(!s||!integer(s.id)||s.id<1||s.id>=state.nextStaffId||keys.has(s.id)||
         !ROLES.includes(s.role)||roles.has(s.role)||
         typeof s.name!=='string'||s.name.length<2||s.name.length>60||
         typeof s.candidateId!=='string'&&typeof s.candidateId!=='undefined'||
         !integer(s.monthlySalary)||s.monthlySalary<1000||s.monthlySalary>7000||
         !integer(s.experience)||s.experience<0||s.experience>45||
         !integer(s.hiredDay)||s.hiredDay<1||s.hiredDay>day||
         !integer(s.startDay)||s.startDay!==s.hiredDay+1||
         (s.trainingUntil!==null&&(!integer(s.trainingUntil)||s.trainingUntil<s.hiredDay))||
         !integer(s.lastTrainingDay)||s.lastTrainingDay<0||s.lastTrainingDay>day||
         !integer(s.morale)||s.morale<0||s.morale>100||
         !integer(s.deals)||s.deals<0||!integer(s.workDone)||s.workDone<0||
         !s.skills||typeof s.skills!=='object'||!Object.values(s.skills).every(skill)||
         !['sales','negotiation','care','knowledge','diagnostics','efficiency','reliability']
           .every(k=>skill(s.skills[k])))return false;
      keys.add(s.id);roles.add(s.role);
    }
    return state.reputationHistory.every(x=>x&&integer(x.day)&&x.day>=1&&x.day<=day&&
      integer(x.delta)&&x.delta>=-10&&x.delta<=10&&
      typeof x.reason==='string'&&x.reason.length<=160);
  }
  function clone(state) {
    return {reputationScore:state.reputationScore,
      staff:state.staff.map(e=>({...e,skills:{...e.skills}})),
      nextStaffId:state.nextStaffId,payrollArrears:state.payrollArrears,
      reputationHistory:state.reputationHistory.map(e=>({...e}))};
  }
  window.MotorTradePeople=Object.freeze({
    MAX_STAFF,HIRING_FEE,TRAINING_FEE,ROLES,tier,legacyScore,initial,
    applicants,dailyCost,active,buyerDiscount,buyerEstimate,salesBonus,
    labourSaving,hire,train,release,advance,sale,worked,valid,clone
  });
})();
