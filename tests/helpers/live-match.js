import { expect } from '@playwright/test';

async function currentActivePause(page) {
  return page.evaluate(() => {
    const live = document.querySelector('[data-live-match]');
    const snapshot = window.__flmLiveStateV332;
    if (!live || !snapshot) return null;

    const paused = live.querySelector('[data-match-speed="0"]')?.classList.contains('is-active');
    if (!paused || live.classList.contains('is-half-time') || live.classList.contains('is-full-time')) return null;

    const userLineup = snapshot.userClubId === snapshot.homeClubId
      ? snapshot.homeLineupIds
      : snapshot.awayLineupIds;
    const injury = [...(snapshot.events || [])]
      .reverse()
      .find(event => event?.type === 'injury' && event?.playerId);

    return {
      minute: Number(snapshot.minute || 0),
      userInjury: injury && userLineup?.includes(injury.playerId)
        ? { playerId: injury.playerId }
        : null
    };
  });
}

async function resumeShortHandedIfNeeded(page, shell) {
  const notice = page.getByText('No substitutes available. You must continue short-handed.', { exact: false }).last();
  if (!(await notice.count())) return false;
  if (!(await notice.isVisible().catch(() => false))) return false;
  // Old injury notices persist after play resumes and can remain mounted at
  // full time. Only resume if the engine really is paused and the speed
  // controls are currently available to a player.
  if (!(await currentActivePause(page))) return false;
  const speed = shell.locator('[data-cm4-speed="4"]');
  if (!(await speed.isVisible())) return false;
  await speed.click({ timeout: 4000 });
  return true;
}

async function replaceInjuredPlayer(page, shell, injury) {
  await shell.locator('[data-cm4-subs]').click();
  const dialog = page.locator('.flm-match-dialog:has(.flm-v049-match-sheet)');
  await expect(dialog).toBeVisible();
  const outgoing = dialog.locator(`[data-v049-out="${injury.playerId}"]`);
  await expect(outgoing).toHaveCount(1);

  // Choose the current squad's legal goalkeeper/outfield replacement using
  // database positions, never names or outdated hidden V2 select elements.
  const replacementId = await page.evaluate(async injuredId => {
    const db = await window.FLMManager.loadDatabase();
    const positions = new Map(db.players.map(p => [p.id, p.positionGroup]));
    const keeper = positions.get(injuredId) === 'GK';
    const ids = [...document.querySelectorAll('.flm-match-dialog [data-v049-in]')].map(node => node.dataset.v049In);
    return ids.find(id => (positions.get(id) === 'GK') === keeper) || null;
  }, injury.playerId);

  if (!replacementId) {
    await dialog.locator('[data-close-manager]').first().click();
    await shell.locator('[data-cm4-speed="4"]').click();
    return;
  }

  const priorCount = await dialog.locator('[data-v049-out]').count();
  await outgoing.click();
  await dialog.locator(`[data-v049-in="${replacementId}"]`).click();
  const confirm = dialog.locator('[data-v049-confirm]');
  await expect(confirm).toBeEnabled();
  await confirm.click();
  await expect.poll(async () => dialog.locator('[data-v049-out]').evaluateAll(
    rows => rows.some(row => row.dataset.v049Out === replacementId)
  ), { timeout: 10000 }).toBe(true);
  await expect(dialog.locator('[data-v049-out]')).toHaveCount(priorCount);
  await dialog.locator('[data-close-manager]').first().click();
  await shell.locator('[data-cm4-speed="4"]').click();
}

async function runMatchToClock(page, live, shell, targetClock, timeout) {
  if (String(await shell.locator('[data-cm4-clock]').textContent() || '').trim() === targetClock) return;
  await expect(shell.locator('[data-cm4-speed="4"]')).toBeVisible({ timeout: 5000 });
  await shell.locator('[data-cm4-speed="4"]').click({ timeout: 4000 });
  const deadline = Date.now() + timeout;

  while (Date.now() < deadline) {
    const clock = String(await shell.locator('[data-cm4-clock]').textContent() || '').trim();
    if (clock === targetClock) return;

    if (await resumeShortHandedIfNeeded(page, shell)) {
      await page.waitForTimeout(250);
      continue;
    }

    const pause = await currentActivePause(page);
    if (pause?.userInjury) {
      await replaceInjuredPlayer(page, shell, pause.userInjury);
      continue;
    }
    if (pause) {
      const speed = shell.locator('[data-cm4-speed="4"]');
      if (!(await speed.isVisible())) {
        const modal = page.locator('[data-manager-modal].is-open');
        const close = modal.locator('[data-close-manager]').first();
        if (await close.isVisible().catch(() => false)) {
          await close.click();
          continue;
        }
        throw new Error(`Match paused at minute ${pause.minute}, but the current Match Centre has no visible speed control`);
      }
      await speed.click({ timeout: 4000 });
      await page.waitForTimeout(250);
      continue;
    }

    await page.waitForTimeout(250);
  }

  const current = String(await shell.locator('[data-cm4-clock]').textContent() || '').trim();
  throw new Error(`Match did not reach ${targetClock} within ${timeout}ms (stopped at ${current})`);
}

export async function reachHalfTime(page, live, shell, timeout = 90000) {
  await runMatchToClock(page, live, shell, '45:00', timeout);
  await expect(shell.locator('[data-cm4-clock]')).toHaveText('45:00');
}

export async function finishSecondHalf(page, live, shell, timeout = 90000) {
  await runMatchToClock(page, live, shell, '90:00', timeout);
  await expect(shell.locator('[data-cm4-clock]')).toHaveText('90:00');
  await expect(live).toHaveClass(/is-full-time/);
}
