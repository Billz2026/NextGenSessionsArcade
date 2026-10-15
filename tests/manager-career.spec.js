import { test, expect } from '@playwright/test';
import { clickCareerContinue } from './helpers/current-ui.js';
import { finishSecondHalf, reachHalfTime } from './helpers/live-match.js';

test.setTimeout(240000);

test.beforeEach(async ({ page }) => {
  await page.goto('/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

async function continueUntil(page, targetDate, maxSteps = 30) {
  for (let step = 0; step < maxSteps; step += 1) {
    const current = await page.evaluate(() => window.FLMManager.activeCareer?.currentDate || '');
    if (current >= targetDate) return current;
    await clickCareerContinue(page);
    await page.waitForTimeout(80);
  }
  throw new Error(`Continue Game did not reach ${targetDate}`);
}

async function autoPickOptionalXI(page) {
  await page.getByRole('button', { name: 'Squad', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Squad' })).toBeVisible();
  await page.locator('[data-v044-auto-pick]').click();
  await expect(page.locator('[data-v044-lineup]:checked')).toHaveCount(11);
}

async function completePreseason(page) {
  const dates = ['2026-07-11','2026-07-18','2026-07-25','2026-08-01','2026-08-08'];
  const tab = page.locator('[data-v047-preseason-tab]');
  await expect(tab).toBeVisible();
  for (let count = 1; count <= 5; count += 1) {
    await continueUntil(page, dates[count - 1]);
    await tab.click();
    await expect(page.getByRole('heading', { name: 'Pre-Season' })).toBeVisible();
    await page.locator('[data-v047-sim]').click();
    await expect(page.locator('.v047-fixture.is-played')).toHaveCount(count, { timeout: 30000 });
  }
  await page.locator('[data-v047-start]').click();
  await expect(page.getByRole('button', { name: 'Matchday', exact: true })).toBeEnabled();
  await continueUntil(page, '2026-08-21');
}

test('squad and tactics remain manager-controlled and position-aware', async ({ page }) => {
  await page.getByRole('button', { name: /QUICK START/ }).click();
  await expect(page.locator('.career-app')).toHaveClass(/is-open/);

  await page.getByRole('button', { name: 'Squad', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Squad' })).toBeVisible();
  await expect(page.locator('[data-v044-lineup]:checked')).toHaveCount(0);
  await expect(page.locator('[data-lineup-counter]').filter({ hasText: 'SELECTED' })).toContainText('0 / 11');
  await expect(page.locator('[data-v044-auto-pick]')).toHaveText(/AUTOPICK XI|AUTO PICK XI/i);
  await page.locator('[data-v044-auto-pick]').click();
  await expect(page.locator('[data-v044-lineup]:checked')).toHaveCount(11);

  await page.getByRole('button', { name: 'Tactics', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Tactics', exact: true })).toBeVisible();
  await expect(page.locator('.v048-player')).toHaveCount(11);
  await expect(page.locator('[data-v048-formation] option')).toHaveCount(8);
  const fitted = await page.locator('.v048-player.fit-preferred,.v048-player.fit-secondary,.v048-player.fit-unfamiliar').count();
  expect(fitted).toBe(11);

  await page.locator('[data-v048-formation]').selectOption('5-3-2');
  await expect(page.locator('[data-v048-slot="RWB"]')).toHaveCount(1);
  // The current one-screen tactics editor uses an always-visible mentality
  // segment; the older "with-ball"/tempo tabs have been retired.
  await page.locator('[data-v048-option="mentality"][data-value="Attacking"]').click();
  await page.locator('[data-v048-save]').click();

  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('flm-career-save')));
  expect(saved.tactics.formation).toBe('5-3-2');
  expect(saved.tactics.mentality).toBe('Attacking');
  expect(saved.tacticalSetup.assignments).toHaveLength(11);
});

test('Matchday V2 is CM-clear, team-coloured and makes legal substitutions obvious', async ({ page }) => {
  await page.getByRole('button', { name: /QUICK START/ }).click();
  await expect(page.locator('.career-app')).toHaveClass(/is-open/);
  await autoPickOptionalXI(page);
  await completePreseason(page);

  await page.getByRole('button', { name: 'Matchday', exact: true }).click();
  await page.getByRole('button', { name: 'PLAY MATCH', exact: true }).click();

  const live = page.locator('[data-live-match]');
  const shell = live.locator('.cm4-shell');
  await expect(live).toHaveAttribute('data-cm-match-v2', '1');
  await expect(live).toHaveAttribute('data-cm4', '1');
  await expect(page.locator('.flm-cm-v2-tabs [data-cm-v2-view]')).toHaveCount(4);
  await expect(page.locator('.flm-cm-v2-focus')).toBeVisible();
  await expect(shell.locator('[data-cm4-pause]')).toBeVisible();
  await expect(shell.locator('[data-cm4-subs]')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Tactics', exact: true }).last()).toBeVisible();

  const typography = await page.locator('.flm-cm-v2-focus').evaluate(node => {
    const text = node.querySelector('.flm-cm-v2-text');
    const style = getComputedStyle(text);
    return { fontFamily: style.fontFamily, fontSize: parseFloat(style.fontSize) };
  });
  expect(typography.fontFamily.toLowerCase()).toContain('tahoma');
  expect(typography.fontSize).toBeGreaterThanOrEqual(24);

  await shell.locator('[data-cm4-speed="4"]').click();
  await expect.poll(async () => page.locator('[data-commentary-feed] .flm-commentary-line').count(), { timeout: 15000 }).toBeGreaterThanOrEqual(5);
  const colouredPassages = await page.locator('[data-commentary-feed] .flm-commentary-line[data-cm-side="home"], [data-commentary-feed] .flm-commentary-line[data-cm-side="away"]').count();
  expect(colouredPassages).toBeGreaterThan(0);
  const teamColours = await live.evaluate(node => ({
    home: getComputedStyle(node).getPropertyValue('--home-color').trim(),
    away: getComputedStyle(node).getPropertyValue('--away-color').trim()
  }));
  expect(teamColours.home).not.toBe('');
  expect(teamColours.away).not.toBe('');
  expect(teamColours.home).not.toBe(teamColours.away);

  await reachHalfTime(page, live, shell, 90000);
  await page.waitForTimeout(300);
  await expect(shell.locator('[data-cm4-clock]')).toHaveText('45:00');

  await shell.locator('[data-cm4-subs]').click();
  // V049 is the active match-plan screen. Check the user's complete XI,
  // then make an actual legal outfield substitution and verify it is applied.
  const plan = page.locator('.flm-match-dialog:has(.flm-v049-match-sheet)');
  await expect(plan.locator('[data-v049-out]')).toHaveCount(11);
  const confirm = plan.locator('[data-v049-confirm]');
  await expect(confirm).toBeDisabled();
  const status = plan.locator('.flm-v049-status');
  await expect(status).toContainText('5 SUBSTITUTIONS REMAINING');

  const gkLabel = plan.locator('.flm-v049-name small', { hasText: /^GK$/ });
  const outgoing = plan.locator('[data-v049-out]').filter({ hasNot: gkLabel }).first();
  const incoming = plan.locator('[data-v049-in]').filter({ hasNot: gkLabel }).first();
  const offId = await outgoing.getAttribute('data-v049-out');
  const inId = await incoming.getAttribute('data-v049-in');
  expect(offId).toBeTruthy();
  expect(inId).toBeTruthy();
  await outgoing.click();
  await expect(confirm).toBeDisabled();
  await incoming.click();
  await expect(plan.locator('[data-v049-plan]')).toContainText('READY TO CONFIRM');
  await expect(confirm).toBeEnabled();
  await confirm.click();
  await expect(status).toContainText('4 SUBSTITUTIONS REMAINING');
  const activeAfter = await plan.locator('[data-v049-out]').evaluateAll(rows => rows.map(row => row.dataset.v049Out));
  expect(activeAfter).not.toContain(offId);
  expect(activeAfter).toContain(inId);
  expect(activeAfter).toHaveLength(11);
  await plan.locator('[data-close-manager]').first().click();

  await shell.locator('[data-cm4-pause]').click();
  await finishSecondHalf(page, live, shell, 90000);
  await expect(live.locator('[data-v068-ft-continue]')).toBeVisible();
});

test('quick start launches Arsenal and mobile navigation remains usable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: /QUICK START/ }).click();
  await expect(page.locator('.career-app')).toHaveClass(/is-open/);
  await expect(page.locator('.career-content')).toContainText('Arsenal');
  await page.getByRole('button', { name: 'Table' }).click();
  await expect(page.getByRole('heading', { name: 'League Table' })).toBeVisible();
});
