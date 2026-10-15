import { expect } from '@playwright/test';

/**
 * Use the production V049 match-plan surface. Retired V2 dialogs and their
 * hidden native selects are deliberately not used as test shortcuts.
 */
export async function openMatchPlan(page, shell) {
  const button = shell.locator('[data-cm4-subs]');
  await expect(button).toBeVisible();
  await button.click();
  const plan = page.locator('.flm-match-dialog:has(.flm-v049-match-sheet)');
  await expect(plan).toBeVisible();
  await expect(plan.locator('[data-v049-out]').first()).toBeVisible();
  await expect(plan.locator('[data-v049-in]').first()).toBeVisible();
  await expect(plan.locator('[data-v049-confirm]')).toBeDisabled();
  return plan;
}

export async function makeLegalMatchSubstitution(page, plan, { striker = false } = {}) {
  const selection = await page.evaluate(async shouldChooseStriker => {
    const db = await window.FLMManager.loadDatabase();
    const byId = new Map(db.players.map(player => [player.id, player]));
    const starters = [...document.querySelectorAll('.flm-match-dialog [data-v049-out]')]
      .map(row => row.dataset.v049Out);
    const bench = [...document.querySelectorAll('.flm-match-dialog [data-v049-in]')]
      .map(row => row.dataset.v049In);
    const isOutfield = id => {
      const p = byId.get(id);
      return p && p.positionGroup !== 'GK' && p.primaryPosition !== 'GK';
    };
    const isStriker = id => /^(?:ST|SC|CF|FC)$/.test(byId.get(id)?.primaryPosition || '');
    const offId = shouldChooseStriker ? starters.find(isStriker) : starters.find(isOutfield);
    const inId = bench.find(id => isOutfield(id) && (!shouldChooseStriker || isStriker(id)))
      || bench.find(isOutfield);
    return { offId, inId, before: starters.length };
  }, striker);
  expect(selection.offId, striker ? 'A striker must be present in the starting XI' : 'An outfield starter is required').toBeTruthy();
  expect(selection.inId, 'An outfield substitute is required').toBeTruthy();

  const status = plan.locator('.flm-v049-status');
  const priorText = await status.textContent();
  const priorMatch = String(priorText || '').match(/(\d+)\s+SUBSTITUTIONS REMAINING/i);
  expect(priorMatch, 'The match must show remaining substitutions').not.toBeNull();
  const prior = Number(priorMatch[1]);
  expect(prior).toBeGreaterThan(0);
  const confirm = plan.locator('[data-v049-confirm]');
  await plan.locator(`[data-v049-out="${selection.offId}"]`).click();
  await expect(confirm).toBeDisabled();
  await plan.locator(`[data-v049-in="${selection.inId}"]`).click();
  await expect(plan.locator('[data-v049-plan]')).toContainText('READY TO CONFIRM');
  await expect(confirm).toBeEnabled();
  await confirm.click();

  await expect(status).toContainText(`${prior - 1} SUBSTITUTIONS REMAINING`);
  const next = await plan.locator('[data-v049-out]').evaluateAll(rows => rows.map(row => row.dataset.v049Out));
  expect(next).toHaveLength(selection.before);
  expect(next).not.toContain(selection.offId);
  expect(next).toContain(selection.inId);
  return { ...selection, remainingBefore: prior };
}

export async function closeMatchPlan(plan) {
  await plan.locator('[data-close-manager]').first().click();
  await expect(plan).not.toBeVisible();
}
