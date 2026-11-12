'use strict';
/* The Motor Trade v0.5 — fictional staff, wages and reputation progression.
 * Payroll is SETTLED DAILY at 1/30 of an illustrative monthly wage, not a
 * simulation of UK payroll law. NI, pensions and formal employment contracts
 * are not modelled. Effects apply from the employee's second game day.
 */
(() => {
  const MAX_STAFF=13, HIRING_FEE=150, TRAINING_FEE=275, WAGE_COVER_DAYS=3;
  const ROLES=['sales','buyer','technician','supervisor'];
  const CANDIDATES=Object.freeze({
    sales:[
      ['Daniel Harris',17,15,12,14,16,2350,6],
      ['Maya Collins',11,12,18,14,16,1850,2],
      ['Lewis Carter',8,10,11,12,13,1550,1],
      ['Amira Shah',15,17,17,13,18,2675,8],
      ['Grace Thompson',18,16,18,15,18,3100,11],
      ['Owen Brooks',12,13,14,12,16,1925,4],
      ['Zara Mahmood',16,18,16,14,19,2925,9],
      ['Liam Edwards',9,12,13,10,14,1675,2]
    ],
    buyer:[
      ['James Bennett',13,18,12,17,16,2450,7],
      ['Sophie Reed',12,11,15,14,18,1750,2],
      ['Aaron Patel',11,9,12,10,12,1500,1],
      ['Eleanor Price',15,19,16,19,17,2900,10]
    ],
    supervisor:[
      ['Sarah Mitchell',15,15,18,17,18,2850,9],
      ['David Clarke',13,16,15,16,17,2550,7],
      ['Nadia Rahman',16,17,19,16,19,3350,12],
      ['Tom Fletcher',11,13,13,15,15,2200,5],
      ['Leanne Price',15,14,18,15,17,2925,8],
      ['Imran Hussain',14,17,16,16,18,2750,10]
    ],
    technician:[
      ['Michael Turner',10,11,13,13,15,1925,3],
      ['Ryan Foster',9,10,14,10,11,1650,1],
      ['Priya Morgan',17,12,17,18,19,2700,7],
      ['Ben Walker',13,9,12,13,14,2250,4],
      ['Oliver Hughes',15,12,14,15,17,2380,5],
      ['Aisha Khan',16,12,17,17,18,2520,6],
      ['Chloe Baker',11,10,15,13,16,1820,2],
      ['Nathan Green',14,11,13,16,15,2220,5],
      ['Ella Davies',12,12,16,14,17,1950,3],
      ['Yusuf Ahmed',18,14,15,18,18,2875,9],
      ['Leah Morris',15,11,17,15,17,2375,6],
      ['Marcus Allen',10,10,13,11,15,1750,2],
      ['Holly Price',13,11,15,15,17,2150,4],
      ['Ethan Rogers',17,10,15,17,16,2610,7],
      ['Noor Iqbal',12,12,14,12,18,2040,3],
      ['Toby Wilson',9,10,12,12,14,1575,1],
      ['Isla Stewart',16,12,16,17,19,2725,8],
      ['Kai Robinson',14,11,15,14,17,2240,5]
    ]
  });
  const integer=n=>Number.isSafeInteger(n);
  const skill=n=>integer(n)&&n>=1&&n<=20;
  const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
  function tier(score){
    return score>=80?'PRESTIGE DEALER':score>=60?'REGIONAL SPECIALIST':
      score>=40?'TRUSTED DEALER':score>=20?'LOCAL DEALER':'NEW TRADER';
  }
  function legacyScore(sold){
    // Preserve the old career standing where possible: the earlier game
    // labelled 5+ sales LOCAL TRADER and 12+ ESTABLISHED. A converted
    // career should not fall back to a newcomer tier after migration.
    const count=Math.max(0,sold||0);
    if(count>=12)return clamp(40+(count-12),40,75);
    if(count>=5)return clamp(20+(count-5)*2,20,39);
    if(count>=2)return 10+(count-2)*2;
    return 5+count*2;
  }
  function initial(){return {reputationScore:5,staff:[],nextStaffId:1,
    payrollArrears:0,reputationHistory:[]};}
  function applicants(day){
    const cycle=Math.floor((day-1)/7);
    return ROLES.flatMap((role,index)=>{
      const source=CANDIDATES[role];
      const position=(cycle*3+index)%source.length;
      return Array.from({length:role==='technician'?8:role==='sales'?4:2},(_,i)=>{
        const v=source[(position+(role==='technician'?i:i*2))%source.length];
        const [name,ability,negotiation,care,knowledge,reliability,salary,experience]=v;
        const id='C-'+cycle+'-'+role+'-'+i;
        const skills={
          sales:role==='sales'?ability:clamp(ability-2,1,20),
          negotiation,care,knowledge,
          diagnostics:role==='technician'?ability:clamp(knowledge-5,1,20),
          efficiency:role==='technician'?clamp(ability+1,1,20):clamp(ability-3,1,20),
          reliability
        };
        return {id,name,role,skills,monthlySalary:marketSalary(role,salary),experience};
      });
    });
  }
  // 2026/27 GB 21+ National Living Wage £12.71/hour. New candidates are
  // modelled as 40 paid hours/week, 52 weeks/year; minimum legal basic is
  // £26,436.80/year. Round the minimum *up*, never down. Commission is extra
  // and cannot be relied on to make an unpaid day compliant.
  const MINIMUM_FULL_TIME_MONTHLY=Math.ceil(12.71*40*52/12);
  const PAY_BANDS=Object.freeze({
    sales:{minimum:2250,uplift:0},buyer:{minimum:2550,uplift:350},
    technician:{minimum:2850,uplift:750},supervisor:{minimum:3100,uplift:450}
  });
  function marketSalary(role,legacyMonthly){
    const band=PAY_BANDS[role];
    return Math.max(MINIMUM_FULL_TIME_MONTHLY,band.minimum,legacyMonthly+band.uplift);
  }
  const dailyCost=employee=>Math.ceil(employee.monthlySalary/30);
  // Reputation grants more repair bays; existing hires remain employed if
  // reputation later drops, but new hires wait until the tier is restored.
  const technicianLimit=state=>Math.min(state.reputationScore>=80?8:
    state.reputationScore>=40?6:4,window.MotorTradePremises?.bays(state)??4);
  const salesLimit=state=>state.reputationScore>=80?3:
    state.reputationScore>=40?2:1;
  const staffLimit=state=>2+salesLimit(state)+technicianLimit(state);
  const roleLimit=(state,role)=>role==='technician'?technicianLimit(state):
    role==='sales'?salesLimit(state):1;
  const isActive=(state,employee)=>!!employee&&state.payrollArrears===0&&
    state.day>=employee.startDay&&
    (employee.trainingUntil===null||state.day>=employee.trainingUntil);
  const activeTeam=(state,role)=>state.staff.filter(s=>s.role===role&&isActive(state,s));
  const active=(state,role)=>activeTeam(state,role)[0]||null;
  const supervisor=state=>active(state,'supervisor');
  function availableTechnicians(state){
    const occupied=new Set((state.vehicles||[]).filter(v=>
      v.workshop?.method==='internal'&&
      ['in-progress','quality-check'].includes(v.workshop.stage))
      .map(v=>v.workshop.technicianId));
    return activeTeam(state,'technician').filter(s=>!occupied.has(s.id));
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
  // Each customer is allocated a salesperson on first contact, so extra
  // hires add service capacity rather than silently paying for idle staff.
  // An assigned employee who leaves or is training cannot magically help.
  function salesRep(state,customerOrVehicle=0){
    const team=activeTeam(state,'sales');
    if(!team.length)return null;
    if(customerOrVehicle&&typeof customerOrVehicle==='object'&&
       Object.hasOwn(customerOrVehicle,'salespersonId'))
      return team.find(e=>e.id===customerOrVehicle.salespersonId)||null;
    const id=typeof customerOrVehicle==='number'?customerOrVehicle:
      customerOrVehicle?.vehicleId||1;
    return team[Math.abs(id-1)%team.length];
  }
  function salesProfile(rep){
    if(!rep)return {salesperson:null,enquiryLift:0,arrivalLift:0,driveLift:0,
      counterLift:0,fastViewing:false,commissionRate:0};
    const rating=clamp(Math.round((rep.skills.sales*2+
      rep.skills.care+rep.skills.reliability)/4)+
      ((rep.morale??72)>=80?1:(rep.morale??72)<45?-2:0),1,20);
    return {salesperson:rep,
      enquiryLift:clamp(Math.round((rating-9)*1.7),0,16),
      arrivalLift:clamp(Math.floor((rating-10)/3),0,3),
      driveLift:clamp(rating-9,0,9),
      counterLift:clamp((rating-10)*2,0,16),
      fastViewing:rep.skills.sales>=15&&rep.skills.reliability>=14&&(rep.morale??72)>=50,
      commissionRate:rep.skills.sales>=17?.06:
        rep.skills.sales>=15?.05:rep.skills.sales>=12?.04:
        rep.skills.sales>=10?.03:.02};
  }
  function salesImpact(state,customerOrVehicle=0){
    return salesProfile(salesRep(state,customerOrVehicle));
  }
  function salesBonus(state,customerOrVehicle=0){
    const rep=salesRep(state,customerOrVehicle);
    return rep?clamp((rep.skills.sales-9)*20,0,180):0;
  }
  function labourSaving(state,vehicle,tech=active(state,'technician')){
    if(!tech)return 0;
    // Only the basic labour/coordination share can improve, not parts or
    // undisclosed damage. Up to 12% of the known prep budget.
    const rate=clamp((tech.skills.efficiency-8)/100,0,.12);
    return Math.min(175,Math.round((vehicle.profile?.basePrep||vehicle.prepBudget)*rate/5)*5);
  }
  function reserve(state){
    return state.vehicles.filter(v=>v.status==='acquired')
      .reduce((n,v)=>n+(['in-progress','quality-check'].includes(v.workshop?.stage)?
        0:v.prepBudget),0);
  }
  function expense(state,amount,label){
    if(amount<=0)return;
    state.cash-=amount;
    state.ledger.push({day:state.day,delta:-amount,note:label});
  }
  const failure=(code,message)=>({ok:false,code,message});
  const ok=message=>({ok:true,message});
  function hireQuote(state,candidate){
    const daily=state.staff.reduce((n,e)=>n+dailyCost(e),0)+dailyCost(candidate);
    const protectedStock=reserve(state);
    const required=HIRING_FEE+protectedStock+daily*WAGE_COVER_DAYS+state.payrollArrears;
    return {required,protectedStock,dailyWages:daily,coverDays:WAGE_COVER_DAYS,
      shortfall:Math.max(0,required-state.cash)};
  }
  function hire(state,id){
    const candidate=applicants(state.day).find(c=>c.id===id);
    if(!candidate)return failure('expired','That applicant is no longer available this week.');
    if(state.staff.some(s=>s.name===candidate.name))
      return failure('duplicate','That applicant is already on your payroll.');
    const inRole=state.staff.filter(s=>s.role===candidate.role).length;
    if(inRole>=roleLimit(state,candidate.role))
      return failure('role',candidate.role==='technician'?
        'Technician places are full. Reputation AND an upgraded workshop are required for more repair bays.':
        'You already employ somebody in that role at this dealership.');
    if(state.staff.length>=staffLimit(state)||state.staff.length>=MAX_STAFF)
      return failure('capacity','You have reached your current dealership staffing limit.');
    const quote=hireQuote(state,candidate);
    if(quote.shortfall)return failure('cash','Need £'+quote.required.toLocaleString('en-GB')+
      ' total cash (£'+quote.shortfall.toLocaleString('en-GB')+
      ' short), including the joining fee, three days of wages and protected vehicle repairs. '+ 
      'Sell prepared stock or use an external garage until the payroll is affordable.');
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
      employee.role==='buyer'?'negotiation':
      employee.role==='supervisor'?'care':'diagnostics';
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
  function welfareCost(employee){
    // One-off recognition/support budget, not an invented salary rise.
    return 125+Math.round(employee.monthlySalary/100/5)*5;
  }
  function moraleProposal(state,employeeId){
    const employee=state.staff.find(s=>s.id===employeeId);
    const manager=supervisor(state);
    if(!manager||!employee||employee.role==='supervisor'||
       employee.morale<=0||employee.morale>45||state.payrollArrears>0)return null;
    return {employee,manager,cost:welfareCost(employee),
      gain:12+Math.max(0,Math.floor((manager.skills.care-10)/3))};
  }
  function decideMorale(state,messageId,approve){
    if(typeof approve!=='boolean')return failure('decision','Choose approve or decline.');
    const message=state.messages.find(m=>m.id===messageId);
    const match=message&&/^supervisor-morale:(\d+):\d+$/.exec(message.reference||'');
    if(!match||message.decision)return failure('stage','This supervisor recommendation is no longer pending.');
    const plan=moraleProposal(state,Number(match[1]));
    if(!plan)return failure('expired','This recommendation is no longer valid. Recheck the employee and supervisor availability.');
    if(approve){
      if(state.cash<plan.cost+reserve(state)+state.payrollArrears)
        return failure('cash','Insufficient unreserved cash for the proposed £'+plan.cost+
          ' welfare budget. Existing repair and wage commitments remain protected.');
      expense(state,plan.cost,'Staff welfare intervention: '+plan.employee.name);
      plan.employee.morale=clamp(plan.employee.morale+plan.gain,0,100);
      message.decision='approved';
      return ok(plan.manager.name+' has been authorised to carry out a '+
        'staff welfare and rota-support plan for '+plan.employee.name+'. £'+plan.cost+
        ' charged once; morale increased by '+plan.gain+' to '+plan.employee.morale+'/100.');
    }
    message.decision='declined';
    return ok('You declined '+plan.manager.name+'’s £'+plan.cost+
      ' staff welfare plan. No charge was made. '+plan.employee.name+
      ' remains on their existing rota and morale remains '+plan.employee.morale+'/100.');
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
    const support=[];
    for(const employee of state.staff){
      if(state.payrollArrears>0)employee.morale=clamp(employee.morale-9,0,100);
      else if(state.day%7===0)employee.morale=clamp(employee.morale-1,0,100);
    }
    // A working supervisor routinely checks in with staff every game week.
    // Small, free workplace fixes are delegated, not referred to the owner.
    const manager=supervisor(state);
    if(manager&&state.day%7===0){
      for(const employee of state.staff){
        if(employee.id===manager.id||employee.morale>55||employee.morale<=15)continue;
        const gain=manager.skills.care>=16?5:3;
        employee.morale=clamp(employee.morale+gain,0,100);
        support.push(employee.name+' +'+gain+' morale');
      }
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
      return {payroll,paid,arrears:state.payrollArrears,departures,support,supervisor:manager?.name??null};
    }
    return {payroll,paid,arrears:state.payrollArrears,departures:[],support,supervisor:manager?.name??null};
  }
  function record(state,delta,reason){
    state.reputationHistory.push({day:state.day,delta,reason});
    if(state.reputationHistory.length>90)state.reputationHistory.shift();
  }
  function sale(state,vehicle,price,grossProfit,customer=null){
    const impact=salesImpact(state,customer||vehicle.id);
    const worker=impact.salesperson;
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
    const careImpact=window.MotorTradeEvents?.careBonus(state,vehicle,price)||0;
    if(careImpact){change+=careImpact;reason+='; management focus on customer care';}
    if(state.payrollArrears>0){change-=1;reason+='; outstanding staff obligations';}
    const before=state.reputationScore;
    state.reputationScore=clamp(before+change,0,100);
    const applied=state.reputationScore-before;
    record(state,applied,reason);
    let commission=0;
    if(worker){
      worker.deals++;
      worker.morale=clamp(worker.morale+2,0,100);
      commission=Math.max(0,Math.round(grossProfit*impact.commissionRate));
      // Preserve the workshop reserve for existing and incoming part-ex stock.
      // Any unpaid sales commission remains a liability; gross margin is
      // deliberately reported before staff costs.
      const paid=Math.min(Math.max(0,state.cash-reserve(state)),commission);
      expense(state,paid,'Sales commission: '+worker.name);
      state.payrollArrears+=commission-paid;
    }
    return {reputationDelta:applied,reason,commission,
      commissionRatePct:Math.round(impact.commissionRate*100),
      salespersonId:worker?.id??null,salespersonName:worker?.name??'Owner-managed'};
  }
  function worked(state,technicianId=null){
    const tech=technicianId===null?active(state,'technician'):
      state.staff.find(s=>s.id===technicianId);
    if(tech){tech.workDone++;tech.morale=clamp(tech.morale+1,0,100);}
  }
  function valid(state,day){
    if(!integer(state.reputationScore)||state.reputationScore<0||state.reputationScore>100||
       !Array.isArray(state.staff)||state.staff.length>MAX_STAFF||
       !integer(state.nextStaffId)||state.nextStaffId<1||
       !integer(state.payrollArrears)||state.payrollArrears<0||
       state.payrollArrears>10000000||
       !Array.isArray(state.reputationHistory)||state.reputationHistory.length>90)return false;
    const keys=new Set(),names=new Set(),roleCounts={sales:0,buyer:0,technician:0,supervisor:0};
    for(const s of state.staff){
      if(!s||!integer(s.id)||s.id<1||s.id>=state.nextStaffId||keys.has(s.id)||
         !ROLES.includes(s.role)||names.has(s.name)||
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
      keys.add(s.id);names.add(s.name);roleCounts[s.role]++;
    }
    if(roleCounts.sales>3||roleCounts.buyer>1||roleCounts.technician>8||roleCounts.supervisor>1)return false;
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
    applicants,dailyCost,active,isActive,activeTeam,availableTechnicians,
    technicianLimit,salesLimit,staffLimit,roleLimit,supervisor,moraleProposal,decideMorale,buyerDiscount,buyerEstimate,
    salesRep,salesProfile,salesImpact,salesBonus,hireQuote,WAGE_COVER_DAYS,
    labourSaving,hire,train,release,advance,sale,worked,valid,clone
  });
})();
