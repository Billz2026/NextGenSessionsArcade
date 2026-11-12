# Phase 8C — Real gameplay balance audit (UK independent dealer, Nov 2026)

**Status:** Experimental on a draft development branch. Based on Phase 8B, 8A and Phase 7 drafts, not the live GitHub Pages game.

## Objective
The game should feel like managing a small UK independent used-car business, not like guaranteed money printing or an impossible insolvency trap. A skilled and disciplined player should usually have a plausible path to survive and progress, while bad acquisition, inflated prices, excessive staffing and poor stock turn can cause real cash difficulties.

## Active-career test design
A deterministic test bot uses the **actual `MotorTradeEngine`**, with NO test-only instantaneous preparation or sale shortcuts. On each day it:
1. Attends monthly management meetings.
2. Assesses incoming stock, books external reconditioning, waits for workshop duration and passes actual QC.
3. Advertises at policy-driven asking prices and adjusts stock gradually when allowed.
4. Contacts only interested real-in-game leads; books appointments, handles no-shows, offers test drives, negotiates and completes cash sales or genuine deposits/collections.
5. Sources only cars passing published fee/transport + simulated repair/VAT and target-margin assessment, subject to capacity, creditor holds and protected operating buffer.
6. Runs month-end Deal Day sessions and reconciles the actual finance ledger, stock, monthly reports and save restore over 12, 36 and 60 game months.

### Comparison strategies
- **Balanced:** aims for three prepared/listed cars, modest fair asking premium and measured reductions.
- **Cautious:** fewer cars and higher expected-margin hurdle.
- **Overpriced:** asks substantially above fair buyer budgets; does not chase a sale.
- **Discount:** accepts thinner margins and deliberately sells some deals via deposits/collection to test the full commitment timeline.
- **Inactive:** buys/sells nothing and still pays fixed recurring costs.

No customer demand, auction value, bank loan, stock disposal or tax receipt is manufactured by the bot; it chooses among game-exposed offers and uses existing production calls. Results are **simulation observations**, not predictions for a real dealer.

## Release acceptance principles
- Finite, reproducible 12/36/60 month lives and reconciled cash and stocks; no negative bank, duplicated sales or erased debts.
- Sound decisions result in materially better *median* outcomes than poor ones over multiple deterministic seeds; do **not** require every single good career to win.
- Players have adequate time to repair, advertise and negotiate, and cannot instantly force a customer to buy.
- The day-to-day actions have meaningful rewards without requiring hundreds of repetitive clicks. Career progression is gated by actual cash, reputation and operating constraints.
- Balance uncertain demand and price calibrations to conservative, transparent assumptions, not to invented wholesale results or a single lucky test seed.
- Manual responsive/mobile browser tests and eventual user playtesting are required before release.

## Important limitations
These tests do not independently verify any actual BCA/Manheim sold hammer, income-tax or UK director-insolvency compliance. Retail comparisons are advertisements, not achieved prices. Missing verified sold-wholesale data, invoice/VIN/VAT evidence and an independently calibrated customer cohort remain release blockers. The tests are a basis for *relative* scenario balance only.
