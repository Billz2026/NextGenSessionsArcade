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
  const categories=['all','unread','action','operations','staff','accounts','sales','reports'];
  const labels={all:'ALL MAIL',unread:'UNREAD',action:'NEEDS APPROVAL',operations:'WORKSHOP & BUYING',
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
  const moraleId=m=>{
    const match=/^supervisor-morale:(\d+):\d+$/.exec(m.reference||'');
    return match?Number(match[1]):null;
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
  function enquiryFor(m,state){
    const match=/^retail-enquiry:(C-\d+-\d+-\d+-\d+)$/.exec(m.reference||'');
    if(!match)return null;
    return Object.values(state.customerCases||{}).find(c=>
      c.id===match[1]&&c.status==='enquiry')||null;
  }
  function needsAction(m,state){
    if(actionFor(m,state)||enquiryFor(m,state))return true;
    const id=moraleId(m);
    return id!==null&&!m.decision&&state.payrollArrears===0&&
      !!state.staff.find(e=>e.id===id&&e.morale>0&&e.morale<=45)&&
      !!state.staff.find(e=>e.role==='supervisor'&&state.day>=e.startDay&&
        (e.trainingUntil===null||state.day>=e.trainingUntil));
  }
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
    }else if(note.startsWith('Staff welfare intervention:')){
      from='PEOPLE & PAYROLL';category='staff';linkPage='staff';
      subject='PAID COPY · Approved staff welfare budget';
      preview=money(amount)+' one-off employee support spend, approved by the owner.';
      body='APPROVED STAFF WELFARE EXPENDITURE\n\n'+note+
        '\nAmount settled: '+money(amount)+
        '.\nStatus: PAID. The supervisor is responsible for implementing the agreed rota and welfare support. No additional invoice is payable.';
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
    for(const c of Object.values(state.customerCases||{})){
      if(c.status!=='enquiry')continue;
      const vehicle=state.vehicles.find(v=>v.id===c.vehicleId&&v.status==='listed');
      if(!vehicle)continue;
      const indicative=engine.buyers(vehicle,state)?.cashOffer;
      const budget=Number.isSafeInteger(indicative)?money(indicative):null;
      changed=emit(state,{
        from:'SALES OFFICE',category:'sales',
        subject:'NEW CUSTOMER ENQUIRY · '+vehicle.title,
        preview:c.name+' has asked about stock '+vehicle.id+
          (budget?' · indicative price '+budget+'.':'.'),
        body:c.name+' enquired about '+vehicle.title+' on game day '+c.createdDay+'.\n\n'+
          (budget?'PRE-VIEWING PRICE INDICATION: '+budget+' (NOT a firm or accepted offer).\n'+
            'This is an initial buyer budget question. Actual terms require inspection, a test drive and final negotiation.\n\n':'')+
          'Your buyer is waiting for a response. Open the Sales Office to book a viewing before game day '+
          (c.createdDay+3)+'. The enquiry does not guarantee a purchase: the customer must attend, test drive and agree terms.',
        linkPage:'sales',reference:'retail-enquiry:'+c.id
      })||changed;
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
    const supervisor=engine.people.supervisor(state);
    for(const employee of state.staff){
      if(employee.role==='supervisor'||employee.morale<=0||employee.morale>45)continue;
      const plan=engine.people.moraleProposal(state,employee.id);
      if(plan){
        const body=[
          'I have met with '+employee.name+' following a staff welfare review.',
          '',
          'CURRENT MORALE: '+employee.morale+'/100',
          'PROPOSED ACTION: '+supervisor.name+' will adjust the rota, provide a structured one-to-one support meeting and authorise a modest staff recognition budget.',
          'ONE-OFF COST: '+money(plan.cost),
          'ESTIMATED MORALE IMPROVEMENT: +'+plan.gain+' points (to '+Math.min(100,employee.morale+plan.gain)+'/100).',
          '',
          'Small daily check-ins are already handled by the supervisor. This one-off programme requires your permission because it uses company funds.',
          'Please approve or decline. Declining does not charge the business or immediately remove the employee, but the underlying retention risk remains.'
        ].join('\n');
        changed=emit(state,{from:'STAFF SUPERVISOR · '+supervisor.name,category:'staff',
          subject:'APPROVAL · '+employee.name+' welfare plan',
          preview:'Morale '+employee.morale+'/100 · '+money(plan.cost)+' proposed · your decision required.',
          body,linkPage:'staff',reference:'supervisor-morale:'+employee.id+':'+week})||changed;
      }else if(state.payrollArrears===0&&!supervisor){
        changed=emit(state,{from:'PEOPLE & PAYROLL',category:'staff',
          subject:'SUPERVISOR VACANCY · '+employee.name+' at risk',
          preview:'Morale '+employee.morale+'/100. Hire a supervisor to manage employee welfare.',
          body:'I wanted to flag a people issue that needs a manager assigned.\n\n'+
            employee.name+' currently has a morale score of '+employee.morale+
            '/100. There is no active staff supervisor to meet with them, review the rota or identify what is causing the concern.\n\n'+
            'My recommendation is to appoint a supervisor from the recruitment shortlist. Once they have started, they can handle the conversation and send you a costed proposal if further support requires company funds.\n\n'+
            'There is no charge to approve from this email. Please review the supervisor candidates when you can.',
          linkPage:'staff',reference:'supervisor-gap:'+employee.id+':'+week})||changed;
      }else if(state.payrollArrears>0){
        // Root cause must be resolved before recognition spending can help.
        // Payroll-arrears escalation above already informs the owner.
      }
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
      (filter==='unread'?!m.read:filter==='action'?needsAction(m,state):infer(m)===filter));
    return results.sort((a,b)=>
      Number(needsAction(b,state))-Number(needsAction(a,state))||b.day-a.day||b.id-a.id);
  }
  function counters(messages,state){
    return Object.fromEntries(categories.map(category=>
      [category,filtered(messages,state,category).length]));
  }
  // Saved emails from earlier releases can contain literal "\n" text.
  // Correct this at display time, keeping the original saved correspondence.
  function readableBody(source){
    return String(source??'').replace(/\\r\\n/g,'\n')
      .replace(/\\n/g,'\n').replace(/\\r/g,'\n')
      .replace(/\r\n?/g,'\n').trim();
  }
  function emailSender(message){
    const from=String(message.from||'Dealership Office');
    const supervisor=/^STAFF SUPERVISOR · (.+)$/.exec(from);
    if(supervisor)return {name:supervisor[1],team:'Staff Supervisor',initials:supervisor[1]
      .split(/\s+/).slice(0,2).map(w=>w[0]).join('').toUpperCase()};
    const text=from.toLowerCase().replace(/\b[a-z]/g,c=>c.toUpperCase());
    const initials=from==='PEOPLE & PAYROLL'?'HR':from==='ACCOUNTS OFFICE'?'AC':
      from==='SALES OFFICE'?'SO':from==='WORKSHOP SUPERVISOR'?'WS':'MT';
    return {name:text,team:infer(message)==='reports'?'Management Reporting':'Dealership Operations',initials};
  }
  function emailDate(day){
    const date=new Date(Date.UTC(2026,10,9)+(day-1)*86400000);
    return new Intl.DateTimeFormat('en-GB',{weekday:'short',day:'numeric',
      month:'short',year:'numeric',timeZone:'UTC'}).format(date);
  }
  function preparedBody(message){
    let text=readableBody(message.body);
    // Repair the original, saved supervisor-vacancy emails as well as newly
    // generated ones. Do not change morale figures or invent a staff decision.
    if((message.reference||'').startsWith('supervisor-gap:')){
      const person=String(message.subject).replace(/^SUPERVISOR VACANCY\s*·\s*/i,'')
        .replace(/\s+at risk$/i,'');
      const morale=/morale\s+(\d+)\/100/i.exec(text)?.[1]||
        /morale\s+(\d+)\/100/i.exec(message.preview||'')?.[1];
      return 'I wanted to bring a staffing concern to your attention. '+
        person+' currently has a morale score of '+(morale?morale+'/100':'below our expected level')+'.'+
        '\n\nWe do not have an active staff supervisor to speak with them, review the rota or follow up on the underlying issues.'+
        '\n\nI recommend appointing a supervisor from the available applicants. Once appointed and on duty, they can manage the matter directly and put a costed proposal to you if additional spending is justified.'+
        '\n\nNo payment or personnel action is being requested by this email. The recruitment decision is yours.';
    }
    return text;
  }
  function formatMail(message,state){
    const category=infer(message);
    const sender=emailSender(message);
    const decision=message.decision||'';
    const status=decision?decision.toUpperCase():
      needsAction(message,state)?'AWAITING YOUR APPROVAL':
      message.subject.startsWith('PAID COPY')?'PAID · FOR YOUR RECORDS':'FOR INFORMATION';
    const body=preparedBody(message);
    const blocks=body.split(/\n{2,}/).filter(x=>x.trim());
    const renderLine=line=>{
      const value=line.trim();
      if(!value)return '';
      if(/^[A-Z][A-Z 0-9/&£+·—-]{5,65}$/.test(value))
        return '<h3 class="mail-subject-heading">'+esc(value)+'</h3>';
      const match=/^([A-Z][A-Z 0-9/&-]{2,49}:)\s*(.*)$/.exec(value);
      if(match)
        return '<div class="mail-key-value"><span>'+esc(match[1].slice(0,-1))+
          '</span><strong>'+esc(match[2])+'</strong></div>';
      return '<p>'+esc(value)+'</p>';
    };
    const contents=blocks.map(part=>
      '<div class="mail-paragraph-group">'+part.split('\n').map(renderLine).join('')+
      '</div>').join('');
    const isGreeting=/^(?:hi|hello|dear|good morning|good afternoon)\b/i.test(body);
    const greeting=isGreeting?'':'<p class="mail-greeting">Hello,</p>';
    const isoDate=new Date(Date.UTC(2026,10,9)+(message.day-1)*86400000)
      .toISOString().slice(0,10);
    return '<article class="inbox-email" aria-label="Business email from '+esc(sender.name)+'">'+
      '<header class="inbox-email-header">'+
        '<div class="inbox-email-avatar" aria-hidden="true">'+esc(sender.initials)+'</div>'+
        '<div class="inbox-email-address"><strong>'+esc(sender.name)+'</strong>'+
          '<small>'+esc(sender.team)+'</small>'+
          '<span>To: Dealership Owner · '+esc(state.name)+'</span></div>'+
        '<time class="inbox-email-time" datetime="'+isoDate+'">'+
          esc(emailDate(message.day))+'</time>'+
      '</header>'+
      '<div class="inbox-email-status"><span>'+esc(status)+'</span>'+
        '<span>INTERNAL CORRESPONDENCE</span></div>'+
      '<div class="inbox-email-body">'+greeting+contents+
        '<div class="inbox-email-signature"><span>Kind regards,</span>'+
        '<strong>'+esc(sender.name)+'</strong>'+
        '<small>'+esc(sender.team)+'</small></div>'+
      '</div>'+
    '</article>';
  }
  function quoteControls(message,state,engine){
    const car=actionFor(message,state);
    const moraleEmployeeId=moraleId(message);
    if(moraleEmployeeId!==null){
      const employee=state.staff.find(e=>e.id===moraleEmployeeId);
      if(message.decision)return '<div class="inbox-resolved">SUPERVISOR PLAN '+
        esc(message.decision.toUpperCase())+'. This is a recorded decision; '+
        'no duplicate expense is possible. Check the current employee status in Staff & Recruitment.</div>';
      const plan=engine.people.moraleProposal(state,moraleEmployeeId);
      if(!plan)return '<div class="inbox-resolved">This staff welfare recommendation is no longer actionable. '+
        'Review the latest supervisor report, payroll situation and employee roster.</div>';
      return '<div class="inbox-approval inbox-staff-approval">'+
        '<div class="inbox-approval-intro"><strong>OWNER AUTHORISATION REQUIRED</strong>'+ 
        '<small>'+esc(plan.manager.name)+' proposes a '+money(plan.cost)+
        ' one-off rota-support and staff welfare intervention for '+esc(employee.name)+
        '. Morale '+employee.morale+'/100 → '+Math.min(100,employee.morale+plan.gain)+
        '/100. Routine check-ins remain delegated.</small></div>'+ 
        '<div class="inbox-approval-choices">'+
        '<button class="trade-button" data-action="decide-staff-welfare" data-decision="approve" data-id="'+
          message.id+'">APPROVE · '+money(plan.cost)+'</button>'+ 
        '<button class="trade-button trade-button-outline" data-action="decide-staff-welfare" data-decision="decline" data-id="'+
          message.id+'">DECLINE · £0</button></div></div>';
    }
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
    categories,labels,infer,quoteId,moraleId,actionFor,needsAction,sync,filtered,counters,
    quoteControls,formatMail,readableBody,emailDate,emit,esc
  });
})();
