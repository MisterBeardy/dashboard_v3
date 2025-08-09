/// Fixed template literal escaping
import { NextRequest, NextResponse } from "next/server"
import { resolveServiceConfig, buildArrApiUrl, withOptionalHeaders } from "@/lib/config/service-config"

function withCors(resp: NextResponse): NextResponse {
  resp.headers.set("access-control-allow-origin", "*")
  resp.headers.set(
    "access-control-expose-headers",
    ["x-upstream-url-initial", "x-upstream-url-final", "x-upstream-method", "content-type"].join(", ")
  )
  return resp
}

export async function DELETE(req: NextRequest) {
  // Derive the [id] from the URL to avoid relying on Next.js route context typing
  const segments = req.nextUrl.pathname.split('/').filter(Boolean)
  const id = segments[segments.length - 1]
  if (!id) return NextResponse.json({ error: "Missing queue item id" }, { status: 400 })

  let cfg: ReturnType<typeof resolveServiceConfig>, primary: URL
  try {
    cfg = resolveServiceConfig("sonarr")
    primary = buildArrApiUrl(cfg, `/queue/${encodeURIComponent(id)}`, "v3")
    if (cfg.apiKey && !primary.searchParams.has("apikey")) {
      primary.searchParams.set("apikey", cfg.apiKey)
    }
  } catch {
    return NextResponse.json({ error: "Sonarr is not configured" }, { status: 400 })
  }

  const used = primary
  const res = await fetch(
    used.toString(),
    withOptionalHeaders(
      { method: "DELETE", cache: "no-store", redirect: "follow" },
      cfg.headers
    )
  )
  const initial = primary.toString()
  const final = used.toString()

  if (!res.ok) {
    const upstreamBody = await res.text().catch(() => "")
    return withCors(
      NextResponse.json(
        {
          error: "Upstream request failed",
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

  const out = new NextResponse(res.body, { status: res.status, statusText: res.statusText })
  const ct = res.headers.get("content-type")
  if (ct) out.headers.set("content-type", ct)
  out.headers.set("x-upstream-url-initial", initial)
  out.headers.set("x-upstream-url-final", final)
  out.headers.set("x-upstream-method", "DELETE")
  return withCors(out)
}
