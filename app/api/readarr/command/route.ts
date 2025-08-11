import { NextRequest, NextResponse } from 'next/server'
import {
  resolveServiceConfig,
  buildArrApiUrl,
  withOptionalHeaders,
} from '@/lib/config/service-config'

function withCors(resp: NextResponse): NextResponse {
  resp.headers.set('access-control-allow-origin', '*')
  resp.headers.set(
    'access-control-expose-headers',
    ['x-upstream-url-initial', 'x-upstream-url-final', 'x-upstream-method', 'content-type'].join(', ')
  )
  return resp
}

export async function GET(req: NextRequest) {
  let cfg
  let primary: URL
  try {
    cfg = resolveServiceConfig('readarr')
    primary = buildArrApiUrl(cfg, '/command', 'v1')
    // forward client query params
    for (const [key, value] of req.nextUrl.searchParams) {
      primary.searchParams.set(key, value)
    }
    if (cfg.apiKey && !primary.searchParams.has('apikey')) {
      primary.searchParams.set('apikey', cfg.apiKey)
    }
  } catch {
    return NextResponse.json({ error: 'Readarr is not configured' }, { status: 400 })
  }

  const used = primary
  const res = await fetch(
    used.toString(),
    withOptionalHeaders(
      { method: 'GET', cache: 'no-store', redirect: 'follow' },
      cfg.headers
    )
  )

  const initial = primary.toString()
  const final = used.toString()

  if (!res.ok) {
    const upstreamBody = await res.text().catch(() => '')
    return withCors(
      NextResponse.json(
        {
          error: 'Upstream request failed',
          status: res.status,
          statusText: res.statusText,
          upstreamInitial: initial,
          upstreamFinal: final,
          upstreamBody,
        },
        { status: res.status }
      )
    )
  }

  const out = new NextResponse(res.body, {
    status: res.status,
    statusText: res.statusText,
  })
  const ct = res.headers.get('content-type')
  if (ct) out.headers.set('content-type', ct)
  out.headers.set('x-upstream-url-initial', initial)
  out.headers.set('x-upstream-url-final', final)
  out.headers.set('x-upstream-method', 'GET')

  return withCors(out)
}

export async function POST(req: NextRequest) {
  let cfg
  let primary: URL
  try {
    cfg = resolveServiceConfig('readarr')
    primary = buildArrApiUrl(cfg, '/command', 'v1')
    if (cfg.apiKey && !primary.searchParams.has('apikey')) {
      primary.searchParams.set('apikey', cfg.apiKey)
    }
  } catch {
    return NextResponse.json({ error: 'Readarr is not configured' }, { status: 400 })
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
    return withCors(
      NextResponse.json(
        {
          error: 'Upstream request failed',
          status: res.status,
          statusText: res.statusText,
          upstreamInitial: initial,
          upstreamFinal: final,
          upstreamBody,
        },
        { status: res.status }
      )
    )
  }

  const out = new NextResponse(res.body, {
    status: res.status,
    statusText: res.statusText,
  })
  const ct = res.headers.get('content-type')
  if (ct) out.headers.set('content-type', ct)
  out.headers.set('x-upstream-url-initial', initial)
  out.headers.set('x-upstream-url-final', final)
  out.headers.set('x-upstream-method', 'POST')

  return withCors(out)
}