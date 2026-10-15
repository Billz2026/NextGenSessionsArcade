import { test, expect } from '@playwright/test';
import { startCareerThroughCurrentOnboarding } from './helpers/start-career.js';
import { reachHalfTime, finishSecondHalf } from './helpers/live-match.js';
import { openMatchPlan, closeMatchPlan } from './helpers/current-match-plan.js';
import { clickCareerContinue } from './helpers/current-ui.js';

test.setTimeout(120000);

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

test('V4.3 fixes Fold substitutions, duplicate commentary and full-time continuation', async ({ page }) => {
  await startCareerThroughCurrentOnboarding(page);
  await selectXI(page);
  await continueUntil(page, '2026-07-11');

  await expect(page.locator('[data-shell-continue-label]')).toHaveText('PLAY FRIENDLY');
  await clickCareerContinue(page, 'friendly');

  const live = page.locator('[data-live-match]');
  const shell = page.locator('.cm4-shell');
  await expect(live).toHaveAttribute('data-cm4', '1');
  await expect(shell).toHaveAttribute('data-cm43', '1');
  await expect(shell.locator('[data-cm4-comp]')).toHaveText('Pre-Season Friendly');

  await page.setViewportSize({ width: 720, height: 900 });
  const plan = await openMatchPlan(page, shell);
  const xiCount = await plan.locator('[data-v049-out]').count();
  expect(xiCount).toBeGreaterThanOrEqual(9);
  expect(xiCount).toBeLessThanOrEqual(11);
  const bench = plan.locator('[data-v049-in]');
  await expect(bench.first()).toBeVisible();

  // The current match plan must use the CM-style skin on a Fold viewport.
  const style = await plan.evaluate(node => ({
    background: getComputedStyle(node).backgroundColor,
    width: node.getBoundingClientRect().width,
    viewport: innerWidth
  }));
  expect(style.background).not.toBe('rgba(0, 0, 0, 0)');
  expect(style.width).toBeLessThanOrEqual(style.viewport + 2);
  await closeMatchPlan(plan);
  await expect(page.locator('[data-manager-modal]')).not.toHaveClass(/is-open/);

  await shell.locator('[data-cm4-speed="4"]').click();
  await reachHalfTime(page, live, shell, 100000);
  await expect(shell.locator('[data-cm4-pause]')).toHaveText('Resume 2nd Half');
  await shell.locator('[data-cm4-pause]').click();
  await finishSecondHalf(page, live, shell, 100000);

  await expect(live).toHaveAttribute('data-cm43-full-time', '1');

  await expect(shell.locator('[data-cm4-tactics]')).toBeHidden();
  await expect(shell.locator('[data-cm4-subs]')).toBeHidden();
  const eventText = shell.locator('[data-cm4-event-text]');
  await expect(eventText).toHaveAttribute('data-cm41-text', /^FULL TIME · /);
  const commentaryGeometry = await eventText.evaluate(node => ({
    nativeSize:getComputedStyle(node).fontSize,
    pseudo:getComputedStyle(node,'::after').content
  }));
  expect(commentaryGeometry.nativeSize).toBe('0px');
  expect(commentaryGeometry.pseudo).not.toBe('none');

  await shell.locator('[data-cm44-continue]').click();
  await expect(live).toHaveCount(0, { timeout: 10000 });
  await expect(page.locator('.v047-head h2')).toHaveText('Pre-Season');
  await expect(page.locator('.v047-fixture.is-played')).toHaveCount(1);
});
