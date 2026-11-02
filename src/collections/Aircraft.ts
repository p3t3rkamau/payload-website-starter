import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'
import { anyone } from '../access/anyone'

export const Aircraft: CollectionConfig = {
  slug: 'aircraft',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'series', 'model', 'isActive'],
    description: 'Aircraft families and models supported by the document library.',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'series',
      type: 'select',
      required: true,
      options: [
        { label: 'DASH 100', value: 'dash-100' },
        { label: 'DASH 200', value: 'dash-200' },
        { label: 'DASH 300', value: 'dash-300' },
        { label: 'DASH 400', value: 'dash-400' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'model',
      type: 'text',
      required: true,
      admin: { description: 'Example: Q400, 8-100, 8-200.' },
    },
    {
      name: 'manufacturer',
      type: 'text',
      defaultValue: 'De Havilland Canada',
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
