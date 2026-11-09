import type { CollectionConfig } from 'payload'
import { authenticated } from '../access/authenticated'

const isAdmin = ({ req }: { req: { user?: unknown } }) =>
  (req.user as { role?: string } | null)?.role === 'admin'

export const AircraftEntitlements: CollectionConfig = {
  slug: 'aircraft-entitlements',
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: authenticated,
    update: isAdmin,
  },
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['organisation', 'aircraft', 'document', 'status', 'startsAt', 'endsAt'],
    description: 'An organisation license for an aircraft series, optionally restricted to one document.',
  },
  fields: [
    { name: 'organisation', type: 'relationship', relationTo: 'organisations', required: true, index: true },
    { name: 'aircraft', type: 'relationship', relationTo: 'aircraft', required: true, index: true },
    {
      name: 'document', type: 'relationship', relationTo: 'documents',
      admin: { description: 'Leave empty to license the entire aircraft series.' },
    },
    {
      name: 'status', type: 'select', required: true, defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Revoked', value: 'revoked' },
      ],
    },
    { name: 'startsAt', type: 'date', required: true },
    { name: 'endsAt', type: 'date' },
    { name: 'notes', type: 'textarea' },
  ],
  timestamps: true,
}
