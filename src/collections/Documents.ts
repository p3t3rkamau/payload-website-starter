import type { CollectionConfig } from 'payload'

import {
  canManageDocuments,
  canReviewDocuments,
} from '../access/documentAccess'

export const Documents: CollectionConfig = {
  slug: 'documents',
  access: {
    create: canManageDocuments,
    delete: canManageDocuments,
    read: canReviewDocuments,
    update: canManageDocuments,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'documentNumber', 'documentType', 'status', 'updatedAt'],
    description: 'A permanent manual/document record. Each uploaded revision is stored separately.',
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'documentNumber',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'aircraft',
      type: 'relationship',
      relationTo: 'aircraft',
      hasMany: true,
      required: true,
    },
    { name: 'category', type: 'relationship', relationTo: 'categories', required: true },
    { name: 'documentType', type: 'relationship', relationTo: 'document-types', required: true },
    { name: 'description', type: 'textarea' },
    {
      name: 'currentRevision',
      type: 'relationship',
      relationTo: 'document-revisions',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Updated automatically when a revision is published.',
      },
      access: { update: () => false },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Archived', value: 'archived' },
      ],
      admin: { position: 'sidebar' },
    },
  ],
  timestamps: true,
}
