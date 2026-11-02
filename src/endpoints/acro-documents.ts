import type { Endpoint } from 'payload'

type Relation = {
  id?: string | number
  slug?: string
  series?: string
  url?: string | null
  filename?: string
  title?: string
  name?: string
  parent?: Relation | string | number | null
}

const relation = (value: unknown): Relation | null =>
  typeof value === 'object' && value !== null ? (value as Relation) : null

const getCategoryPath = (categoryValue: unknown, series: string) => {
  const segments: string[] = []
  let current = relation(categoryValue)
  let depth = 0

  while (current && depth < 12) {
    if (current.slug && current.slug !== series) segments.unshift(current.slug)
    current = relation(current.parent)
    depth += 1
  }

  return segments.join('/')
}

const getAircraftSeries = (value: unknown): string | null => {
  const aircraft = Array.isArray(value) ? relation(value[0]) : relation(value)
  return aircraft?.series ?? null
}

const getMedia = (value: unknown) => {
  const media = relation(value)
  if (!media?.url) return null
  return {
    url: media.url,
    filename: media.filename,
  }
}

export const acroDocumentEndpoints: Endpoint[] = [
  {
    path: '/acro-documents',
    method: 'get',
    handler: async (req) => {
      const url = new URL(req.url || 'https://payload.local/api/acro-documents')
      const requestedAircraft = url.searchParams.get('aircraft')
      const requestedDocument = url.searchParams.get('document')
      const requestedStatus = url.searchParams.get('status')
      const limit = Math.min(
        Math.max(Number(url.searchParams.get('limit') || 500), 1),
        1000,
      )

      const allowedStatuses = ['published', 'superseded']
      const statuses =
        requestedStatus && allowedStatuses.includes(requestedStatus)
          ? [requestedStatus]
          : allowedStatuses

      const result = await req.payload.find({
        collection: 'document-revisions',
        where: {
          and: [
            { status: { in: statuses } },
            ...(requestedDocument
              ? [{ document: { equals: requestedDocument } }]
              : []),
          ],
        },
        depth: 5,
        limit,
        sort: '-effectiveDate',
        overrideAccess: false,
        req,
      })

      const docs = result.docs.flatMap((revision) => {
        const document = relation(revision.document)
        const media = getMedia(revision.file)
        if (!document || !media) return []

        const series = getAircraftSeries(document.aircraft)
        if (!series || (requestedAircraft && requestedAircraft !== series)) return []

        const category = relation(document.category)
        const folderPath = getCategoryPath(category, series)

        return [{
          id: revision.id,
          documentId: document.id,
          title: document.title,
          documentNumber: document.documentNumber,
          revision: revision.revisionNumber,
          effectiveDate: revision.effectiveDate,
          status: revision.status,
          aircraft: series,
          folderPath,
          pdfFile: media,
          changeSummary: revision.changeSummary ?? null,
          publishedAt: revision.publishedAt ?? null,
          category: category
            ? { id: category.id, title: category.title, slug: category.slug }
            : null,
        }]
      })

      return Response.json({
        docs,
        totalDocs: docs.length,
        limit,
        status: statuses,
      })
    },
  },
]
