# Submissions

Create one folder per pack:

```
submissions/<pack-id>/
  pack.knotebook.json
  submission.json
```

`<pack-id>` should match the pack's `id` (a slug). See the root README and
[`POLICY.md`](../POLICY.md). Validate with:

```bash
node scripts/validate-submission.mjs
```
