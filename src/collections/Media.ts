import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

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
    description: 'PDF files for aviation document revisions, plus images used by the website.',
  },
  fields: [
    // Used by the website frontend (blocks, heros, SEO images)
    { name: 'alt', type: 'text' },
    {
      name: 'caption',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
    },
    // Used by the AcroReader PDF workflow
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
    // PDFs for AcroReader, images for the website
    mimeTypes: ['application/pdf', 'image/*'],
    adminThumbnail: 'thumbnail',
    imageSizes: [
      { name: 'thumbnail', width: 300 },
      { name: 'square', width: 500, height: 500 },
      { name: 'small', width: 600 },
      { name: 'medium', width: 900 },
      { name: 'large', width: 1400 },
      { name: 'xlarge', width: 1920 },
      { name: 'og', width: 1200, height: 630, position: 'centre' },
    ],
    focalPoint: true,
  },
}
