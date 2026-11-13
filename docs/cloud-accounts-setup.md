# The Motor Trade — enable player accounts and cloud careers

The GitHub Pages website remains static. Supabase hosts the password-based
authentication and the owner-owned database. Only the **public publishable key**
is embedded in the browser. The developer must **never** upload a database
password, `service_role` token or `sb_secret_` key to the repository.

## One-time owner setup — required before cloud accounts will work

The project has already been created in West EU (Ireland).

1. Open the [Supabase project SQL Editor](https://supabase.com/dashboard/project/ebzkyflbvfzqheslssis/sql/new).
2. Open [supabase/20261113_player_accounts.sql](../supabase/20261113_player_accounts.sql)
   in GitHub, copy **all** of the SQL, paste it into a **New query**, then press
   **Run**. This creates `public.motor_trade_careers`, owner-only RLS,
   the account-bound atomic save function and the readiness check. Do not use
   the Table Editor to add an unrestricted table instead.
3. In Supabase, go to **Authentication → URL Configuration** and set:
   - **Site URL:** `https://billz2026.github.io/TheMotorTrade/`
   - **Redirect URL:** `https://billz2026.github.io/TheMotorTrade/**`
   This is required for email confirmation and password recovery to return to
   the deployed game.
4. In **Authentication → Providers → Email**, retain **Confirm email** enabled.
   Players create an account with username, email and password, confirm the
   email, then log in. Username is a display name (not globally unique); email
   is the sign-in identifier.
5. Open the game, select **PLAYER ACCOUNT** and confirm the service message
   shows **Account service connected**. If the SQL was not applied successfully,
   the sign-in form remains unavailable, and guest careers remain usable.

**Email delivery note:** New Supabase projects may use a restricted built-in
email sender, suitable for limited development testing but not public sign-ups
at scale. Before public launch configure a dedicated SMTP sender and monitor
auth delivery/rate limits. Do not turn off confirmation as a workaround.

## How players use their careers

- **Guest**: normal local browser save remains at
  `the-motor-trade-career-v1` and keeps independent automatic backups and JSON
  export/import. No account or connectivity is required to play.
- **First login**: when the player has no cloud career, click
  **UPLOAD DEVICE CAREER** to make an explicit cloud copy of the current guest
  career. The guest save is not erased.
- **Second device**: sign in with the same email/password, click
  **LOAD CLOUD CAREER**. The game then uses a per-account local cache and
  automatically syncs new actions to Supabase.
- **Conflicts/offline**: the database uses an atomic revision check. A stale
  device receives an explicit warning and its local copy remains intact; it
  cannot silently replace newer cloud progress. Players may export JSON,
  reload the cloud version, or retry a non-conflict network failure.
- **Sign out**: the active account career is replaced in the *screen* by the
  original independent guest career; cloud and account-local caches are kept.
- **New Career**: starts a new **guest** save, not a hidden overwrite of an
  existing cloud career. Version 1 supports one cloud career per account.
- **Recovery**: passwords can be reset through email. A browser-only JSON
  backup remains a good independent safety option.

## Security design

- `public.motor_trade_careers` has RLS; only the logged-in `auth.uid()`
  can select that account's row.
- Direct table inserts/updates/deletes are not granted to `authenticated`.
  The `motor_trade_save_career` function is `SECURITY DEFINER`, derives the
  account from verified `auth.uid()`, rejects mismatched expected account IDs,
  and accepts writes only with a matching existing revision. No client key
  grants cross-account access.
- Client-side `MotorTradeEngine.normalize` checks the save's internal game
  consistency before loading or uploading.
- **Anti-cheat limitation:** the economic simulation still runs in the browser.
  An authenticated player can potentially manipulate their *own* game state;
  row ownership and revision control do not make money balances trustworthy for
  competitive rankings. Move economic transactions server-side before adding
  prizes or trusted global leaderboards.
- Free-tier projects may pause for inactivity and do not replace a proper
  database backup policy. Monitor quotas and enable backups as the project
  grows.

## Tests

- `node --test tests/site.test.mjs tests/career-storage.test.mjs tests/cloud-careers.test.mjs`
- `node tests/career-save-browser.mjs`
- `node tests/cloud-account-browser.mjs`

Browser tests use an isolated fake Supabase service, so **no test will create
real users or write to the production database**. The actual database setup
must be validated manually in Supabase by the project owner.
