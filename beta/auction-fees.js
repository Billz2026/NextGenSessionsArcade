'use strict';
/*
 * 2026 auction buyer-fee benchmark — BCA Blue Standard rate card, VAT-inclusive.
 * Effective 30 March 2026. This is ONE published account tariff, not a fee
 * quotation for every auction, account, service, transport or future year.
 *
 * https://www.bca.co.uk/dam/UK/Buying/payment/BCA_Blue_Standard_Rate_Buyers_Fees_April_2026.pdf
 *
 * Published charges end at £24,999; BCA directs buyers above this threshold
 * to Customer Services. Never silently extrapolate an invoice above £24,999.
 */
(() => {
  const EFFECTIVE_FROM='2026-03-30';
  const SOURCE_URL='https://www.bca.co.uk/dam/UK/Buying/payment/BCA_Blue_Standard_Rate_Buyers_Fees_April_2026.pdf';
  const BAND_START_FEE=Object.freeze([[11,57],[50,93],[100,135],[150,192],[200,202],[250,212],[300,268],[350,281],[400,306],[450,317],[500,421],[750,506],[1000,536],[1250,554],[1500,576],[1750,596],[2000,614],[2250,636],[2500,653],[2750,662],[3000,753],[3250,763],[3500,778],[3750,790],[4000,796],[4250,805],[4500,815],[4750,823],[5000,828],[5250,841],[5500,847],[5750,859],[6000,872],[6250,881],[6500,894],[6750,903],[7000,912],[7250,926],[7500,935],[7750,945],[8000,967],[8250,979],[8500,988],[8750,996],[9000,1008],[9250,1021],[9500,1030],[9750,1043],[10000,1043],[10250,1044],[10500,1044],[10750,1054],[11000,1066],[11250,1076],[11500,1087],[11750,1094],[12000,1126],[12250,1141],[12500,1149],[12750,1162],[13000,1162],[13250,1162],[13500,1172],[13750,1185],[14000,1205],[14250,1217],[14500,1227],[14750,1236],[15000,1259],[15250,1268],[15500,1281],[15750,1288],[16000,1319],[16250,1328],[16500,1341],[16750,1349],[17000,1349],[17250,1349],[17500,1349],[17750,1349],[18000,1349],[18250,1353],[18500,1365],[18750,1374],[19000,1384],[19250,1389],[19500,1392],[19750,1405],[20000,1476],[20250,1486],[20500,1497],[20750,1505],[21000,1517],[21250,1529],[21500,1538],[21750,1547],[22000,1561],[22250,1570],[22500,1581],[22750,1592],[23000,1605],[23250,1613],[23500,1622],[23750,1633],[24000,1645],[24250,1654],[24500,1667],[24750,1677]]);
  const MAX_PUBLISHED_HAMMER=24999;
  function feeAtHammer(hammer) {
    if(!Number.isSafeInteger(hammer)||hammer<11||hammer>MAX_PUBLISHED_HAMMER)return null;
    let left=0,right=BAND_START_FEE.length-1;
    while(left<right){
      const mid=Math.ceil((left+right)/2);
      if(BAND_START_FEE[mid][0]<=hammer)left=mid;
      else right=mid-1;
    }
    return BAND_START_FEE[left][1];
  }
  function invoice(hammer) {
    const fee=feeAtHammer(hammer);
    if(fee===null)return null;
    // Record the gross cash invoice. Input VAT deductibility is a separate
    // accounting decision and never assumed automatically for the player.
    const feeVat=Math.round(fee/6*100)/100;
    return {hammer,buyerFee:fee,totalDue:hammer+fee,
      feeVat,feeNet:Math.round((fee-feeVat)*100)/100,
      tariff:'BCA_BLUE_STANDARD_2026',effectiveFrom:EFFECTIVE_FROM,
      sourceUrl:SOURCE_URL,excludes:['transport','storage','optional inspection']};
  }
  window.MotorTradeAuctionFees=Object.freeze({
    EFFECTIVE_FROM,SOURCE_URL,MAX_PUBLISHED_HAMMER,BAND_START_FEE,
    feeAtHammer,invoice
  });
})();
