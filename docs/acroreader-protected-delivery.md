# AcroReader protected document delivery — implementation notes

This branch introduces the first part of the access-control model. It is intentionally not a production-ready PDF delivery release yet.

## Added

- `organisations`: customer organisation records with active/suspended status.
- `organisation-memberships`: user-to-organisation membership with active/suspended status and optional start/end dates.
- `aircraft-entitlements`: organisation license for an aircraft series, optionally restricted to one document, with active/revoked status and date window.
- `users.accountStatus`: active/suspended account state.
- `src/access/acroDocumentEntitlement.ts`: server-side entitlement checker. It derives organisations from the authenticated user's membership records; it never trusts organisation IDs supplied by a browser.
- Publishing a revision no longer flips its media record to `isPublic: true`.

## Important: not yet safe to deliver PDFs

The current Vercel Blob store was created as a public store, and the current Payload Vercel Blob adapter is configured for client uploads. A public Blob URL remains accessible to anyone who has it, even if Payload's API access rules are tightened.

Vercel private storage is a store-level setting and an existing public store cannot be converted in place. Before enabling PDF delivery:

1. Create a **new private Vercel Blob store** and connect it to a staging environment.
2. Upgrade the Payload Vercel Blob adapter and the `@vercel/blob` SDK together to versions compatible with private Blob reads/writes. Verify how the adapter writes the private access mode; do not assume the current adapter automatically does so.
3. Implement a migration utility that copies each existing PDF from the old public store to the new private store, verifies byte size and checksum, updates the media record's stored pathname/URL, and only then removes old public objects.
4. Ensure the private read route uses `get(pathname, { access: 'private' })` server-side and never returns the Blob URL or token.
5. Forward PDF.js byte-range requests and response headers correctly (`Range`, `206`, `Content-Range`, `Accept-Ranges`, `Content-Length`, `Content-Type`, `ETag`). If the installed Blob SDK's private `get()` does not expose a range option, implement range handling using a documented supported mechanism; do not buffer the whole manual into memory.
6. Authenticate the Payload session, verify `accountStatus`, active organisation membership, active organisation, entitlement dates, aircraft series, document restriction, and revision status before streaming bytes.
7. Test unauthorized access, suspended accounts/memberships, expired/revoked entitlements, copied URLs, PDF.js range loading, and large files in staging.

## Database and type generation

These collection changes require a new Payload migration and regenerated `src/payload-types.ts`. Neither has been generated or run here. Do not run a migration against production until:
- the existing Neon backup is verified,
- the generated migration is reviewed against the existing production schema,
- the migration has been tested on the Neon test branch,
- and a rollback/restore plan is documented.

The generated type file is intentionally not hand-edited. Run `pnpm payload generate:types` and the migration generator in a controlled local/staging environment after reviewing the schema changes.

## Frontend integration

The AcroReader frontend must send its authenticated Payload session when requesting the catalogue and document stream. The frontend must not construct a PDF URL from the media record. Document opening should use a same-origin authenticated API path that maps to a document/revision ID.
