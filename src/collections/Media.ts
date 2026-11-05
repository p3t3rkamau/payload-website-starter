import type { CollectionConfig } from 'payload'

import { canManageDocuments, readPrivateMedia } from '../access/documentAccess'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    create: canManageDocuments,
    delete: canManageDocuments,
    read: readPrivateMedia,
    update: canManageDocuments,
  },
  admin: {
    useAsTitle: 'filename',
    defaultColumns: ['filename', 'mimeType', 'filesize', 'createdAt'],
    description: 'Private PDF files attached to aviation document revisions.',
  },
  fields: [
    {
      name: 'description',
      type: 'textarea',
    },
    {
      // Retained for backwards-compatible database schema; never enables public access.
      name: 'isPublic',
      type: 'checkbox',
      defaultValue: false,
      access: { read: () => false, update: () => false },
      admin: {
        hidden: true,
        readOnly: true,
      },
    },
  ],
  upload: {
    mimeTypes: ['application/pdf'],
  },
}
