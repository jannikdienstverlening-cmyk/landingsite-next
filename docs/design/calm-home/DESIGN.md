# Landingsite Calm Homepage

## Reference and Evidence

Reference: https://nicole-marsman-voorbeeld.vercel.app/ (inspected 29 October 2026).
Firecrawl retrieved the page text; it did not return branding or screenshots.
Playwright captured the actual 1440px full page and inspected computed styles.
The inspected screenshot is stored locally at `artifacts/calm-reference-1440.png`.

Observed: dark green text (#193d32), light background (#f2f0e6), sans-serif
headlines (font family reported as DM), Lora in selected section headings,
thin dividers, generous unframed sections and one dark closing section.
The reference uses an arched portrait and an asymmetric introductory layout.
Its desktop headline size and mobile behaviour are not copied.

## Translation for Landingsite

Use the reference's calm rhythm, not its content, photography, claims or metadata.
Retain the approved homepage heading, real project images, founder cartoon,
one subscription offer, existing checkout and all contact routes.

Implementation choices, not extracted reference values:

- Paper: #f6f7f2; secondary background: #e8eee7.
- Ink: #203f35; body text: #4e6258; divider: #cbd5cc.
- Primary action: #285b46; rust #a74325 is reserved for focus indication.
- DM Sans for body and primary headline; Lora 400 for section headings.
- Self-hosted route-scoped next/font files, with no browser requests to Google.
- Fixed headline sizes at breakpoints, no viewport-scaled type.
- Real project viewer beside the desktop introduction; stacked below on mobile.
- Stable project buttons, no automatic switching or motion added.
- Homepage-only CSS Module prevents styling leaking into checkout or other routes.

## Preservation and Verification

Commercial data continues to come from config/commercial.ts: one offer of
EUR79/month including VAT, no one-time building fee. No Stripe, subscription,
legal or privacy settings are changed by this design update.

Verify the full page at 360, 390, 768, 1024, 1440 and 1920px, including
keyboard navigation, project selection, reduced motion, no-JS rendering,
form validation, price consistency and navigation into checkout. Review
screenshots before updating affected visual baselines.
