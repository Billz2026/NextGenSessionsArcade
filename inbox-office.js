'use strict';
/* v0.9.13 — read-only owner communications plus real workshop authorisation.
 * The accounts office reports ledger-backed transactions only. Reading mail
 * never pays an invoice. Repair approval delegates to the existing engine.
 */
(() => {
  const money=n=>new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP',
    maximumFractionDigits:0}).format(n);
  const esc=x=>String(x).replace(/[&<>"']/g,c=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const categories=['all','action','operations','staff','accounts','sales','reports'];
  const labels={all:'ALL MAIL',action:'NEEDS APPROVAL',operations:'WORKSHOP & BUYING',
    staff:'STAFF',accounts:'ACCOUNTS',sales:'CUSTOMERS',reports:'REPORTS'};
  const infer=m=>{
    if(['operations','staff','accounts','sales','reports'].includes(m.category))return m.category;
    const sender=m.from.toUpperCase();
    if(/ACCOUNTS|FINANCE/.test(sender))return 'accounts';
    if(/SALES|CUSTOMER/.test(sender))return 'sales';
    if(/STAFF|HR|TECHNICIAN|PEOPLE/.test(sender))return 'staff';
    if(/REPORT|MANAGEMENT/.test(sender))return 'reports';
    return 'operations';
  };
  const quoteId=m=>{
    const match=/^repair:(\d+)$/.exec(m.reference||'');
    return match?Number(match[1]):null;
  };
  function actionFor(m,state){
    const id=quoteId(m);
    return id===null?null:
      state.vehicles.find(v=>v.id===id&&v.status==='acquired'&&
        v.workshop?.stage==='quoted')||null;
  }
  function needsAction(m,state){return !!actionFor(m,state);}
  function nextId(state){return state.messages.reduce((highest,m)=>Math.max(highest,m.id),0)+1;}
  function emit(state,entry){
    if(entry.reference&&state.messages.some(m=>m.reference===entry.reference))return false;
    state.messages.push({id:nextId(state),day:state.day,read:false,
      from:entry.from,subject:entry.subject,preview:entry.preview,
      body:entry.body,linkPage:entry.linkPage||null,category:entry.category,
      reference:entry.reference||null});
    // Limit long-play mailboxes; retain pending authorisations and unread mail.
    if(state.messages.length>280){
      const removable=state.messages.findIndex(m=>m.read&&!needsAction(m,state));
      if(removable>=0)state.messages.splice(removable,1);
    }
    return true;
  }
  const noteFor=(row)=>{
    const note=row.note,amount=Math.abs(row.delta);
    if(!Number.isSafeInteger(amount)||amount<=0)return null;
    if(row.delta>0&&!note.startsWith('Retail balance received on collection:'))return null;
    let subject,preview,body,from='ACCOUNTS OFFICE',linkPage='finance',category='accounts';
    if(note.startsWith('Auction purchase:')){
      subject='PAID COPY · Auction purchase settlement';
      preview=money(amount)+' paid for a hammered vehicle, including buyer fee.';
      body='PAYMENT CONFIRMATION — AUCTION HOUSE\n\n'+note+
        '\nAmount already paid: '+money(amount)+
        '.\nStatus: PAID — posted to the dealership cash ledger. The buyer fee is included in the acquisition amount. This is an invoice copy, not a new payment request.';
    }else if(note.startsWith('Workshop repair booking:')){
      subject='PAID COPY · Workshop repair authorisation';
      preview=money(amount)+' paid to book a confirmed repair job.';
      body='SUPPLIER PAYMENT CONFIRMATION\n\n'+note+
        '\nAmount already paid: '+money(amount)+
        '.\nStatus: PAID — workshop booking recorded in the cash ledger. No further payment is due on this copy. See Workshop for repair progress.';
      linkPage='workshop';
    }else if(note.startsWith('Recruitment and onboarding:')){
      from='PEOPLE & PAYROLL';category='staff';linkPage='staff';
      subject='New employee onboarded · Cost confirmed';
      preview=money(amount)+' onboarding fee paid; basic wages continue daily.';
      body='Recruitment has been processed.\n\n'+note+
        '\nOnboarding fee already paid: '+money(amount)+
        '.\nThe new employee begins work on the following game day. Their contracted wages are accounted for through payroll; this email does not create another charge.';
    }else if(note.startsWith('Staff development:')){
      from='PEOPLE & PAYROLL';category='staff';linkPage='staff';
      subject='Staff training booked · Cost confirmed';
      preview=money(amount)+' spent on authorised employee development.';
      body='Staff training has been approved and paid.\n\n'+note+
        '\nCost already posted: '+money(amount)+
        '.\nReview employee availability and improved skills in Staff & Recruitment.';
    }else if(note.startsWith('Premises investment:')){
      subject='PAID COPY · Premises investment';
      preview=money(amount)+' capital spend recorded; daily overhead may rise.';
      body='CAPITAL EXPENDITURE CONFIRMATION\n\n'+note+
        '\nAmount already paid: '+money(amount)+
        '.\nStatus: PAID. This is capital expenditure and not a second rent payment or an immediate operating expense.';
      linkPage='business';
    }else if(note.startsWith('Workshop assessment:')){
      from='WORKSHOP SUPERVISOR';category='operations';linkPage='workshop';
      subject='Diagnostic inspection completed';
      preview=money(amount)+' assessment fee charged to the vehicle.';
      body='Workshop assessment completed.\n\n'+note+
        '\nDiagnostic charge already paid: '+money(amount)+
        '.\nIf the vehicle requires repairs, a separate approval request will follow. This is a receipt, not a new invoice.';
    }else if(note.startsWith('Retail balance received on collection:')){
      from='SALES OFFICE';category='sales';linkPage='sales';
      subject='Customer vehicle handover · Funds received';
      preview=money(amount)+' net cash balance banked on collection.';
      body='VEHICLE HANDOVER RECEIPT\n\n'+note+
        '\nThe customer balance was received and posted to the ledger. Any previously held deposit was applied separately. Review the sale and staff commission in Management Reports.';
    }else return null;
    return {from,category,subject,preview,body,linkPage};
  };
  function sync(state,engine){
    let changed=false;
    // Only process NEW entries: never resend old ledger history when an old
    // saved career is upgraded. Cursor is persisted for reload idempotency.
    const from=Math.min(state.inboxLedgerCursor||0,state.ledger.length);
    for(let i=from;i<state.ledger.length;i++){
      const row=state.ledger[i],data=noteFor(row);
      if(data)changed=emit(state,{...data,reference:'ledger:'+i})||changed;
    }
    if(state.inboxLedgerCursor!==state.ledger.length){
      state.inboxLedgerCursor=state.ledger.length;changed=true;
    }
    for(const car of state.vehicles){
      if(car.status!=='acquired'||car.workshop?.stage!=='quoted')continue;
      const internal=engine.prepQuote(state,car.id,'internal');
      const external=engine.prepQuote(state,car.id,'external');
      const text=[
        'Our assessment of '+car.title+' is complete. I need your approval before any repair booking or supplier payment.',
        '',
        internal?'IN-HOUSE TECHNICIAN: '+money(internal.cost)+' · '+internal.duration+' game days.':'IN-HOUSE: no technician/bay currently available.',
        external?'EXTERNAL GARAGE: '+money(external.cost)+' · '+external.duration+' game days.':'EXTERNAL: supplier capacity is currently unavailable.',
        '',
        'The estimate is based on the vehicle condition report. The chosen quote is checked against available cash and outstanding repair commitments when you approve it. No repair booking has been paid for yet.'
      ].join('\n');
      changed=emit(state,{from:'WORKSHOP SUPERVISOR',category:'operations',
        subject:'APPROVAL NEEDED · '+car.title,
        preview:'Choose in-house repairs or the external garage before work starts.',
        body:text,linkPage:'workshop',reference:'repair:'+car.id})||changed;
    }
    const week=Math.floor((state.day-1)/7);
    // One factual management update each game week, not daily bookkeeping
    // spam. Also gives older active careers useful current correspondence
    // immediately after migrating to the expanded Inbox.
    if(state.day>=8){
      const statement=engine.monthly.statement(state);
      const period=week+1;
      const shortfall=Math.max(0,statement.targetUnits-statement.soldUnits);
      const summary='Cash '+money(state.cash)+' · Stock '+state.vehicles.length+'/'+state.capacity+
        ' · Month sales '+statement.soldUnits+'/'+statement.targetUnits+'.';
      changed=emit(state,{from:'ACCOUNTS OFFICE',category:'reports',
        subject:'Weekly management accounts · Week '+period,
        preview:summary,
        body:'OWNER FINANCIAL BRIEF — GAME WEEK '+period+'\n\n'+summary+
          '\nGross trading margin this month: '+money(statement.grossMargin)+
          '.\nOperating contribution after recorded staff and premises expenses: '+
          money(statement.operatingContribution)+
          '.\nStaff wage arrears: '+money(state.payrollArrears)+
          '.\nUnpaid rent and utilities: '+money(state.premises?.arrears||0)+
          '.\nUnit target progress: '+(shortfall?shortfall+' still required':
            statement.soldUnits>statement.targetUnits?'exceeded by '+
              (statement.soldUnits-statement.targetUnits):'reached')+
          '.\n\nFigures are from the current business ledger and monthly report. This is an advisory summary, not a payment request or statutory account.',
        linkPage:'reports',reference:'weekly-brief:'+week})||changed;
    }
    if(state.payrollArrears>0)
      changed=emit(state,{from:'PEOPLE & PAYROLL',category:'staff',
        subject:'ACTION REQUIRED · Outstanding wages',
        preview:money(state.payrollArrears)+' payroll liability needs management attention.',
        body:'Payroll has not been fully settled.\n\nUnpaid staff wages: '+money(state.payrollArrears)+
          '.\nThe game will attempt payment from unreserved cash on subsequent game days. Unpaid wages reduce staff morale and reputation. Review staffing and cash-flow decisions; reading this email does not settle the liability.',
        linkPage:'staff',reference:'wage-arrears:'+week})||changed;
    if(state.premises?.arrears>0)
      changed=emit(state,{from:'ACCOUNTS OFFICE',category:'accounts',
        subject:'ACTION REQUIRED · Premises payment shortfall',
        preview:money(state.premises.arrears)+' in unpaid rent/utilities.',
        body:'Our premises charges have accrued but insufficient unreserved cash was available to pay the full balance.\n\nOutstanding: '+money(state.premises.arrears)+
          '.\nAmounts continue to be paid through the existing daily accounts process when cash is available. This email is NOT a payment button or duplicate invoice.',
        linkPage:'finance',reference:'premises-arrears:'+week})||changed;
    for(const employee of state.staff){
      if(employee.morale>0&&employee.morale<=45)
        changed=emit(state,{from:'PEOPLE & PAYROLL',category:'staff',
          subject:'Staff concern · '+employee.name,
          preview:'Morale '+employee.morale+'/100. Employee retention and work quality are at risk.',
          body:employee.name+' is reporting low morale ('+employee.morale+'/100).\n\nPlease review workload, training opportunities and whether wages are being paid. Training can improve morale, but it costs cash and temporarily removes the employee from the rota. This is a personnel update rather than an automatic resignation or salary request.',
          linkPage:'staff',reference:'morale:'+employee.id+':'+week})||changed;
    }
    for(const c of Object.values(state.customerCases||{})){
      if(c?.status==='booked'&&Number.isSafeInteger(c.appointmentDay)&&c.appointmentDay>=state.day)
        changed=emit(state,{from:'SALES OFFICE',category:'sales',
          subject:'Customer viewing booked · '+c.name,
          preview:'Viewing scheduled for game day '+c.appointmentDay+'. No deposit has been paid.',
          body:'Sales has arranged a viewing with '+c.name+' for game day '+c.appointmentDay+
            '.\n\nThere is no holding deposit at this stage, so the vehicle remains for sale. Confirm attendance and complete a test drive through the Sales Office. Customer attendance is not guaranteed.',
          linkPage:'sales',reference:'viewing:'+c.vehicleId+':'+c.id})||changed;
    }
    return changed;
  }
  function filtered(messages,state,filter){
    const results=[...messages].filter(m=>filter==='all'||
      (filter==='action'?needsAction(m,state):infer(m)===filter));
    return results.sort((a,b)=>
      Number(needsAction(b,state))-Number(needsAction(a,state))||b.day-a.day||b.id-a.id);
  }
  function counters(messages,state){
    return Object.fromEntries(categories.map(category=>
      [category,filtered(messages,state,category).length]));
  }
  function quoteControls(message,state,engine){
    const car=actionFor(message,state);
    if(quoteId(message)===null)return '';
    if(!car)return '<div class="inbox-resolved">This repair request is no longer pending. '+
      'Review the vehicle’s actual status in Workshop.</div>';
    const internal=engine.prepQuote(state,car.id,'internal');
    const external=engine.prepQuote(state,car.id,'external');
    const choices=[['internal',internal,'APPROVE IN-HOUSE'],['external',external,'APPROVE EXTERNAL GARAGE']];
    return '<div class="inbox-approval"><div class="inbox-approval-intro"><strong>OWNER DECISION REQUIRED</strong>'+
      '<small>Select a workshop quote. Approval books and pays the job through the existing workshop account — no separate invoice payment.</small></div>'+
      '<div class="inbox-approval-choices">'+choices.map(([method,q,label])=>
        '<button type="button" class="trade-button" data-action="approve-inbox-repair"'+
        ' data-id="'+car.id+'" data-method="'+method+'"'+(!q?' disabled':'')+'>'+
        label+(q?' · '+money(q.cost)+' / '+q.duration+' DAYS':' · NOT AVAILABLE')+'</button>').join('')+
      '</div></div>';
  }
  window.MotorTradeInbox=Object.freeze({
    categories,labels,infer,quoteId,actionFor,needsAction,sync,filtered,counters,
    quoteControls,esc
  });
})();
