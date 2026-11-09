import type { PayloadRequest } from 'payload'

type ID = string | number
type Relation = ID | { id?: ID; status?: string } | null | undefined

const relationID = (value: Relation): ID | null =>
  typeof value === 'object' && value !== null ? value.id ?? null : value ?? null

const isWithinDates = (startsAt?: string | null, endsAt?: string | null) => {
  const now = Date.now()
  if (startsAt && new Date(startsAt).getTime() > now) return false
  if (endsAt && new Date(endsAt).getTime() < now) return false
  return true
}

/**
 * Authoritative server-side entitlement check.
 * Call this before returning any document metadata or bytes.
 * Never accept organisation IDs or entitlement claims from browser input.
 */
export async function canUserAccessAircraftDocument(
  req: PayloadRequest,
  documentID: ID,
  aircraftID: ID,
): Promise<boolean> {
  const user = req.user as { id?: ID; accountStatus?: string; role?: string } | null
  if (!user?.id || user.accountStatus !== 'active') return false

  // Global administrators may inspect documents for support, but their account
  // must still be active. All other roles need a current organisation membership.
  if (user.role === 'admin') return true

  const memberships = await req.payload.find({
    collection: 'organisation-memberships',
    where: {
      and: [
        { user: { equals: user.id } },
        { status: { equals: 'active' } },
      ],
    },
    depth: 0,
    limit: 100,
    overrideAccess: true,
    req,
  })

  for (const membership of memberships.docs) {
    if (!isWithinDates(membership.startsAt, membership.endsAt)) continue
    const organisationID = relationID(membership.organisation as Relation)
    if (!organisationID) continue

    const organisation = await req.payload.findByID({
      collection: 'organisations',
      id: organisationID,
      depth: 0,
      overrideAccess: true,
      req,
    }).catch(() => null)

    if (!organisation || organisation.status !== 'active') continue

    const entitlements = await req.payload.find({
      collection: 'aircraft-entitlements',
      where: {
        and: [
          { organisation: { equals: organisationID } },
          { aircraft: { equals: aircraftID } },
          { status: { equals: 'active' } },
          {
            or: [
              { document: { exists: false } },
              { document: { equals: documentID } },
            ],
          },
        ],
      },
      depth: 0,
      limit: 100,
      overrideAccess: true,
      req,
    })

    if (entitlements.docs.some((entitlement) =>
      isWithinDates(entitlement.startsAt, entitlement.endsAt),
    )) return true
  }

  return false
}
