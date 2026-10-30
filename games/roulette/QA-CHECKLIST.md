# High Roll Run — Release QA checklist

## Automated checks
- [x] Each of the 37 pockets has the correct red/black/green colour
- [x] Red, black, odd, even, each dozen, all straight-number selections, and zero payout correctly
- [x] European roulette fair return: even-money 2×, dozens 3×, straight number 36× (gross, including stake)
- [x] Secure rejection sampling avoids modulo bias
- [x] Large virtual balances (>£10 million), safe-integer maximum and ALL IN loss
- [x] Classic 100-credit run and saved best survive High Roller mode switching
- [x] Refresh during locked win resolves once, restores winnings and avoids duplicate payout
- [x] Refresh during locked all-in loss records bankruptcy once, opens game-over dialog and clears pending
- [x] BEST BANKED and saved win/loss amount display
- [x] 3.9-second Full Spin when system requests reduced motion, unless Short Spin explicitly selected
- [x] Streak result badge and saved record survive a refresh
- [x] V11 wheel styling, result hierarchy and existing Fold7 media rules left unchanged

## Manual visual/device checks still required
- [ ] Desktop Chrome: check the top pointer, landing pocket, ball overlap and full view at 100% zoom
- [ ] Desktop: test Red, Black, dozens and exact zero through the actual interface
- [ ] Desktop: verify current virtual cash vs BEST BANKED before and after BANK SCORE
- [ ] Desktop: try a 20–30 spin session, banking a run and intentionally ending a run at zero
- [ ] Galaxy Z Fold7 unfolded portrait: wheel size and scrolling, chip tapping and legible result text
- [ ] Galaxy Z Fold7 unfolded landscape: two-panel layout without clipped controls
- [ ] Galaxy Z Fold7 cover display: vertical stack, buttons, keyboard/select and modal fit
- [ ] Galaxy Z Fold7: check full 3.9-second wheel animation and final ball/pocket alignment
- [ ] Galaxy Z Fold7: fold/unfold during an active run; check no reroll or lost balance
- [ ] Optional sound: default OFF, no unexpected audio, no broken audio after leaving/re-entering
- [ ] Long streak and million-pound milestone celebration does not hide core actions permanently
- [ ] Local Top 10 is separate per mode, and new score appears only when banked

**Release status:** Automated behavioural checks passed in the audit; physical device
visual verification remains outstanding. Do not mark the game fully QA-approved
until the outstanding manual checks have been completed.
