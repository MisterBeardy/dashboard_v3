import { NextRequest, NextResponse } from 'next/server'
import {
  resolveServiceConfig,
  buildArrApiUrl,
  withOptionalHeaders,
  appendQueryParams,
} from '@/lib/config/service-config'

function withCors(resp: NextResponse): NextResponse {
  resp.headers.set('access-control-allow-origin', '*')
  resp.headers.set(
    'access-control-expose-headers',
    [
      'x-upstream-url-initial',
      'x-upstream-url-final',
      'x-upstream-method',
      'content-type',
    ].join(', ')
  )
  return resp
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let cfg
  let primary: URL
  const { id } = await params

  try {
    cfg = resolveServiceConfig('prowlarr')
    primary = buildArrApiUrl(cfg, `/downloadclient/${id}/test`, 'v1')
    if (cfg.apiKey && !primary.searchParams.has('apikey')) {
      primary.searchParams.set('apikey', cfg.apiKey)
    }
  } catch {
    return NextResponse.json({ error: 'Prowlarr is not configured' }, { status: 400 })
  }

  const body = await req.text()
  const headers = withOptionalHeaders(
    { 
      method: 'POST', 
      cache: 'no-store', 
      redirect: 'follow',
      headers: {
        'Content-Type': 'application/json'
      }
    },
    cfg.headers
  )
  
  const request = new Request(primary.toString(), {
    ...headers,
    body: body
  })
  const res = await fetch(request)

  const initial = primary.toString()
  const final = primary.toString()

  if (!res.ok) {
    const upstreamBody = await res.text().catch(() => '')
    const outJson = NextResponse.json({
      error: 'Upstream request failed',
      status: res.status,
      statusText: res.statusText,
      upstreamInitial: initial,
      upstreamFinal: final,
      upstreamBody,
    }, { status: res.status })
    return withCors(outJson)
  }

  const out = new NextResponse(res.body, {
    status: res.status,
    statusText: res.statusText,
  })
  const contentType = res.headers.get('content-type')
  if (contentType) out.headers.set('content-type', contentType)
  out.headers.set('x-upstream-url-initial', initial)
  out.headers.set('x-upstream-url-final', final)
  out.headers.set('x-upstream-method', 'POST')

  return withCors(out)
}