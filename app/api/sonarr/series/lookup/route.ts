// Proxy for Sonarr series lookup (v3): /api/sonarr/series/lookup?term=...
import { NextRequest, NextResponse } from 'next/server'
import {
  resolveServiceConfig,
  buildArrApiUrl,
  appendQueryParams,
  withOptionalHeaders,
} from '@/lib/config/service-config'

export async function GET(req: NextRequest) {
  let cfg
  let url: URL

  try {
    cfg = resolveServiceConfig('sonarr')
    // Upstream: /api/v3/series/lookup
    url = buildArrApiUrl(cfg, '/series/lookup', 'v3')
    // forward query params, e.g. ?term=Star
    appendQueryParams(url, req.nextUrl.searchParams)
    // inject apikey for LOCAL mode
    if (cfg.apiKey && !url.searchParams.has('apikey')) {
      url.searchParams.set('apikey', cfg.apiKey)
    }
  } catch {
    return NextResponse.json({ error: 'Sonarr is not configured' }, { status: 400 })
  }

  const res = await fetch(url.toString(), withOptionalHeaders({
    method: 'GET',
    cache: 'no-store',
    redirect: 'follow',
  }, cfg.headers))

  const out = new NextResponse(res.body, {
    status: res.status,
    statusText: res.statusText,
  })
  const contentType = res.headers.get('content-type')
  if (contentType) out.headers.set('content-type', contentType)
  out.headers.set('x-upstream-url', url.toString())
  out.headers.set('x-upstream-method', 'GET')

  return out
}