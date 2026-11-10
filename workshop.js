'use strict';
/* The Motor Trade v0.8
 * Vehicle preparation requires diagnosis, paid repair work, elapsed game
 * days and a final quality check. Estimates are fictional, not real garage
 * quotations or assurances of roadworthiness.
 */
(() => {
  const P=window.MotorTradePeople;
  const stages=['unassessed','quoted','in-progress','quality-check','ready'];
  const methods=['internal','external'];
  const integer=Number.isSafeInteger;
  const ok=(message,extra={})=>({ok:true,changed:true,message,...extra});
  const fail=(code,message)=>({ok:false,code,message});
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  function hash(t){
    let n=2166136261;
    for(const c of String(t))n=Math.imul(n^c.charCodeAt(0),16777619)>>>0;
    return n>>>0;
  }
  function initial(vehicle){
    const ready=vehicle.status==='prepared'||vehicle.status==='listed';
    return {stage:ready?'ready':'unassessed',
      assessmentFee:0,method:null,repairCost:ready?vehicle.prepSpent:0,
      remainingDays:0,plannedDays:0,partsDelay:0,startedDay:null,
      completedDay:ready?vehicle.acquiredDay:null,
      technicianId:null,reworks:0,paused:false};
  }
  const reservedCost=v=>v.status==='acquired' &&
    !['in-progress','quality-check'].includes(v.workshop?.stage)?v.prepBudget:0;
  function reserved(state,exceptId=null){
    return state.vehicles.reduce((n,v)=>n+(v.id===exceptId?0:reservedCost(v)),0);
  }
  function find(state,id){
    return state.vehicles.find(v=>v.id===id);
  }
  function charge(state,amount,note){
    state.cash-=amount;
    state.ledger.push({day:state.day,delta:-amount,note});
  }
  function assess(state,id){
    const vehicle=find(state,id);
    if(!vehicle)return fail('missing','Vehicle is not in stock.');
    const job=vehicle.workshop;
    if(vehicle.status!=='acquired'||job.stage!=='unassessed')
      return fail('already','Assessment is only available for newly acquired, unassessed stock.');
    const technician=P.active(state,'technician');
    const fee=technician?30:55;
    if(state.cash<reserved(state)+fee)
      return fail('cash','Insufficient unreserved cash for the £'+fee+' assessment. Preparation reserves are protected.');
    charge(state,fee,'Workshop assessment: '+vehicle.title);
    vehicle.cost+=fee; // The diagnostic fee stays in the car's real acquisition basis.
    job.assessmentFee=fee;
    job.stage='quoted';
    const extra=vehicle.profile?.hiddenFault;
    const detail=extra?' Additional repair identified: '+extra.item+' (£'+extra.cost+').':
      ' No further defect identified beyond known work.';
    return ok('Workshop assessment £'+fee+' completed for '+vehicle.title+'.'+detail+
      ' Choose a repair method; neither option is instantaneous.');
  }
  function quote(state,vehicle,method){
    if(!methods.includes(method))return null;
    const tech=P.active(state,'technician');
    if(method==='internal'&&!tech)return null;
    const base=vehicle.prepBudget;
    const saving=method==='internal'?P.labourSaving(state,vehicle):0;
    const supplement=method==='external'?Math.round((base*.12+75)/5)*5:0;
    const cost=base-saving+supplement;
    const grade=vehicle.profile?.grade??3;
    const partsDelay=hash(vehicle.origin+'|parts')%3; // Stable 0–2 day delay.
    const effort=clamp(1+Math.ceil(base/340)+(grade>=4?1:0),2,6);
    const efficiency=method==='internal'&&tech.skills.efficiency>=16?1:0;
    const duration=clamp(effort-efficiency+(method==='external'?0:1)+partsDelay,2,9);
    return {method,cost,duration,partsDelay,saving,supplement,
      technicianId:method==='internal'?tech.id:null,
      provider:method==='external'?'Independent external garage':tech.name};
  }
  function start(state,id,method){
    const vehicle=find(state,id);
    if(!vehicle)return fail('missing','Vehicle not found.');
    if(vehicle.status!=='acquired'||vehicle.workshop.stage!=='quoted')
      return fail('stage','Obtain a workshop assessment before booking repairs.');
    const q=quote(state,vehicle,method);
    if(!q)return fail('staff','An available prep technician is required for internal repairs. Use an external garage instead.');
    if(method==='internal'&&state.vehicles.some(v=>v.id!==id&&
       v.workshop?.stage==='in-progress'&&v.workshop.method==='internal'))
      return fail('busy','Your technician already has a vehicle in progress. Complete it or outsource this one.');
    if(method==='external'&&state.vehicles.filter(v=>v.id!==id&&
       v.workshop?.stage==='in-progress'&&v.workshop.method==='external').length>=2)
      return fail('busy','External garage capacity is full. Try again when a job is completed.');
    if(q.cost>state.cash-reserved(state,id))
      return fail('cash','Insufficient cash for '+q.provider+
        ' (£'+q.cost+'). Money needed for other unprepared stock is protected.');
    charge(state,q.cost,'Workshop repair booking: '+vehicle.title+
      ' ('+q.provider+')');
    Object.assign(vehicle.workshop,{stage:'in-progress',method,
      repairCost:q.cost,remainingDays:q.duration,plannedDays:q.duration,
      partsDelay:q.partsDelay,startedDay:state.day,completedDay:null,
      technicianId:q.technicianId,reworks:0,paused:false});
    return ok(vehicle.title+' booked with '+q.provider+' for £'+q.cost+
      '. Estimated turnaround '+q.duration+' game days'+
      (q.partsDelay?', including '+q.partsDelay+' parts-wait day(s)':'')+
      '. This car cannot be advertised until repairs and quality control finish.');
  }
  function advance(state){
    const events=[];
    for(const v of state.vehicles){
      const job=v.workshop;
      if(!job||job.stage!=='in-progress'||state.day<=job.startedDay)continue;
      if(job.method==='internal'&&P.active(state,'technician')?.id!==job.technicianId){
        job.paused=true;
        events.push(v.title+' repair paused: assigned technician is unavailable.');
        continue;
      }
      job.paused=false;
      job.remainingDays=Math.max(0,job.remainingDays-1);
      if(job.remainingDays===0){
        job.stage='quality-check';
        events.push(v.title+' repairs finished. Complete the final quality check in Workshop.');
      }
    }
    return events;
  }
  function transfer(state,id){
    const v=find(state,id);
    if(!v)return fail('missing','Vehicle not found.');
    const j=v.workshop;
    if(j?.stage!=='in-progress'||j.method!=='internal')
      return fail('stage','Only an active in-house repair can be transferred externally.');
    const chargeAmount=125;
    if(chargeAmount>state.cash-reserved(state))
      return fail('cash','Insufficient cash to transfer repair work to a garage (£125).');
    charge(state,chargeAmount,'Workshop transfer to outside garage: '+v.title);
    j.repairCost+=chargeAmount;
    j.method='external';
    j.technicianId=null;
    j.remainingDays=Math.max(2,j.remainingDays);
    j.plannedDays+=1;
    j.paused=false;
    return ok(v.title+' transferred to an external garage. £125 charged; remaining turnaround '+
      j.remainingDays+' game days.');
  }
  function quality(state,id){
    const v=find(state,id);
    if(!v)return fail('missing','Vehicle not found.');
    const j=v.workshop;
    if(v.status!=='acquired'||j?.stage!=='quality-check')
      return fail('stage','The repair work must finish before a final quality check.');
    const tech=state.staff.find(x=>x.id===j.technicianId);
    const reliability=tech?.skills.reliability??11;
    const risk=(v.profile?.grade>=4?25:14)-(j.method==='internal'?Math.max(0,reliability-12):0);
    const reworkNeeded=j.reworks===0 && hash('quality|'+v.origin)%100<risk;
    if(reworkNeeded){
      const cost=95+(hash(v.origin+'|rectification')%4)*25;
      if(state.cash<cost+reserved(state))
        return fail('cash','Quality control found additional work costing £'+cost+
          '. Deposit more available cash before authorising rectification.');
      charge(state,cost,'Workshop quality rectification: '+v.title);
      j.repairCost+=cost;
      j.stage='in-progress';
      j.reworks=1;
      j.remainingDays=1;
      j.plannedDays+=1;
      j.startedDay=state.day;
      return ok('Quality check found further work on '+v.title+
        '. £'+cost+' rectification charged and one extra repair day required.');
    }
    j.stage='ready';
    j.completedDay=state.day;
    j.remainingDays=0;
    j.paused=false;
    v.prepSpent=j.repairCost;
    v.status='prepared';
    if(j.method==='internal')P.worked(state);
    return ok(v.title+' passed final quality control. £'+j.repairCost+
      ' in repair costs recorded. It is now ready to advertise.');
  }
  function valid(vehicle,day,legacy=false){
    const j=vehicle.workshop;
    if(!j||typeof j!=='object'||Array.isArray(j))return false;
    const num=(v,upper=100000)=>integer(v)&&v>=0&&v<=upper;
    if(!stages.includes(j.stage)||!num(j.assessmentFee,200)||
       !num(j.repairCost)||!num(j.remainingDays,12)||!num(j.plannedDays,20)||
       !num(j.partsDelay,3)||!num(j.reworks,1)||
       typeof j.paused!=='boolean'||
       (j.startedDay!==null&&(!num(j.startedDay,36500)||j.startedDay>day))||
       (j.completedDay!==null&&(!num(j.completedDay,36500)||j.completedDay>day))||
       (j.technicianId!==null&&(!num(j.technicianId,100000)||j.technicianId===0))||
       (j.method!==null&&!methods.includes(j.method)))return false;
    if(vehicle.status==='acquired'&&j.stage==='ready')return false;
    if(vehicle.status!=='acquired'&&j.stage!=='ready')return false;
    if(j.stage==='unassessed'&&(j.assessmentFee!==0||j.repairCost!==0||j.method!==null))return false;
    if(j.stage==='quoted'&&(j.assessmentFee===0||j.repairCost!==0||j.method!==null))return false;
    if(['in-progress','quality-check'].includes(j.stage)&&
       (j.assessmentFee===0||!methods.includes(j.method)||j.repairCost<=0||
        j.startedDay===null||j.plannedDays<1))return false;
    if(j.stage==='quality-check'&&j.remainingDays!==0)return false;
    if(j.stage==='ready'&&(vehicle.prepSpent!==j.repairCost||
       j.completedDay===null))return false;
    if(j.stage!=='ready'&&vehicle.prepSpent!==0)return false;
    return true;
  }
  window.MotorTradeWorkshop=Object.freeze({
    initial,reservedCost,reserved,assess,quote,start,advance,transfer,quality,valid
  });
})();