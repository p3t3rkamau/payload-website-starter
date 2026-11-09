import type { CollectionConfig } from 'payload'
import { authenticated } from '../access/authenticated'

const isAdmin = ({ req }: { req: { user?: unknown } }) =>
  (req.user as { role?: string } | null)?.role === 'admin'

export const Organisations: CollectionConfig = {
  slug: 'organisations',
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: authenticated,
    update: isAdmin,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'code', 'status', 'updatedAt'],
    description: 'Customer organisations licensed to access AcroReader documents.',
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'code', type: 'text', required: true, unique: true, index: true },
    {
      name: 'status', type: 'select', required: true, defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Suspended', value: 'suspended' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'contactEmail', type: 'email' },
    { name: 'notes', type: 'textarea' },
  ],
  timestamps: true,
}
