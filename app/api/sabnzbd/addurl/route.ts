import { NextRequest, NextResponse } from "next/server"
import { resolveServiceConfig, withOptionalHeaders } from "@/lib/config/service-config"
function withCors(r: NextResponse){ r.headers.set("access-control-allow-origin","*"); r.headers.set("access-control-expose-headers",["x-upstream-url-initial","x-upstream-url-final","x-upstream-method","content-type"].join(", ")); return r }
function buildUrl(cfg:any, query: URLSearchParams){ const base=String(cfg.baseUrl||"").replace(/\/+$/,""); const ub=cfg.urlBase?("/"+String(cfg.urlBase).replace(/^\/+|\/+$/g,"")):""; const u=new URL(`${base}${ub}/sabnzbd/api`); u.searchParams.set("mode","addurl"); if(cfg.apiKey && !u.searchParams.has("apikey")) u.searchParams.set("apikey", cfg.apiKey); for(const [k,v] of query.entries()) u.searchParams.set(k,v); return u }
export async function POST(req: NextRequest){
  // Accept JSON body: { url, nzbname?, category?, priority? }
  let cfg; try{ cfg=resolveServiceConfig("sabnzbd") } catch { return NextResponse.json({error:"SABnzbd is not configured"},{status:400}) }
  let body:any = {}; try { body = await req.json() } catch {}
  const urlParam = body?.url || body?.name
  if (!urlParam) return NextResponse.json({ error:"Missing url" }, { status:400 })
  const qp = new URLSearchParams()
  qp.set("name", String(urlParam))
  if (body?.nzbname) qp.set("nzbname", String(body.nzbname))
  if (body?.category) qp.set("cat", String(body.category))
  if (typeof body?.priority !== "undefined") qp.set("priority", String(body.priority))
  const upstreamUrl = buildUrl(cfg, qp)
  const initial = upstreamUrl.toString()
  // SAB supports GET with query; use POST without body to avoid CORS content-type issues
  const res = await fetch(initial, withOptionalHeaders({ method:"POST", cache:"no-store", redirect:"follow" }, cfg.headers))
  if(!res.ok){ const text=await res.text().catch(()=> ""); return withCors(NextResponse.json({ error:"Upstream request failed", status:res.status, statusText:res.statusText, upstreamInitial:initial, upstreamFinal:initial, upstreamBody: text }, { status: res.status })) }
  const out = new NextResponse(res.body, { status:res.status, statusText:res.statusText })
  const ct=res.headers.get("content-type"); if(ct) out.headers.set("content-type", ct)
  out.headers.set("x-upstream-url-initial", initial); out.headers.set("x-upstream-url-final", initial); out.headers.set("x-upstream-method","POST")
  return withCors(out)
}
