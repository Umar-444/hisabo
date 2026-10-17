## Description
<!-- Provide a brief summary of the changes introduced by this PR. -->

## Related Issues
<!-- Link related issues, e.g. Fixes #123 -->

## Type of Change
- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature (non-breaking change which adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📝 Documentation update
- [ ] 🎨 Code style / UI polish / Refactoring

## Financial & Architectural Checklist
- [ ] All monetary calculations use integer minor units (`BIGINT` halalas/cents). Zero floats.
- [ ] Conservation equation holds: $\sum \text{participant shares} = \text{total expense}$.
- [ ] Remainder distribution is deterministic without loss.
- [ ] Two-party settlement handshake respected (balances only update on confirmed settlements).
- [ ] Client Components do not import `server-only` or Drizzle ORM directly.

## Testing & Verification
- [ ] `npm test` passes 100% locally.
- [ ] `npx tsc --noEmit` passes with 0 errors.
- [ ] `npm run lint` passes without warnings.
- [ ] Tested responsiveness on mobile viewport / PWA mode.

## Screenshots (if applicable)
<!-- Add before & after screenshots or videos of the UI changes -->
