import type { CollectionConfig } from 'payload'

import { canManageDocuments, readPublicMedia } from '../access/documentAccess'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    create: canManageDocuments,
    delete: canManageDocuments,
    read: readPublicMedia,
    update: canManageDocuments,
  },
  admin: {
    useAsTitle: 'filename',
    defaultColumns: ['filename', 'mimeType', 'filesize', 'isPublic', 'createdAt'],
    description: 'PDF files attached to aviation document revisions.',
  },
  fields: [
    { name: 'description', type: 'textarea' },
    {
      name: 'isPublic',
      type: 'checkbox',
      defaultValue: false,
      access: { update: () => false },
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Automatically enabled when a revision is published.',
      },
    },
  ],
  upload: {
    mimeTypes: ['application/pdf'],
  },
}
