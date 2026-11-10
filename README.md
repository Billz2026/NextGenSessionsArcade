# The Motor Trade

**The Motor Trade** is a browser-based UK used-car dealership management game by NextGen Sessions. The interface takes inspiration from classic football management games: make commercial decisions, manage money and track an ongoing career.

**Play:** https://billz2026.github.io/TheMotorTrade/

## Playable trading foundation (v0.3)

The main menu uses the original unchanged NextGen Sessions wordmark, standalone silver-and-gold Motor Trade vector title and sharp showroom background. Create a career with **£12,500 starting cash** and a **two-vehicle forecourt**. Continue Career resumes the same locally saved business.

### Three ways of acquiring vehicles

1. **Auction Desk:** inspect fictional catalogue lots, buyer fees, grade, mileage, preparation estimate and retail guide. Enter your maximum bid. Rival traders have simulated competing bids; losing costs nothing, winning deducts the full bid plus buyer fee.
2. **Direct sellers:** private owners and walk-in customers ask the dealership to purchase their cars. Offer an amount; the owner may reject a low offer. A successful purchase reduces cash and adds stock without auction fees.
3. **Part-exchanges:** when a customer buys one of your advertised vehicles, you can negotiate an allowance for their existing car. The cash collected is the selling price **minus the part-exchange allowance**. That incoming car becomes owned stock and must be prepared before resale. This is a retail transaction with a separate incoming acquisition, not a free car.

### First complete trading loop

- Acquire a vehicle through an auction or a direct seller.
- Reserve sufficient cash for required preparation of all acquired vehicles, then pay a simplified inspection/preparation budget. The first version prevents purchasing into an unrecoverable cash deadlock.
- Set a retail asking price and advertise it.
- In the Sales Office, accept a cash customer's offer or make limited counteroffers.
- Alternatively, accept a customer's part-exchange after valuing the incoming car.
- The ledger records purchases, buyer fees, preparation, sale proceeds and part-exchange allowances.
- Sales update cash, stock, reputation, completed-sales count and **realised gross trading margin**.
- **Continue** advances one in-game day and refreshes the available auction lots and direct sellers. There are no arbitrary daily cash injections.

The current dealership inbox, dashboard, calendar, menu settings, browser save and responsive navigation remain in place. Stock and trading history survive reloads. Earlier **v0.2** browser saves are migrated into the updated format while retaining dealership names, game day and inbox history. A new career still overwrites the single saved career only after confirmation.

## Accounting and gameplay boundaries

This is **fictional gameplay**, not live auction, DVLA, valuation or customer data. Buyer thresholds and vehicle values are authored examples. Grade and condition notes are not an inspection guarantee. Preparations are simplified as one required cost, not a real safety certificate.

**Realised gross trade margin** is the sale price less the sold vehicle's acquisition cost and preparation. It is not accounting net profit. The game currently **does not calculate** VAT (including margin-scheme treatment), tax, premises costs, advertising spend, finance, warranties, consumer-rights claims, or other overheads. Part-exchange allowance is capital tied up in the newly acquired vehicle, not a reduction in the sold car's headline sale price. Cash and ledger sums are reconciled before saved v0.3 careers are loaded.

Customers are currently deterministic examples rather than a fully simulated market. This first milestone does not yet model bank funding, external feeds, multi-site premises, vehicle inspections beyond a fixed budget, disposal, or complex negotiation personalities. These are future development stages.

## Structure and tests

- `index.html` — game menu and interactive management screens.
- `styles.css` — responsive premium game interface.
- `trading.js` — deterministic financial and vehicle transaction engine; save migration/validation.
- `simulator.js` — game navigation, inbox, calendar, market rendering and save integration.
- `tests/site.test.mjs` — Node built-in tests for UI, the complete trading loop, cash conservation and migration.
- `assets/nextgen-header-wordmark-2026.webp` — original NextGen Sessions logo (unchanged).
- `assets/the-motor-trade-premium.svg` — premium vector game title.
- `assets/showroom-home-bg.webp` — high-resolution showroom background.

Run:

```sh
node --check trading.js
node --check simulator.js
node --test tests/site.test.mjs
```

The pre-pivot Arcade version is archived at `archive/nextgen-arcade-before-motor-trade-2026-11-09`.

© 2026 NextGen Sessions.
