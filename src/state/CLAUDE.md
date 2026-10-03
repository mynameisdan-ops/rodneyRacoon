# src/state: store and saves

- `store.ts`: the zustand store (`useGame`): the save data, the active player, and actions
  (`createProfile`, `updateProfile`, `recordResult`, `buyItem`, …). Every change goes through
  `commit`, which writes the save (writes are skipped for the dev-only `#demo` players).
- `schema.ts`: the save format (`SAVE_VERSION`, `Profile`, `SaveData`) and `migrate()`, which
  turns whatever was stored into a valid current save. Damaged entries are dropped, not fatal.
  A save from a newer app throws `NewerSaveError`, and the game shows "please update" and never
  overwrites it.
- `persistence.ts`: IndexedDB through `idb-keyval` (db `long-way-home`), with writes chained in
  order.

## Change the save format

1. Bump `SAVE_VERSION` and add the field to `Profile` with a note "(added in vN)".
2. Fill it in `sanitizeProfile` with a safe default for older saves, and validate what's stored
   (unknown ids dropped, numbers clamped). Extend the version list in `migrate()`'s comment.
3. Set it for new players in `createProfile` (`store.ts`); TypeScript also flags the demo
   players in `src/dev/demo.ts`.
4. `schema.test.ts`: an old save loads with the default, and damaged values are cleaned up.

So far each version only added fields, so sanitizing is the whole migration.

## Privacy

The app has no photo feature: M8's avatars are drawn from photos the parent shares, as unnamed
presets (save v8 adds `avatar`; v6 added the device's `audio` settings, v7 each player's
timer, difficulty settings and `stats`). Never commit, store or log those photos, and keep the children's
names out of the repo. No network calls, ever.
