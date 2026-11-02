import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

export const Categories: CollectionConfig = {
  slug: 'categories',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'department', 'series', 'updatedAt'],
    description: 'Folder hierarchy used to organise aviation documents.',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      admin: { position: 'sidebar' },
      hooks: {
        beforeValidate: [
          ({ data, value }) => {
            if (typeof value === 'string' && value.trim()) return value
            const title = data?.title
            return typeof title === 'string'
              ? title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
              : value
          },
        ],
      },
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'categories',
      admin: {
        position: 'sidebar',
        description: 'Parent folder. Leave empty for a top-level folder such as DASH 400.',
      },
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar' },
    },
    {
      name: 'department',
      type: 'select',
      options: [
        { label: 'Flight Operations', value: 'flight-operations' },
        { label: 'Maintenance', value: 'maintenance' },
        { label: 'General', value: 'general' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'series',
      type: 'select',
      options: [
        { label: 'DASH 100', value: 'dash-100' },
        { label: 'DASH 200', value: 'dash-200' },
        { label: 'DASH 300', value: 'dash-300' },
        { label: 'DASH 400', value: 'dash-400' },
      ],
      admin: { position: 'sidebar' },
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
}
