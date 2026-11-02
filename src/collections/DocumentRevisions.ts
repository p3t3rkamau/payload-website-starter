import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'
import { anyone } from '../access/anyone'

export const DocumentRevisions: CollectionConfig = {
  slug: 'document-revisions',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'revisionNumber',
    defaultColumns: ['document', 'revisionNumber', 'effectiveDate', 'status', 'publishedAt'],
    description: 'Immutable history of uploaded PDF revisions for each document.',
  },
  fields: [
    {
      name: 'document',
      type: 'relationship',
      relationTo: 'documents',
      required: true,
      index: true,
    },
    {
      name: 'revisionNumber',
      type: 'text',
      required: true,
      admin: { description: 'Use the exact revision label printed in the manual, e.g. 12, 12A, or Rev 5.' },
    },
    {
      name: 'effectiveDate',
      type: 'date',
      required: true,
      admin: { date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMM yyyy' } },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'In Review', value: 'review' },
        { label: 'Published', value: 'published' },
        { label: 'Superseded', value: 'superseded' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'file',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'changeSummary',
      type: 'textarea',
      admin: { description: 'Summarise what changed in this revision.' },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'uploadedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'supersedes',
      type: 'relationship',
      relationTo: 'document-revisions',
      admin: { description: 'The earlier revision this record replaces.' },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, operation, req }) => {
        if (operation === 'create' && req.user && !data?.uploadedBy) {
          data = { ...data, uploadedBy: req.user.id }
        }

        if (data?.status === 'published' && !data?.publishedAt) {
          data = { ...data, publishedAt: new Date().toISOString() }
        }

        return data
      },
    ],
  },
  timestamps: true,
}
