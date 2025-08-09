import { NextRequest, NextResponse } from "next/server"
import { resolveServiceConfig, withOptionalHeaders, appendQueryParams } from "@/lib/config/service-config"

function withCors(resp: NextResponse): NextResponse {
  resp.headers.set("access-control-allow-origin", "*")
  resp.headers.set("access-control-expose-headers", ["x-upstream-url-initial","x-upstream-url-final","x-upstream-method","content-type"].join(", "))
  return resp
}
function buildSabApiUrl(cfg: any): URL {
  const base = String(cfg.baseUrl || "").replace(/\/+$/,"")
  const ub = cfg.urlBase ? ("/" + String(cfg.urlBase).replace(/^\/+|\/+$/g,"")) : ""
  return new URL(`${base}${ub}/sabnzbd/api`)
}
export async function GET(req: NextRequest) {
  let cfg, url: URL
  try {
    cfg = resolveServiceConfig("sabnzbd")
    url = buildSabApiUrl(cfg)
    url.searchParams.set("mode", "queue")
    url.searchParams.set("output", "json")
    appendQueryParams(url, req.nextUrl.searchParams)
    if (cfg.apiKey && !url.searchParams.has("apikey")) url.searchParams.set("apikey", cfg.apiKey)
  } catch {
    return NextResponse.json({ error: "SABnzbd is not configured" }, { status: 400 })
  }
  const initial = url.toString()
  const res = await fetch(initial, withOptionalHeaders({ method: "GET", cache: "no-store", redirect: "follow" }, cfg.headers))
  if (!res.ok) {
    const body = await res.text().catch(()=> "")
    return withCors(NextResponse.json({ error: "Upstream request failed", status: res.status, statusText: res.statusText, upstreamInitial: initial, upstreamFinal: initial, upstreamBody: body }, { status: res.status }))
  }
  const out = new NextResponse(res.body, { status: res.status, statusText: res.statusText })
  const ct = res.headers.get("content-type"); if (ct) out.headers.set("content-type", ct)
  out.headers.set("x-upstream-url-initial", initial)
  out.headers.set("x-upstream-url-final", initial)
  out.headers.set("x-upstream-method","GET")
  return withCors(out)
}
