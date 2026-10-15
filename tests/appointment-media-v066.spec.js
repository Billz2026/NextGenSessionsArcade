import { test, expect } from '@playwright/test';
import { clickVisibleNewGame } from './helpers/current-ui.js';

test.setTimeout(60000);

test.beforeEach(async ({ page }) => {
  await page.goto('/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('new manager appointment runs a three-question press conference and records fan reactions', async ({ page }) => {
  await clickVisibleNewGame(page);
  await page.locator('[data-mgr-first]').fill('Alex');
  await page.locator('[data-mgr-last]').fill('Morgan');
  await page.locator('[data-mgr-nationality]').selectOption({ label: 'England' });
  await page.locator('[data-mgr-next]').click();
  await page.locator('[data-mgr-exp="none"]').click();
  await page.locator('[data-mgr-finish]').click();
  await page.locator('[data-start-club]').filter({ hasText: 'Arsenal' }).click();
  await page.getByRole('button', { name: /TAKE CONTROL/i }).click();
  await expect(page.locator('.career-app')).toHaveClass(/is-open/);

  // The current appointment flow opens directly into a three-question
  // press conference. The retired announcement/fans screens no longer exist.
  await expect(page.locator('[data-appointment-v066="press"]')).toBeVisible();
  await expect(page.locator('[data-appointment-v066="press"]')).toContainText('Alex Morgan');
  await expect(page.locator('#modalTitle')).toHaveText('FIRST PRESS CONFERENCE');

  for (const style of ['humble','demanding','protective']) {
    await expect(page.locator('[data-appointment-v066="press"]')).toBeVisible();
    await expect(page.locator('[data-media-answer]')).toHaveCount(5);
    await page.locator(`[data-media-answer="${style}"]`).click();
  }

  await expect(page.locator('[data-appointment-v066="summary"]')).toBeVisible();
  const state = await page.evaluate(() => window.FLMManager.activeCareer.appointmentExperience);
  expect(state.completed).toBe(true);
  expect(state.answers).toHaveLength(3);
  expect(state.fanSentiment).toBeGreaterThanOrEqual(10);
  expect(state.fanSentiment).toBeLessThanOrEqual(95);
  expect(state.communicationStyle).toBeTruthy();

  const news = await page.evaluate(() => window.FLMManager.activeCareer.news.items.map(item => item.key));
  expect(news).toContain('first-press-conference');
  expect(news).not.toContain('manager-appointed');
  expect(news).not.toContain('fan-reaction-appointment');

  await page.locator('[data-appt-enter]').click();
  await expect(page.locator('#appModal')).not.toHaveClass(/is-open/);
  await expect.poll(async () => page.evaluate(() => window.FLMManager.activeCareer.appointmentExperience.dismissed)).toBe(true);
  const relationshipDeltas = await page.evaluate(() => Object.values(window.FLMManager.activeCareer.playerRelationships || {}).map(r => r.lastMediaReaction?.delta).filter(Number.isFinite));
  expect(relationshipDeltas.length).toBeGreaterThan(5);
});
