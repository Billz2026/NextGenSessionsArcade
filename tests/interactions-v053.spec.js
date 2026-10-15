import { test, expect } from '@playwright/test';
import { clickCareerContinue, openFirstSquadProfile } from './helpers/current-ui.js';

test.setTimeout(60000);

test.beforeEach(async ({ page }) => {
  await page.goto('/index.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole('button', { name: /QUICK START/ }).click();
  await expect(page.locator('.career-app')).toHaveClass(/is-open/);
});

async function openTransferWindow(page) {
  if (await page.locator('[data-v050-transfer-tab]').count()) return;
  await page.locator('.flm-cm-sidebar [data-shell-nav="home"]').click();
  await clickCareerContinue(page, 'milestone');
  await expect(page.locator('.v054-date-chip')).toContainText('15 JUN 2026');
  await expect(page.locator('[data-v050-transfer-tab]')).toBeVisible();
}

test('the integrated player profile exposes live data and persists the shortlist', async ({ page }) => {
  await page.getByRole('button', { name: 'Squad', exact: true }).click();
  const profile = await openFirstSquadProfile(page);
  await expect(profile.locator('.flm-ip-title h2')).not.toBeEmpty();
  await expect(profile.locator('.flm-ip-summary')).toContainText('ESTIMATED VALUE');
  await expect(profile.locator('.flm-ip-summary')).toContainText('PERSONALITY');
  await expect(profile.locator('.flm-ip-attribute-row')).not.toHaveCount(0);

  const shortlist = profile.locator('[data-flm-shortlist]');
  await expect(shortlist).toHaveText(/SHORTLIST/);
  await shortlist.click();
  await expect(shortlist).toContainText('SHORTLISTED');
  const savedShortlist = await page.evaluate(() => JSON.parse(localStorage.getItem('flm-shortlist') || '[]'));
  expect(savedShortlist).toHaveLength(1);

  await profile.getByRole('button', { name: 'CONTRACT', exact: true }).click();
  await expect(profile.locator('[data-flm-profile-panel]')).toContainText('Weekly wage');
  await expect(profile.locator('[data-flm-profile-panel]')).toContainText('Expiry');

  await profile.getByRole('button', { name: 'TRANSFER', exact: true }).click();
  await expect(profile.locator('[data-flm-profile-panel]')).toContainText('TRANSFER STATUS');
  await expect(profile.locator('[data-flm-profile-panel]')).toContainText('Estimated value');

  await profile.locator('[data-flm-profile-back]').click();
  await expect(page.getByRole('heading', { name: 'Squad' })).toBeVisible();
});

async function seedListedOffer(page, serial) {
  return page.evaluate(async number => {
    const c = window.FLMManager.activeCareer;
    const db = await window.FLMManager.loadDatabase();
    const transfers = await import('./transfers-v050.js?v=0.6.0');
    transfers.ensureTransferState(c, db);

    const own = transfers.listOwnPlayersForTransfer(c, db).find(player => player.positionGroup !== 'GK');
    if (!own) throw new Error('No outfield player available to list.');
    if (!c.transfers.listedPlayerIds.includes(own.id)) transfers.toggleTransferListed(c, db, own.id);

    const buyerEntry = Object.entries(c.transfers.aiClubs)
      .filter(([clubId, state]) => clubId !== c.clubId && state.transferBudget > 1000000 && state.wageRoom > 1000)
      .sort((a, b) => b[1].transferBudget - a[1].transferBudget)[0];
    if (!buyerEntry) throw new Error('No funded AI buyer available for deterministic UI offer test.');

    const [buyerClubId, buyerState] = buyerEntry;
    const value = transfers.estimatePlayerValue(own);
    const offeredFee = Math.max(250000, Math.min(
      Math.round(value * 0.92 / 250000) * 250000,
      Math.floor(buyerState.transferBudget * 0.45 / 250000) * 250000
    ));
    const maxFee = Math.min(
      buyerState.transferBudget,
      Math.max(offeredFee, Math.round(offeredFee * 1.2 / 250000) * 250000)
    );
    const proposedWage = Math.min(buyerState.wageRoom, Math.max(1000, transfers.estimateWeeklyWage(own)));
    const dates = ['2026-06-19', '2026-06-23', '2026-06-27'];
    const date = dates[Math.min(Math.max(number - 1, 0), dates.length - 1)];
    c.currentDate = date;
    c.calendar.currentDate = date;
    c.calendar.fixturesReleased = date >= '2026-06-19';

    const offer = {
      id: `ui-test-offer-${number}-${own.id}`,
      playerId: own.id,
      buyerClubId,
      offeredFee,
      maxFee,
      proposedWage,
      contractYears: (own.reportedAge || 26) >= 30 ? 3 : 4,
      status: 'pending',
      createdPhase: `ui-test-${number}`,
      round: c.roundIndex || 0,
      listed: true
    };
    c.transfers.incomingOffers.push(offer);
    localStorage.setItem('flm-career-save', JSON.stringify(c));
    return { id: offer.id, playerId: offer.playerId, offeredFee: offer.offeredFee };
  }, serial);
}

test('V0.6.1 incoming transfer offers can be rejected, countered and accepted from the UI without relying on a random market event', async ({ page }) => {
  await openTransferWindow(page);
  const rejected = await seedListedOffer(page, 1);
  await page.locator('[data-v050-transfer-tab]').click();
  await page.getByRole('button', { name: /^OFFERS/ }).click();
  let row = page.locator(`[data-v052-offer-row="${rejected.id}"]`);
  await expect(row).toBeVisible();
  await row.locator('[data-v052-reject]').click();
  await expect.poll(async () => page.evaluate(id => JSON.parse(localStorage.getItem('flm-career-save')).transfers.incomingOffers.find(item => item.id === id)?.status, rejected.id)).toBe('rejected');

  const countered = await seedListedOffer(page, 2);
  await page.locator('[data-v050-transfer-tab]').click();
  await page.getByRole('button', { name: /^OFFERS/ }).click();
  row = page.locator(`[data-v052-offer-row="${countered.id}"]`);
  await expect(row).toBeVisible();
  await row.locator('[data-v052-counter-fee]').fill(String(countered.offeredFee));
  await row.locator('[data-v052-counter]').click();
  await expect.poll(async () => page.evaluate(id => JSON.parse(localStorage.getItem('flm-career-save')).transfers.incomingOffers.find(item => item.id === id)?.status, countered.id)).toBe('completed');

  const accepted = await seedListedOffer(page, 3);
  await page.locator('[data-v050-transfer-tab]').click();
  await page.getByRole('button', { name: /^OFFERS/ }).click();
  row = page.locator(`[data-v052-offer-row="${accepted.id}"]`);
  await expect(row).toBeVisible();
  await row.locator('[data-v052-accept]').click();
  await expect.poll(async () => page.evaluate(id => JSON.parse(localStorage.getItem('flm-career-save')).transfers.incomingOffers.find(item => item.id === id)?.status, accepted.id)).toBe('completed');
  await expect.poll(async () => page.evaluate(playerId => JSON.parse(localStorage.getItem('flm-career-save')).transfers.ownership[playerId], accepted.playerId)).not.toBe(await page.evaluate(() => window.FLMManager.activeCareer.clubId));
});
