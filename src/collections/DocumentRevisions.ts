import type {
  CollectionAfterChangeHook,
  CollectionBeforeChangeHook,
  CollectionConfig,
} from 'payload'

import {
  canManageDocuments,
  canReviewDocuments,
  readPublishedRevisions,
} from '../access/documentAccess'

const preventPublishedRevisionEdits: CollectionBeforeChangeHook = ({
  data,
  operation,
  originalDoc,
  req,
}) => {
  if (operation === 'create') {
    if (data?.status === 'published' || data?.status === 'superseded') {
      throw new Error('New revisions must be created as Draft or In Review.')
    }
    return data
  }

  const previousStatus = originalDoc?.status
  const nextStatus = data?.status ?? previousStatus
  const role = (req.user as { role?: string } | null)?.role

  if (nextStatus === 'published' && !['admin', 'reviewer'].includes(role || '')) {
    throw new Error('Only an administrator or reviewer can publish a revision.')
  }

  if (nextStatus === 'superseded' && !['admin', 'reviewer'].includes(role || '')) {
    throw new Error('Only an administrator or reviewer can supersede a revision.')
  }

  if (previousStatus === 'published' || previousStatus === 'superseded') {
    const onlySuperseding =
      previousStatus === 'published' &&
      nextStatus === 'superseded' &&
      Object.keys(data || {}).every((key) => key === 'status')

    if (!onlySuperseding) {
      throw new Error('Published revision files and metadata are locked. Create a new revision instead.')
    }
  }

  return data
}

const publishRevision: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req,
}) => {
  if (doc.status !== 'published' || previousDoc?.status === 'published') {
    return doc
  }

  const fileID =
    typeof doc.file === 'object' && doc.file !== null ? doc.file.id : doc.file
  const documentID =
    typeof doc.document === 'object' && doc.document !== null
      ? doc.document.id
      : doc.document

  if (!fileID || !documentID) {
    throw new Error('A published revision must have a linked PDF and document.')
  }

  const parent = await req.payload.findByID({
    collection: 'documents',
    id: documentID,
    depth: 0,
    overrideAccess: true,
  })

  const oldRevisionID =
    typeof parent.currentRevision === 'object' && parent.currentRevision !== null
      ? parent.currentRevision.id
      : parent.currentRevision

  await req.payload.update({
    collection: 'documents',
    id: documentID,
    data: { currentRevision: doc.id },
    overrideAccess: true,
  })

  if (oldRevisionID && oldRevisionID !== doc.id) {
    await req.payload.update({
      collection: 'document-revisions',
      id: oldRevisionID,
      data: { status: 'superseded' },
      overrideAccess: true,
    })
  }

  return doc
}

export const DocumentRevisions: CollectionConfig = {
  slug: 'document-revisions',
  access: {
    create: canManageDocuments,
    delete: ({ req }) => (req.user as { role?: string } | null)?.role === 'admin',
    read: readPublishedRevisions,
    update: canReviewDocuments,
  },
  admin: {
    useAsTitle: 'revisionNumber',
    defaultColumns: ['document', 'revisionNumber', 'effectiveDate', 'status', 'publishedAt'],
    description: 'Immutable history of uploaded PDF revisions.',
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
    { name: 'changeSummary', type: 'textarea' },
    {
      name: 'publishedAt',
      type: 'date',
      admin: { position: 'sidebar', readOnly: true },
      access: { update: () => false },
    },
    {
      name: 'uploadedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: { position: 'sidebar', readOnly: true },
      access: { update: () => false },
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
      preventPublishedRevisionEdits,
    ],
    afterChange: [publishRevision],
  },
  timestamps: true,
}
