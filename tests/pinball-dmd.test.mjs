import test from 'node:test';
import assert from 'node:assert/strict';
import {createDotMatrix,DMD_COLS,DMD_ROWS} from '../games/pinball/dmd.mjs';
function mockScreen(){
 const calls={dots:0,frames:0,labels:0,text:[],fonts:[]};
 const pixels=new Uint8ClampedArray(DMD_COLS*DMD_ROWS*4);
 for(let i=0;i<DMD_COLS*DMD_ROWS;i+=9)pixels[i*4]=255;
 const paper={fillRect(){},fillText(txt){calls.labels++;calls.text.push(txt);calls.fonts.push(this.font)},getImageData(){return{data:pixels}}};
 const screen={fillRect(){calls.frames++},beginPath(){calls.dots++},arc(){},fill(){},strokeRect(){}};
 const old=globalThis.document;
 globalThis.document={createElement(){return{width:0,height:0,getContext(){return paper}}}};
 return {calls,canvas:{getContext(){return screen}},restore(){globalThis.document=old}};
}
test('dot-matrix display fits all 80 × 22 LED cells in 560 × 162 pixels',()=>{
 const m=mockScreen();
 try{
  const dmd=createDotMatrix(m.canvas,{reducedMotion:true});
  const game={state:'ready',score:0};
  dmd.update(game,1000);
  assert.equal(m.canvas.width,560);assert.equal(m.canvas.height,162);
  assert.equal(m.calls.dots,DMD_COLS*DMD_ROWS);
  assert.equal(m.calls.labels,2);
  dmd.dispose();
 }finally{m.restore()}
});
test('display throttles frames but redraws for important scoring announcements',()=>{
 const m=mockScreen();
 try{
  const dmd=createDotMatrix(m.canvas,{reducedMotion:true});
  const game={state:'playing',ball:{mode:'live'},ballNumber:1,score:3250,time:2,frenzyUntil:0,multiplierUntil:0};
  dmd.update(game,1000);
  const count=m.calls.dots;
  dmd.update(game,1030);assert.equal(m.calls.dots,count);
  dmd.notify({type:'mission',headline:'TARGET BANK'},1040);
  dmd.update(game,1050);assert.equal(m.calls.dots,count*2);
  dmd.dispose();dmd.update(game,2000);
  assert.equal(m.calls.dots,count*2);
 }finally{m.restore()}
});
test('high priority celebration cannot be displaced by low priority spinner',()=>{
 const m=mockScreen();
 try{
  const dmd=createDotMatrix(m.canvas,{reducedMotion:true});
  const g={state:'playing',ball:{mode:'live'},ballNumber:1,score:100,time:3,frenzyUntil:0,multiplierUntil:0};
  dmd.notify({type:'extra'},1000);
  dmd.update(g,1001);
  const firstHeadline=m.calls.text.at(-2);
  dmd.notify({type:'spinner',turns:4},1020);
  dmd.update(g,1100);
  assert.equal(m.calls.text.at(-2),firstHeadline,'lower priority event replaced EXTRA BALL');
  assert.equal(firstHeadline,'EXTRA BALL');
  dmd.dispose();
 }finally{m.restore()}
});

test('mission announcements remain readable with prominent 11px/9px dot-matrix type',()=>{
 const m=mockScreen();
 try{
  const dmd=createDotMatrix(m.canvas,{reducedMotion:true});
  const game={state:'playing',ball:{mode:'live'},ballNumber:1,score:0,time:2,frenzyUntil:0,multiplierUntil:0};
  dmd.notify({type:'mission',headline:'TARGET BANK COMPLETE'},1000);
  dmd.update(game,1010);
  assert.equal(m.calls.text.at(-2),'TARGET BANK');
  assert.equal(m.calls.text.at(-1),'COMPLETE!');
  assert.match(m.calls.fonts.at(-2),/11px/);
  assert.match(m.calls.fonts.at(-1),/9px/);
  dmd.dispose();
 }finally{m.restore()}
});
