// Proxy for SABnzbd API under /api/sabnzbd
// Client usage: set base to "/api/sabnzbd" and call using SAB's query shape:
//   /api/sabnzbd?mode=queue&output=json
//
// This handler injects the apikey in LOCAL mode (from env via resolver) and forwards to
// `${BASE}/sabnzbd/api`. In REMOTE mode it will attach the configured Traefik header pair.

import { NextRequest, NextResponse } from 'next/server'
import {
  resolveServiceConfig,
  buildSabApiUrl,
  appendQueryParams,
  withOptionalHeaders,
} from '@/lib/config/service-config'

function withCors(resp: NextResponse): NextResponse {
  resp.headers.set('access-control-allow-origin', '*')
  return resp
}

function buildUpstreamUrl(req: NextRequest): { url: URL; headers?: Record<string, string>; apiKey?: string } {
  const cfg = resolveServiceConfig('sabnzbd')
  const upstream = buildSabApiUrl(cfg)
  // Copy incoming query params
  appendQueryParams(upstream, req.nextUrl.searchParams)
  // Inject API key only when using LOCAL mode (server-side secret)
  if (cfg.apiKey && !upstream.searchParams.has('apikey')) {
    upstream.searchParams.set('apikey', cfg.apiKey)
  }
  // Default output=json unless explicitly overridden
  if (!upstream.searchParams.has('output')) {
    upstream.searchParams.set('output', 'json')
  }
  return { url: upstream, headers: cfg.headers, apiKey: cfg.apiKey }
}

export async function GET(req: NextRequest) {
  let built
  try {
    built = buildUpstreamUrl(req)
  } catch {
    return NextResponse.json({ error: 'SABnzbd is not configured' }, { status: 400 })
  }

  const res = await fetch(built.url.toString(), withOptionalHeaders({
    method: 'GET',
    cache: 'no-store',
    redirect: 'follow',
  }, built.headers))

  const out = new NextResponse(res.body, {
    status: res.status,
    statusText: res.statusText,
  })

  const contentType = res.headers.get('content-type')
  if (contentType) out.headers.set('content-type', contentType)

  return withCors(out)
}

export async function POST(req: NextRequest) {
  let built
  try {
    built = buildUpstreamUrl(req)
  } catch {
    return NextResponse.json({ error: 'SABnzbd is not configured' }, { status: 400 })
  }

  const res = await fetch(built.url.toString(), withOptionalHeaders({
    method: 'POST',
    body: req.body,
    cache: 'no-store',
    redirect: 'follow',
  }, built.headers))

  const out = new NextResponse(res.body, {
    status: res.status,
    statusText: res.statusText,
  })

  const contentType = res.headers.get('content-type')
  if (contentType) out.headers.set('content-type', contentType)

  return withCors(out)
}