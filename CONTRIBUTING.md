# Contributing a pack

Thanks for contributing. Keep submissions small, complete, and reviewable.

- One pack per `submissions/<pack-id>/` folder; the folder name must match the
  pack `id`.
- `submission.json` must set `submittedBy` and `licenceConfirmed: true`.
- The pack must be version 1 and built by Knotebook Studio; do not hand-edit it.
- Assets and cover must be `data:` URLs; packs must stay under 16 MB.
- Include the licence in the pack (set it in the Studio, or edit the manifest
  before submission).
- Do not include executable content or files you do not have the right to share.
- CI must pass before review.

Run the validator before opening a PR:

```bash
node scripts/validate-submission.mjs
```

Questions? Open an issue.
