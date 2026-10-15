import { test, expect } from '@playwright/test';
import { clickCareerContinue } from './helpers/current-ui.js';
import { startCareerThroughCurrentOnboarding } from './helpers/start-career.js';
import { reachHalfTime, finishSecondHalf } from './helpers/live-match.js';
import { openMatchPlan, makeLegalMatchSubstitution, closeMatchPlan } from './helpers/current-match-plan.js';

test.setTimeout(150000);

test.beforeEach(async ({ page }) => {
  await page.goto('/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

async function continueUntil(page, targetDate, maxSteps = 30) {
  for (let step = 0; step < maxSteps; step += 1) {
    const current = await page.evaluate(() => window.FLMManager.activeCareer?.currentDate || '');
    if (current >= targetDate) return;
    await clickCareerContinue(page);
    await page.waitForTimeout(80);
  }
  throw new Error(`Continue Game did not reach ${targetDate}`);
}

async function selectXI(page) {
  await page.getByRole('button', { name: 'Squad', exact: true }).click();
  await page.locator('[data-v044-auto-pick]').click();
  await expect(page.locator('[data-v044-lineup]:checked')).toHaveCount(11);
}

async function openFriendlyMatch(page) {
  await startCareerThroughCurrentOnboarding(page);
  await selectXI(page);
  await continueUntil(page, '2026-07-11');
  await expect(page.locator('[data-shell-continue-label]')).toHaveText('PLAY FRIENDLY');
  await page.locator('[data-shell-continue]').click();
  const live = page.locator('[data-live-match]');
  const shell = page.locator('.cm4-shell');
  await expect(live).toHaveAttribute('data-cm4', '1');
  return { live, shell };
}

test('Fold substitution manager always exposes and substitutes the striker', async ({ page }) => {
  const { shell } = await openFriendlyMatch(page);

  // Reproduce the historical failure geometry: player 11 (normally ST) was clipped
  // by the tablet/Fold list cap and could not be selected.
  await page.setViewportSize({ width: 720, height: 760 });
  const plan = await openMatchPlan(page, shell);
  await expect(plan.locator('[data-v049-out]')).toHaveCount(11);
  await expect(plan.locator('[data-v049-in]').first()).toBeVisible();

  // The striker must remain selectable in the Fold-sized match-management sheet,
  // and replacing him must change the authoritative on-pitch XI.
  const strikerId = await page.evaluate(async () => {
    const db = await window.FLMManager.loadDatabase();
    const ids = [...document.querySelectorAll('.flm-match-dialog [data-v049-out]')].map(node => node.dataset.v049Out);
    const striker = db.players.find(p => ids.includes(p.id) && /^(ST|SC|FC|CF)$/.test(p.primaryPosition || ''));
    return striker?.id || null;
  });
  expect(strikerId).toBeTruthy();
  await expect(plan.locator(`[data-v049-out="${strikerId}"]`)).toBeVisible();
  await makeLegalMatchSubstitution(page, plan, { striker: true });
  await closeMatchPlan(plan);

});

test('V4.4 latches match states and keeps Fold matchday playable', async ({ page }) => {
  await startCareerThroughCurrentOnboarding(page);
  await selectXI(page);
  await continueUntil(page, '2026-07-11');

  // V4.6 deliberately removes the duplicate central PLAY FRIENDLY CTA.
  await expect(page.locator('[data-shell-continue-label]')).toHaveText('PLAY FRIENDLY');
  await page.locator('[data-shell-continue]').click();

  const live=page.locator('[data-live-match]');
  const shell=page.locator('.cm4-shell');
  await expect(live).toHaveAttribute('data-cm4','1');
  await expect(shell).toHaveAttribute('data-cm44','1');
  await expect(shell.locator('[data-cm4-comp]')).toHaveText('Pre-Season Friendly');

  // Metadata should look like a real match rather than placeholders.
  await expect(shell.locator('[data-cm4-referee]')).not.toHaveText('Referee — Match Official');
  await expect(shell.locator('[data-cm4-weather]')).not.toHaveText('Weather —');

  // Fold substitutions: full XI visible, normalised positions and coherent V4 skin.
  await page.setViewportSize({ width:720, height:900 });
  const plan = await openMatchPlan(page, shell);
  await expect(plan.locator('[data-v049-out]')).toHaveCount(11);
  await expect(plan.locator('[data-v049-in]').first()).toBeVisible();
  const geometry = await plan.evaluate(node => {
    const rect=node.getBoundingClientRect();
    return { width:rect.width, viewport:innerWidth, maxHeight:getComputedStyle(node).maxHeight };
  });
  expect(geometry.width).toBeLessThanOrEqual(geometry.viewport + 2);
  await closeMatchPlan(plan);

  // Live commentary should expose football actions, not tactical/database jargon.
  await shell.locator('[data-cm4-speed="4"]').click();
  await expect.poll(async()=>page.locator('[data-commentary-feed] .flm-commentary-line').count(),{timeout:15000}).toBeGreaterThanOrEqual(5);
  await expect(live).toHaveAttribute('data-authoritative-attack-commentary','2.0.0');
  const authoritative=page.locator('[data-commentary-feed] .flm-commentary-line[data-fl-authoritative-attack="2.0.0"]');
  await expect.poll(async()=>authoritative.count(),{timeout:30000}).toBeGreaterThanOrEqual(4);
  const authoritativeText=(await authoritative.allTextContents()).join(' ');
  expect(authoritativeText).not.toMatch(/gets the shot away|sees the opening and lets fly|takes aim from here/i);
  const phases=new Set(await authoritative.evaluateAll(rows=>rows.map(row=>row.getAttribute('data-fl-attack-phase'))));
  expect(phases.has('buildup')).toBeTruthy();
  expect(phases.has('attempt')).toBeTruthy();
  expect(phases.has('outcome')).toBeTruthy();

  await expect.poll(async()=>((await shell.locator('[data-cm4-event-text]').getAttribute('data-cm44-text'))||'').length,{timeout:10000}).toBeGreaterThan(5);
  const displayed=(await shell.locator('[data-cm4-event-text]').getAttribute('data-cm44-text'))||'';
  expect(displayed).not.toMatch(/\b(?:LCB|RCB|LCM|RCM|DMC|AMC|AML|AMR|Central Defender|Inside Forward|Poacher|tactical plan|attacking instruction)\b/i);

  // Half time is authoritative until the user resumes. The wider CI budget still fails a real 43/44 freeze.
  await reachHalfTime(page, live, shell, 100000);
  await expect(live).toHaveAttribute('data-cm44-state','halftime');
  await expect(shell.locator('[data-cm4-phase]')).toHaveText('Half Time');
  await expect(shell.locator('[data-cm4-pause]')).toHaveText('Resume 2nd Half');
  await expect(shell.locator('[data-cm4-event-text]')).toHaveAttribute('data-cm44-text',/^HALF TIME · /);

  await shell.locator('[data-cm4-pause]').click();
  await expect.poll(async()=>Number(((await shell.locator('[data-cm4-clock]').textContent())||'0').split(':')[0]),{timeout:8000}).toBeGreaterThan(45);

  // Full time remains a strict functional requirement; the timeout only accommodates hosted-runner throughput.
  await finishSecondHalf(page, live, shell, 110000);
  await expect(live).toHaveAttribute('data-cm44-state','fulltime');
  await expect(shell.locator('[data-cm4-phase]')).toHaveText('Full Time');
  const finalText=await shell.locator('[data-cm4-event-text]').getAttribute('data-cm44-text');
  expect(finalText).toMatch(/^FULL TIME · /);
  await page.waitForTimeout(700);
  await expect(shell.locator('[data-cm4-event-text]')).toHaveAttribute('data-cm44-text',finalText);
  await expect(shell.locator('[data-cm4-tactics]')).toBeHidden();
  await expect(shell.locator('[data-cm4-subs]')).toBeHidden();
  await expect(shell.locator('[data-cm44-continue]')).toBeVisible();

  await shell.locator('[data-cm44-continue]').click();
  await expect(live).toHaveCount(0,{timeout:10000});
  await expect(page.locator('.v047-head h2')).toHaveText('Pre-Season');
  await expect(page.locator('.v047-fixture.is-played')).toHaveCount(1);
});
