import type { Access } from 'payload'

type UserWithRole = {
  role?: 'admin' | 'editor' | 'reviewer'
}

const getRole = (user: unknown) => (user as UserWithRole | null)?.role

export const isAdmin: Access = ({ req }) => getRole(req.user) === 'admin'

export const canManageDocuments: Access = ({ req }) =>
  ['admin', 'editor'].includes(getRole(req.user) || '')

export const canReviewDocuments: Access = ({ req }) =>
  ['admin', 'editor', 'reviewer'].includes(getRole(req.user) || '')

export const readPublishedRevisions: Access = ({ req }) => {
  if (req.user) return true
  return { status: { in: ['published', 'superseded'] } }
}

export const readPublishedDocuments: Access = ({ req }) => {
  if (req.user) return true
  return { status: { equals: 'active' } }
}

export const readPublicMedia: Access = ({ req }) => {
  if (req.user) return true
  return { isPublic: { equals: true } }
}
