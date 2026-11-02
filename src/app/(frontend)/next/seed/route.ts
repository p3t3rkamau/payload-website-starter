import { createPayloadRequest, getPayload } from 'payload'
import { seed } from '@/endpoints/seed'
import config from '@payload-config'
import { headers } from 'next/headers'

export const maxDuration = 60

export async function POST(): Promise<Response> {
  const payload = await getPayload({ config })
  const requestHeaders = await headers()

  // Payload 3.82 creates its request from the Next.js Request object.
  const request = new Request('http://localhost/api/seed', {
    headers: requestHeaders,
  })
  const payloadReq = await createPayloadRequest({ config, request })
  const user = payloadReq.user

  if (!user) {
    return new Response('Action forbidden.', { status: 403 })
  }

  try {
    await seed({ payload, req: payloadReq })
    return Response.json({ success: true })
  } catch (e) {
    payload.logger.error({ err: e, message: 'Error seeding data' })
    return new Response('Error seeding data.', { status: 500 })
  }
}
