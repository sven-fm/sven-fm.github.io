# LedgerRow

One line of the experience record: years, role, organization, linking to the matching entry on /profile/.

- Grid: `7.5em 1fr auto`, baseline-aligned, hairline `sage-rule` on top; the list closes with a hairline at the bottom.
- Years in `caption`, `sage-muted`, tabular. Role in `role` (Syne 600), `sage`. Organisation in `body`, `sage-body`, right-aligned.
- Hover and focus: a plate in `rgba(220,228,210,.045)` with `radius-row` fades and scales from .985 to 1; a brass "→" slides in after the organization.
- Mobile (≤900px): role and years on the first line, organization under the role in `sage-muted`; no arrow.
- The consumer provides the href and the three strings. Six rows maximum on the home page.
