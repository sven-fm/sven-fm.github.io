# LedgerRow

One line of the experience record: years, role, organization, linking to the matching entry on /profile/.

- Grid: `7.5em 1fr auto`, baseline-aligned, hairline `--rule` on top; the list closes with a hairline at the bottom.
- Years in `caption`, `--fg-muted`, tabular. Role in `role` (Syne 600), `--fg`. Organization in `body`, `--fg-body`, right-aligned.
- Hover and focus: a plate in `--wash` with `radius-row` fades and scales from .985 to 1; an `--accent` "→" slides in after the organization.
- Theme tokens only, so the row works in both themes unchanged. The preview shows dark.
- Mobile (≤900px): role and years on the first line, organization under the role in `--fg-muted`; no arrow.
- The consumer provides the href and the three strings. Six rows maximum on the home page.
