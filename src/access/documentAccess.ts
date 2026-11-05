import type { Access } from 'payload'

type UserWithRole = {
  role?: 'admin' | 'editor' | 'reviewer'
}

const getRole = (user: unknown) => (user as UserWithRole | null)?.role

export const isAdmin: Access = ({ req }) => {
  const user = req.user as { role?: string; email?: string } | null
  return getRole(user) === 'admin' || Boolean(
    user?.email && process.env.PAYLOAD_ADMIN_EMAIL &&
    user.email.toLowerCase() === process.env.PAYLOAD_ADMIN_EMAIL.toLowerCase(),
  )
}

export const canManageDocuments: Access = ({ req }) =>
  ['admin', 'editor'].includes(getRole(req.user) || '')

export const canReviewDocuments: Access = ({ req }) =>
  ['admin', 'editor', 'reviewer'].includes(getRole(req.user) || '')

// Publishing controls catalogue visibility; it never grants anonymous access.
const isStaff = (user: unknown) =>
  ['admin', 'editor', 'reviewer'].includes(getRole(user) || '')

export const readPublishedRevisions: Access = ({ req }) => isStaff(req.user)

export const readPublishedDocuments: Access = ({ req }) => isStaff(req.user)

export const readPrivateMedia: Access = ({ req }) => isStaff(req.user)
