import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {BOARD,LANES,BUMPERS,SLINGS,SHOTS,PinballEngine} from '../games/pinball/engine.mjs';
import {UPPER_ROLLOVERS,UPPER_ROUTES,VISIBLE_CHANNELS,guideEdges} from '../games/pinball/upper-hardware.mjs';
import {MID_BUMPERS,MID_TARGETS} from '../games/pinball/mid-hardware.mjs';
import {LOWER_SLINGS,LOWER_GUIDES} from '../games/pinball/lower-hardware.mjs';
import {NEON_FINISH} from '../games/pinball/classic-finish.mjs';

const three=readFileSync(new URL('../games/pinball/render3d.mjs',import.meta.url),'utf8');
const canvas=readFileSync(new URL('../games/pinball/visuals.mjs',import.meta.url),'utf8');
const controller=readFileSync(new URL('../games/pinball/game.mjs',import.meta.url),'utf8');
const page=readFileSync(new URL('../games/pinball/index.html',import.meta.url),'utf8');

test('more defined dark enamel preserves contrast around working pinball inserts',()=>{
 const rgb=NEON_FINISH.upper.match(/[0-9a-f]{2}/gi).map(x=>parseInt(x,16));
 assert.ok(rgb.reduce((a,b)=>a+b,0)/3<65,'upper playfield is too bright for illuminated hardware');
 assert.ok(['upper','mid','lower'].every(p=>/^#[0-9a-f]{6}$/i.test(NEON_FINISH[p])));
 assert.match(three,/bg\.addColorStop\(0,NEON_FINISH\.upper\)/);
 assert.match(canvas,/\[0,NEON_FINISH\.upper\]/);
});

test('three upper scoring bays have real mechanical framing in both renderers',()=>{
 assert.equal(UPPER_ROLLOVERS.length,3);
 assert.deepEqual(UPPER_ROLLOVERS.map(({x,y})=>[x,y]),LANES.map(({x,y})=>[x,y]));
 assert.match(three,/const bayEnamel=new T\.MeshPhysicalMaterial/);
 assert.match(three,/for\(const l of UPPER_ROLLOVERS\)/);
 assert.match(three,/plane\(px,py,\.191,1\.10,1\.38,bayEnamel\)/);
 assert.match(canvas,/for\(const lane of UPPER_ROLLOVERS\)/);
 assert.match(canvas,/rect\(c,lane\.x-28,lane\.y-35,56,70,7/);
});

test('bumper cluster underlays are decorative and aligned to all three existing impact switches',()=>{
 assert.equal(MID_BUMPERS.length,3);
 assert.deepEqual(MID_BUMPERS.map(({x,y,r})=>[x,y,r]),BUMPERS.map(({x,y,r})=>[x,y,r]));
 assert.match(three,/const deckOutline=\[\[111,201\]/);
 assert.match(three,/new T\.ShapeGeometry\(deckShape\)/);
 assert.match(canvas,/for\(let i=0;i<MID_BUMPERS\.length;i\+\+\)/);
 assert.match(three,/for\(const b of MID_BUMPERS\)/);
 assert.equal(MID_TARGETS.length,4);
 assert.match(three,/label\('TARGET BANK'/);
});

test('lower sling housings and guides remain tied to actual contact geometry',()=>{
 assert.equal(LOWER_SLINGS.length,2);
 for(const s of LOWER_SLINGS)
  assert.ok(SLINGS.some(q=>s.x1===q.x1&&s.y1===q.y1&&s.x2===q.x2&&s.y2===q.y2));
 assert.equal(LOWER_GUIDES.length,4);
 assert.match(three,/const coverMaterial=new T\.MeshPhysicalMaterial/);
 assert.match(canvas,/for\(let i=0;i<LOWER_SLINGS\.length;i\+\+\)/);
 assert.match(three,/for\(const channel of LOWER_CHANNELS\)/);
 assert.match(canvas,/for\(const channel of LOWER_CHANNELS\)/);
});

test('all four original shots and fixed-step game physics remain playable',()=>{
 const game=new PinballEngine();
 game.start();assert.equal(game.state,'playing');
 assert.equal(game.ball.mode,'shooter');
 assert.deepEqual(Object.keys(SHOTS).sort(),['center','orbit','ramp','skyline']);
 assert.equal(BOARD.width,420);
 assert.equal(BOARD.height,700);
 assert.equal(BOARD.step,1/240);
 assert.match(three,/const edges=guideEdges\(channel\)/);
 assert.equal(VISIBLE_CHANNELS.length,2);
 assert.ok(VISIBLE_CHANNELS.every(c=>SHOTS[c.kind]));
 for(const r of UPPER_ROUTES)
  assert.equal(guideEdges(r).length,r.points.length);
 assert.ok(!three.includes('new PinballEngine('));
 assert.ok(!canvas.includes('engine.score+='));
});

test('2D and 3D visual revisions use cache-versioned imports and fallback support',()=>{
 assert.match(controller,/visuals\.mjs\?v=\d+/);
 assert.match(controller,/render3d\.mjs\?v=\d+/);
 assert.match(three,/classic-finish\.mjs\?v=\d+/);
 assert.match(canvas,/classic-finish\.mjs\?v=\d+/);
 assert.match(page,/src="\.\/game\.mjs\?v=\d+"/);
 assert.match(controller,/console\.warn\('Neon Tilt 3D unavailable/);
});
