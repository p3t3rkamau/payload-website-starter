import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { isAdmin } from '../../access/documentAccess'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: authenticated,
    create: isAdmin,
    delete: isAdmin,
    read: authenticated,
    update: isAdmin,
  },
  admin: {
    defaultColumns: ['name', 'email', 'role'],
    useAsTitle: 'name',
  },
  auth: true,
  fields: [
    { name: 'name', type: 'text' },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      options: [
        { label: 'Administrator', value: 'admin' },
        { label: 'Document Editor', value: 'editor' },
        { label: 'Reviewer / Publisher', value: 'reviewer' },
      ],
      access: { update: isAdmin },
      admin: {
        position: 'sidebar',
        description: 'Controls access to document uploads, review and publishing.',
      },
    },
  ],
  timestamps: true,
  versions: false,
}
