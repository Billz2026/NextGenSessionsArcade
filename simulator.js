'use strict';
// Financial exercise only — no stock purchased, no bids placed, no customer generated.
// No data is persisted; the calculator does not claim to model UK VAT margin scheme.
const defaults=Object.freeze({hammer:4800,fee:350,transport:140,prep:460,asking:7250,offer:6750});
const capital=12500;
const money=new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP',minimumFractionDigits:0,maximumFractionDigits:2});
const byId=id=>document.getElementById(id);
const form=byId('deal-form');
const inputs=Object.keys(defaults).map(byId);
const safeAmount=input=>{
  const raw=input.value.trim();
  const value=Number(raw);
  const valid=raw!=='' && Number.isFinite(value) && value>=0 && value<=10000000;
  input.setAttribute('aria-invalid',String(!valid));
  return valid?value:null;
};
function render(){
  const values={};
  for(const input of inputs)values[input.id]=safeAmount(input);
  const status=byId('deal-status');
  const set=(id,value)=>byId(id).textContent=value;
  if(Object.values(values).some(value=>value===null)){
    for(const id of ['landed','fee-vat','profit-asking','profit-offer','cash-left'])set(id,'—');
    set('deal-message','Enter valid non-negative amounts in every field.');
    status.dataset.kind='invalid';
    byId('cost-fill').style.width='0%';
    byId('spread-fill').style.width='0%';
    return;
  }
  const feeVat=Math.round(values.fee*20)/100; // 20% VAT on *buyer's fee* only
  const landed=values.hammer+values.fee+feeVat+values.transport+values.prep;
  const marginAtAsk=values.asking-landed;
  const marginAtOffer=values.offer-landed;
  const cashRemaining=capital-(values.hammer+values.fee+feeVat+values.transport+values.prep);
  set('fee-vat',money.format(feeVat));
  set('landed',money.format(landed));
  set('profit-asking',money.format(marginAtAsk));
  set('profit-offer',money.format(marginAtOffer));
  set('cash-left',money.format(cashRemaining));
  for(const [id,value] of [['profit-asking',marginAtAsk],['profit-offer',marginAtOffer]]){
    byId(id).classList.toggle('positive',value>=0);
    byId(id).classList.toggle('negative',value<0);
  }
  const percentage=values.offer>0?Math.max(0,Math.min(100,(landed/values.offer)*100)):100;
  byId('cost-fill').style.width=percentage+'%';
  byId('spread-fill').style.width=(marginAtOffer>0?100-percentage:0)+'%';
  status.dataset.kind=marginAtOffer<0||cashRemaining<0?'negative':'positive';
  let message='';
  if(cashRemaining<0)message='This purchase exceeds the illustrative £12,500 starting cash before any sale.';
  else if(marginAtOffer<0)message='The customer offer would not cover modelled purchase and preparation costs.';
  else if(marginAtOffer===0)message='Break-even on the modelled costs. No allowance remains for overhead or risk.';
  else message='Positive illustrative gross spread at the offered price — before tax, overhead and further costs.';
  set('deal-message',message);
}
form.addEventListener('submit',event=>event.preventDefault());
for(const input of inputs)input.addEventListener('input',render);
byId('reset-calc').addEventListener('click',()=>{
  for(const input of inputs)input.value=defaults[input.id];
  render();
});
render();
