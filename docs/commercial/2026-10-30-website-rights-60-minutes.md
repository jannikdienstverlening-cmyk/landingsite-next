# Website Rights and 60 Minutes of Changes

## Human Request

On 30 October 2026 Jannik explicitly requested that customer-owned texts,
photos and supplied materials remain with the customer, while website code
and design are provided within the subscription. The request also changed
the included monthly small-change allowance from 20 to 60 minutes and
suggested an optional one-time buyout for independent continuation.

The monthly price remains EUR79 including VAT, with no building fee.
Stripe Price IDs, tax settings and existing subscriptions are not changed.

## Implementation

- config/commercial.ts is the source for the 60-minute allowance and features.
- Version 2026-10-30-website-license-60m applies to newly accepted agreements.
- Old paid orders and their accepted terms are preserved by webhook handling.
- New website rights clauses do not retrospectively replace existing rights.
- Own supplied material and domain rights do not depend on buying our code.
- Rights in third-party and open-source components stay under their licenses.
- New checkouts record the version, included minutes and rights model.
- A stale or missing browser terms version is rejected before provider calls.

## Buyout

No fixed amount was supplied or approved. Buyout is therefore by individual
written quotation, never an automatic charge. The quote must define files,
transferable rights, exclusions, independent use, migration help, delivery
and payment. Copyright transfer additionally requires a signed written deed.
No claim is made that third-party rights can be transferred.

## Legal Review and Publication

This is an implementation of the owner's requested commercial policy,
not a guarantee of legal enforceability. Have a qualified Dutch legal
professional review the final wording and any future buyout deed. A fixed
buyout price and production publication need separate human approval.
No existing customer's contract or subscription is mutated by this change.

Sources consulted on 30 October 2026:

- https://ondernemersplein.overheid.nl/wetten-en-regels/auteursrecht/
- https://www.auteursrecht.nl/auteursrecht/overdracht-en-licentie
