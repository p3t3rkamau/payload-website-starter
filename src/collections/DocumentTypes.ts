import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'
import { anyone } from '../access/anyone'

export const DocumentTypes: CollectionConfig = {
  slug: 'document-types',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'code', 'department', 'isActive'],
    description: 'Controlled list of aviation manual and document types.',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'code',
      type: 'text',
      required: true,
      unique: true,
      admin: { description: 'Short identifier, for example QRH or AFM.' },
    },
    {
      name: 'department',
      type: 'select',
      required: true,
      options: [
        { label: 'Flight Operations', value: 'flight-operations' },
        { label: 'Maintenance', value: 'maintenance' },
        { label: 'General', value: 'general' },
      ],
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
  ],
  timestamps: true,
}
