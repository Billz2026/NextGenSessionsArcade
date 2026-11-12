# Phase 8D — Chromium release-gate report (12 November 2026)

## Scope and source

This is a **draft integration review** of the *stacked* Phase 7 → Phase 8A → Phase 8B → Phase 8C game, tested from the Phase 8D pull-request branch. No main-branch merge or GitHub Pages release was performed.

- Phase 7: draft PR #205
- Phase 8A: draft PR #206
- Phase 8B: draft PR #207
- Phase 8C: draft PR #208
- Phase 8D: draft PR #209

The GitHub Actions `Chromium desktop/mobile release gate` job installs Playwright Chromium, serves the **exact checked-out PR build locally** at `http://127.0.0.1:4173`, runs `node tests/browser-release-gate.mjs`, and uploads the full-page screenshots as the `motortrade-browser-evidence` artifact. This is *not* a test of the currently published GitHub Pages build.

## Browser acceptance checks

Every run navigates all 13 production dealership sections, without replacing the real engine with any test fixture. The browser gate uses:
- Desktop **1440×900**
- Tablet **768×1024**
- Narrow phone **390×844** with Playwright Chromium touch emulation
- Narrow phone **360×780** with Playwright Chromium touch emulation

For each viewport: open New Career, select the default UK2026 business model, verify the £50,000 opening balance, navigate all 13 gameplay areas, check no uncaught JavaScript errors, check both document and body dimensions against the **requested CSS viewport width**, check rendered full-page screenshot width, then reload the local saved career and verify unchanged financial records.

For **desktop and 390px phone**, a full genuine, UI-only dealer transaction is tested:
1. Select a real seeded private seller, type its asking price into the live offer field and purchase; check bank debit exactly once.
2. Reload the career and verify the car remains owned.
3. In Workshop, pay the displayed £80 UK2026 assessment cost (no technician hired), book paid outsourced repairs and wait actual game days.
4. Complete final QC (including possible rectification), then advertise at a valid asking price in Vehicle Stock.
5. Wait until real seeded customer demand exists; contact the lead, book attendance, complete a real test drive, agree terms and hand over. A no-show or rejected test drive does not fabricate a sale.
6. Verify completed retail sale, bank/ledger reconciliation and reload without duplicate sales or supplier invoices.

A separate desktop auction journey uses the real rostrum, raises bids against seeded competing traders, checks that a hammered invoice **blocks day advancement and does not debit cash early**, then settles the actual buyer fee/hammer/transport transaction exactly once.

This is more than a Node-only engine unit test: it exercises **real Chromium, DOM controls, browser storage, CSS layout and the published game script load order**. Browser tests and the 284 Node engine regressions run in separate CI jobs.

## Defects actually found and fixed

1. **Financially misleading workshop quote:** `workshop-view.js` quoted **£55** for a modern UK2026 inspection when `workshop.js` actually debited **£80** with no staff technician. The displayed modern and classic fee tiers now match their engine; the browser test asserts amount and exact bank debit. Cache version raised in `index.html`.
2. **360px Finance horizontal overflow:** real screenshot originally measured **382px wide** despite the intended 360px viewport, due to long VAT/finance values with `white-space:nowrap`. CSS now wraps long value/label rows at small widths. The strengthened browser release gate compares the browser's layout, actual document+body scroll widths **and the generated PNG pixel width** against the requested viewport so the issue cannot recur silently. The corrected 360px full-page Finance capture is **360px**.
3. **Stale purchase disclosure:** the initial 2026 career warning now states the four unsupported wholesale guides are excluded from new sourcing until evidence supports them, rather than suggesting they remain buyable.
4. **Screenshot-only misleading skip-link overlay:** when Chromium captured a full page after scrolling, its offscreen fixed keyboard skip link could appear in the stitched image away from the viewport. Screenshots now scroll to the top before capturing; this did not affect a player's visible UI, but fixes misleading review artifacts.

## Result and what it means

- Final Phase 8C node regression suite: **284/284 pass** on the QA PR branch.
- Last full browser run before screenshot-only scroll refinements: **273 independent checks, 0 failures**, including a completed retail sale **on the 390px touch emulator**.
- Screenshot artifact: **25 images** including desktop, tablet, both phone widths, private buying, workshop, retail listing, finance after completed handover and auction payment.
- Save/restore: the production `MotorTradeEngine.normalize` validates saved JSON; bank cash equals opening cash plus all ledger deltas; no duplicate receipts occur after reload.
- Manual screenshot review found and fixed the 360px Finance overflow. Automated Chromium at phone dimensions is **not the same as hands-on testing on a real Android/iPhone**.

## Release decision

**Technical browser/engine integration: PASS** (subject to final workflow rerun after evidence capture refinement).

**Commercial/real-market realism: NOT YET VERIFIED.** There are no independently verified sold wholesale vehicle prices in the current 50-row set. Four source models are blocked due to wholesale > retail contradictions and 14 retail matches have low confidence. HMRC-compliant VIN/VRN stockbook, invoice-specific VAT eligibility and input VAT return calculations, financing, owner compensation and comprehensive payroll/insolvency modelling are outstanding. Do not call these simulated models real-world-certified valuations or official accounting.

**Player enjoyment: HUMAN VALIDATION STILL REQUIRED.** Neither a green automated suite nor an emulator proves that a human enjoys the pacing, onboarding, negotiation frequency or friction over a full 12–60-month career. Have the owner play several sessions on the actual preferred devices and review feedback before making gameplay changes.

**Public release: HOLD.** Keep PRs #205–#209 as drafts until commercial evidence and human-device sign-off are adequate, then merge in dependency order and check integration CI on main. No automatic deployment, borrowing, fictitious refunds or live account transactions are authorised by this test.
