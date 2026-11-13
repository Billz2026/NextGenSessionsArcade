import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const base=process.env.SITE_ORIGIN || 'http://127.0.0.1:4173';
const KEY='the-motor-trade-career-v1';
const BACKUP='the-motor-trade-career-backup-v1';
const browser=await chromium.launch({headless:true});
const ctx=await browser.newContext({viewport:{width:1440,height:900},acceptDownloads:true});
const page=await ctx.newPage();
const errors=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('dialog',dialog=>dialog.accept());
let checks=0;
function equal(actual,expected,message){assert.equal(actual,expected,message);checks++;}
function ok(value,message){assert.ok(value,message);checks++;}

try {
  await page.goto(base+'/',{waitUntil:'domcontentloaded'});
  await page.locator('#menu-new-career').click();
  await page.locator('#dealership-name').fill('Backup Test Motors');
  await page.locator('.setup-submit').click();
  await page.locator('#screen-career').waitFor({state:'visible'});
  equal(await page.evaluate(k=>JSON.parse(localStorage.getItem(k))?.day,KEY),1,'New career is persisted on day 1');
  await page.locator('#continue-day').click();
  equal(await page.evaluate(k=>JSON.parse(localStorage.getItem(k))?.day,KEY),2,'Day 2 auto-saved');
  equal(await page.evaluate(k=>JSON.parse(localStorage.getItem(k))?.day,BACKUP),1,'Automatic fallback retains day 1');

  await page.locator('[data-action="open-career-tools"]').click();
  await page.locator('#career-tools').waitFor({state:'visible'});
  const downloadPromise=page.waitForEvent('download');
  await page.locator('#career-export').click();
  const download=await downloadPromise;
  ok(download.suggestedFilename().endsWith('.json'),'Backup downloaded as JSON');
  const file=await download.createReadStream();
  const chunks=[];
  for await(const chunk of file)chunks.push(chunk);
  const backupJson=JSON.parse(Buffer.concat(chunks).toString('utf8'));
  equal(backupJson.type,'the-motor-trade-career-export','Downloaded file has product marker');
  equal(backupJson.career.day,2,'Downloaded file has full current career');

  await page.locator('#career-restore').click();
  await page.locator('#screen-career').waitFor({state:'visible'});
  equal(await page.evaluate(k=>JSON.parse(localStorage.getItem(k))?.day,KEY),1,'Restore previous state works');

  // Invalid imports cannot change stored cash, cars, or trading day.
  await page.locator('[data-action="open-career-tools"]').click();
  const before=await page.evaluate(k=>localStorage.getItem(k),KEY);
  await page.locator('#career-import-file').setInputFiles({
    name:'broken.json',mimeType:'application/json',buffer:Buffer.from('{bad-json')
  });
  await page.waitForTimeout(100);
  equal(await page.evaluate(k=>localStorage.getItem(k),KEY),before,'Rejected import does not overwrite career');

  // Import from exported file, not just its original localStorage snapshot.
  await page.locator('#career-import-file').setInputFiles({
    name:'real-backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backupJson))
  });
  await page.locator('#screen-career').waitFor({state:'visible'});
  equal(await page.evaluate(k=>JSON.parse(localStorage.getItem(k))?.day,KEY),2,'Imported complete career from JSON');

  // Corruption cannot silently replace the main save. Recovery remains explicit.
  await page.evaluate(k=>localStorage.setItem(k,'{damaged'),KEY);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.locator('#menu-save-warning').waitFor({state:'visible'});
  equal(await page.locator('#menu-continue').isVisible(),false,'Damaged career does not appear resumable');
  equal(await page.evaluate(k=>localStorage.getItem(k),KEY),'{damaged','Corrupt bytes remain unchanged until recovery');
  await page.locator('[data-action="toggle-career-tools"]').click();
  await page.locator('#career-restore').click();
  await page.locator('#screen-career').waitFor({state:'visible'});
  ok((await page.evaluate(k=>JSON.parse(localStorage.getItem(k))?.day,KEY))>=1,'Valid backup restores a career');
  equal(errors.length,0,'No uncaught browser JavaScript errors');
  console.log('CAREER_BACKUP_BROWSER_PASS '+checks+' checks');
} finally {
  await ctx.close();
  await browser.close();
}
