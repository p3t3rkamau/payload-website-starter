import type { CollectionConfig } from 'payload'
import { authenticated } from '../access/authenticated'

const isAdmin = ({ req }: { req: { user?: unknown } }) =>
  (req.user as { role?: string } | null)?.role === 'admin'

export const OrganisationMemberships: CollectionConfig = {
  slug: 'organisation-memberships',
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: authenticated,
    update: isAdmin,
  },
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['user', 'organisation', 'role', 'status'],
    description: 'Links a login account to a customer organisation.',
  },
  fields: [
    { name: 'user', type: 'relationship', relationTo: 'users', required: true, index: true },
    { name: 'organisation', type: 'relationship', relationTo: 'organisations', required: true, index: true },
    {
      name: 'role', type: 'select', required: true, defaultValue: 'member',
      options: [
        { label: 'Organisation Admin', value: 'org-admin' },
        { label: 'Member', value: 'member' },
      ],
    },
    {
      name: 'status', type: 'select', required: true, defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Suspended', value: 'suspended' },
      ],
    },
    { name: 'startsAt', type: 'date' },
    { name: 'endsAt', type: 'date' },
  ],
  timestamps: true,
}
