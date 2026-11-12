'use strict';
/* 2026 UK regional-auction vehicle delivery scenario.
 * The Motor Trade has no actual geo-located auction address or dealer site.
 * Every distance below is GENERATED and clearly labelled SIMULATED; it is not
 * an actual route, live quotation or fee belonging to BCA/Manheim.
 *
 * Provider benchmark: OPT Transport publishes £1.70 per one-way mile for
 * open transport, minimum £75, explicitly VAT-inclusive.
 * https://opttransport.co.uk/transport-cost (reviewed 12 Nov 2026)
 *
 * Other UK quote data are often higher and depend on location, condition,
 * date and backhaul. We use this one named public example transparently.
 */
(() => {
  const SOURCE='https://opttransport.co.uk/transport-cost';
  const RATE_PENCE_PER_MILE=170;
  const MINIMUM_PENCE=7500;
  const MIN_MILES=45,MAX_MILES=155;
  function routeMiles(lotOrId){
    const id=typeof lotOrId==='string'?lotOrId:lotOrId?.id;
    if(typeof id!=='string'||!/^A-\d+-\d+$/.test(id))return null;
    const [,day,index]=/^A-(\d+)-(\d+)$/.exec(id).slice(1).map(Number);
    if(!Number.isSafeInteger(day)||!Number.isSafeInteger(index))return null;
    const buckets=[45,65,85,105,125,155];
    return buckets[(day*7+index*3)%buckets.length];
  }
  function quote(lotOrId){
    const miles=routeMiles(lotOrId);
    if(miles===null)return null;
    const gross=Math.max(MINIMUM_PENCE,miles*RATE_PENCE_PER_MILE)/100;
    const vat=Math.round(gross/6*100)/100;
    return {routeMiles:miles,gross,vat,net:Math.round((gross-vat)*100)/100,
      scenario:'simulated-roadworthy-open-transporter',
      source:SOURCE,rateIncVat:1.70,routeReal:false};
  }
  window.MotorTradeTransport=Object.freeze({
    SOURCE,RATE_PENCE_PER_MILE,MINIMUM_PENCE,MIN_MILES,MAX_MILES,
    routeMiles,quote
  });
})();
