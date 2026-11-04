import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {BOARD,WALLS,PinballEngine} from '../games/pinball/engine.mjs';

const render=readFileSync(new URL('../games/pinball/render3d.mjs',import.meta.url),'utf8');
const css=readFileSync(new URL('../games/pinball/game.css',import.meta.url),'utf8');
const html=readFileSync(new URL('../games/pinball/index.html',import.meta.url),'utf8');
const game=readFileSync(new URL('../games/pinball/game.mjs',import.meta.url),'utf8');

test('desktop 3D view makes the table substantially larger, retaining mobile camera framing',()=>{
 assert.match(render,/new T\.PerspectiveCamera\(compact\?33:29\.2,0\.6,\.1,120\)/);
 assert.match(render,/const compact=window\.matchMedia\?\.\('\(max-width: 1120px\)'\)/);
 const magnification=Math.tan(33*Math.PI/360)/Math.tan(29.2*Math.PI/360);
 assert.ok(magnification>=1.13&&magnification<1.16,
  'desktop scene scale should increase without excessive cropping');
});

test('all real wall endpoints remain fully inside the larger desktop 3D framing',()=>{
 // Match the live Three.js camera (same lookAt and 3:5 aspect ratio).
 const position=[1.05,-2,26.25],target=[0,0,.22];
 const normalise=a=>{const d=Math.hypot(...a);return a.map(x=>x/d)};
 const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
 const dot=(a,b)=>a.reduce((sum,x,i)=>sum+x*b[i],0);
 const forward=normalise(target.map((x,i)=>x-position[i]));
 const right=normalise(cross(forward,[0,1,0]));
 const up=cross(right,forward);
 const halfFov=Math.tan(29.2*Math.PI/360);
 for(const [ax,ay,bx,by] of WALLS){
  for(const [x,y] of [[ax,ay],[bx,by]]){
   const point=[(x-BOARD.width/2)*.020,(BOARD.height/2-y)*.020,.25];
   const relative=point.map((v,i)=>v-position[i]);
   const depth=dot(relative,forward);
   const ndcX=dot(relative,right)/(depth*halfFov*.6);
   const ndcY=dot(relative,up)/(depth*halfFov);
   assert.ok(Math.abs(ndcX)<.985&&Math.abs(ndcY)<.985,
    'a playable wall endpoint was cropped at '+x+','+y);
  }
 }
});

test('one-screen desktop CSS increases real stage size, not a distorting transform',()=>{
 assert.match(css,/Phase 4M — larger playable table/);
 assert.match(css,/\(min-width:1121px\) and \(min-height:721px\)/);
 assert.match(css,/--table-height:clamp\(220px,calc\(100dvh - 101px\),1000px\)/);
 assert.match(css,/html:not\(:fullscreen\):not\(\.pinball-focus\) \.flipper-controls/);
 assert.ok(!css.slice(css.lastIndexOf('Phase 4M')).includes('transform:scale('));
 const viewportHeight=755;
 const oldHeight=viewportHeight-108,newHeight=viewportHeight-101;
 const oldButtons=36,newButtons=33;
 assert.ok(newHeight>oldHeight);
 assert.ok(newHeight+newButtons<=oldHeight+oldButtons+4,
  'new stage plus flipper controls must not add more than 4px of vertical usage');
 assert.match(css,/aspect-ratio:3\/5/);
});

test('physics, UI controls and cache-versioned 3D entrypoints remain consistent',()=>{
 const engine=new PinballEngine();engine.start();
 assert.equal(engine.state,'playing');
 assert.equal(BOARD.width,420);assert.equal(BOARD.height,700);
 assert.equal(BOARD.step,1/240);
 assert.match(game,/render3d\.mjs\?v=\d+/);
 assert.match(html,/game\.css\?v=18/);
 assert.match(html,/game\.mjs\?v=\d+/);
 assert.match(html,/id="flipper-left"/);assert.match(html,/id="flipper-right"/);
});
