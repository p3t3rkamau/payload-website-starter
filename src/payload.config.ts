import { vercelPostgresAdapter } from '@payloadcms/db-vercel-postgres'
import path from 'path'
import sharp from 'sharp'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'

import { Aircraft } from './collections/Aircraft'
import { Categories } from './collections/Categories'
import { DocumentRevisions } from './collections/DocumentRevisions'
import { Documents } from './collections/Documents'
import { DocumentTypes } from './collections/DocumentTypes'
import { Media } from './collections/Media'
import { Organisations } from './collections/Organisations'
import { OrganisationMemberships } from './collections/OrganisationMemberships'
import { AircraftEntitlements } from './collections/AircraftEntitlements'
import { Users } from './collections/Users'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'
import { acroDocumentEndpoints } from './endpoints/acro-documents'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
  },
  editor: defaultLexical,
  db: vercelPostgresAdapter({
    pool: {
      connectionString: process.env.POSTGRES_URL || '',
    },
  }),
  collections: [
    Users,
    Organisations,
    OrganisationMemberships,
    AircraftEntitlements,
    Aircraft,
    Categories,
    DocumentTypes,
    Documents,
    DocumentRevisions,
    Media,
  ],
  cors: [getServerSideURL()].filter(Boolean),
  endpoints: [...acroDocumentEndpoints],
  plugins: [
    ...plugins,
    vercelBlobStorage({
      collections: { media: true },
      clientUploads: true,
      token: process.env.BLOB_READ_WRITE_TOKEN || '',
    }),
  ],
  secret: process.env.PAYLOAD_SECRET || '',
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        if (req.user) return true
        const secret = process.env.CRON_SECRET
        if (!secret) return false
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${secret}`
      },
    },
    tasks: [],
  },
})
