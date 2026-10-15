import { expect } from '@playwright/test';

/**
 * Use the actual, visible Championship Manager-style sidebar control.
 * Never fall back to hidden legacy buttons: a missing or disabled current
 * control is a genuine regression that the browser suite must report.
 */
export async function clickCareerContinue(page, expectedAction) {
  const button = page.locator('.career-app.is-open .flm-cm-sidebar [data-shell-continue]');
  await expect(button).toBeVisible({ timeout: 10000 });
  await expect(button).toBeEnabled();
  if (expectedAction) await expect(button).toHaveAttribute('data-shell-action', expectedAction);
  await button.click();
}

/**
 * Continue through dated milestones / friendly breaks until the requested
 * date. The game can require a manual action at each fixture, which should
 * be handled by the caller rather than silently skipping it.
 */
export async function continueCareerUntil(page, targetDate, maxSteps = 30) {
  for (let step = 0; step < maxSteps; step += 1) {
    const current = await page.evaluate(() => window.FLMManager?.activeCareer?.currentDate || '');
    if (current >= targetDate) return current;
    await clickCareerContinue(page);
    await expect.poll(() => page.evaluate(() => window.FLMManager?.activeCareer?.currentDate || ''),
      { timeout: 10000 }).not.toBe(current);
  }
  throw new Error(`Continue Game did not reach ${targetDate} after ${maxSteps} actions`);
}

/** The home screen contains hidden responsive duplicates; only click the visible entry. */
export async function clickVisibleNewGame(page) {
  const button = page.locator('[data-action="new-game"]:visible').first();
  await expect(button).toBeVisible();
  await button.click();
}

/** Open a real player's profile from the user-visible squad button. */
export async function openFirstSquadProfile(page) {
  const profileButton = page.locator('.career-app.is-open [data-v044-profile]:visible').first();
  await expect(profileButton).toBeVisible();
  const id = await profileButton.getAttribute('data-v044-profile');
  expect(id).toBeTruthy();
  await profileButton.click();
  const profile = page.locator('.career-app.is-open [data-flm-instant-profile]');
  await expect(profile).toBeVisible({ timeout: 10000 });
  return profile;
}

/** Exit via the visible sidebar, never by mutating DOM state in the test. */
export async function exitCareer(page) {
  const button = page.locator('.career-app.is-open [data-shell-exit]');
  await expect(button).toBeVisible();
  await button.click();
  await expect(page.locator('.career-app')).not.toHaveClass(/is-open/);
}
