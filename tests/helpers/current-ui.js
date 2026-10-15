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
  const before = await profileButton.evaluate(node => {
    const rect = node.getBoundingClientRect();
    const center = { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
    const hit = document.elementFromPoint(center.x, center.y);
    const content = document.querySelector('.career-app.is-open .career-content');
    const cr = content?.getBoundingClientRect();
    return {
      node: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
      hit: hit?.outerHTML?.slice(0, 350),
      hitContainsButton: hit === node || node.contains(hit),
      inViewport: center.x >= 0 && center.x < innerWidth && center.y >= 0 && center.y < innerHeight,
      content: cr ? { x: cr.x, y: cr.y, width: cr.width, height: cr.height,
        overflowY: getComputedStyle(content).overflowY, scrollTop: content.scrollTop,
        scrollHeight: content.scrollHeight, clientHeight: content.clientHeight } : null,
      viewport: { width: innerWidth, height: innerHeight }
    };
  });
  try {
    await profileButton.click({ timeout: 6000 });
  } catch (error) {
    const geometry = await page.evaluate(() => {
      const node = document.querySelector('.career-app.is-open [data-v044-profile]');
      const app = document.querySelector('.career-app');
      const content = document.querySelector('.career-content');
      if (!node) return { missing: true };
      const rect = node.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const hit = document.elementFromPoint(cx, cy);
      const info = element => element ? {
        tag: element.tagName,
        className: String(element.className).slice(0, 100),
        pointerEvents: getComputedStyle(element).pointerEvents,
        zIndex: getComputedStyle(element).zIndex,
        position: getComputedStyle(element).position,
        rect: (() => { const a=element.getBoundingClientRect(); return { top:a.top,left:a.left,bottom:a.bottom,right:a.right,width:a.width,height:a.height }; })()
      } : null;
      return { button: info(node), hit: info(hit), app: info(app), content: info(content),
        viewport: {width:innerWidth,height:innerHeight}, scrollY:scrollY };
    });
    throw new Error(`The visible squad profile button is not clickable. Layout before: ${JSON.stringify(before)}; after: ${JSON.stringify(geometry)}; original: ${error.message}`);
  }
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
