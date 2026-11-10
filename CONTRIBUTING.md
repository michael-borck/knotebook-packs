# Contributing a pack

Thanks for contributing. Keep submissions small, complete, and reviewable.

- One pack per `submissions/<pack-id>/` folder.
- `submission.json` must set `submittedBy` and `licenceConfirmed: true`.
- The pack must be built by Knotebook Studio; do not hand-edit it.
- Include the licence in the pack (set it in the Studio, or edit the manifest
  before submission).
- Do not include executable content or files you do not have the right to share.
- CI must pass before review.

Run the validator before opening a PR:

```bash
node scripts/validate-submission.mjs
```

Questions? Open an issue.
