# Knotebook packs

Submission queue for the [Knotebook](https://github.com/michael-borck/Knotebook) store.

A merged submission is **not** live immediately: the maintainer reviews it, signs
the pack, rebuilds the catalogue, and deploys the store.

## Submit a pack

1. In Knotebook Studio, write the story, add `assets/` and `cover.*`, choose a
   theme, then **Build pack**.
2. Create `submissions/<pack-id>/` with:
   - `pack.knotebook.json` — the built pack (do not edit it afterwards)
   - `submission.json` — copy `templates/submission.json` and fill it in
3. Validate locally:

   ```bash
   node scripts/validate-submission.mjs
   ```

4. Open a pull request. CI runs the same validator.

## What happens next

- The maintainer checks the pack against [`POLICY.md`](POLICY.md).
- The pack is signed with the private store key and added to the catalogue.
- The catalogue is rebuilt and deployed separately. A merged PR is not live until
  that deploy completes.
- Corrections ship as a new pack version.

## Pack format

See [`docs/STORE.md`](https://github.com/michael-borck/Knotebook/blob/main/docs/STORE.md)
in the main repo.

## Safety

Packs are inert data: compiled ink JSON, assets and a manifest. Do not include
executable content, scripts, or arbitrary HTML/JS. The store does not run pack
code.
