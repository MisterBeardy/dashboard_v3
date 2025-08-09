import { NextRequest, NextResponse } from "next/server"
import { resolveServiceConfig, withOptionalHeaders } from "@/lib/config/service-config"
function withCors(r: NextResponse){ r.headers.set("access-control-allow-origin","*"); r.headers.set("access-control-expose-headers",["x-upstream-url-initial","x-upstream-url-final","x-upstream-method","content-type"].join(", ")); return r }
function buildUrl(cfg:any){ const base=String(cfg.baseUrl||"").replace(/\/+$/,""); const ub=cfg.urlBase?("/"+String(cfg.urlBase).replace(/^\/+|\/+$/g,"")):""; const u=new URL(`${base}${ub}/sabnzbd/api`); u.searchParams.set("mode","resume"); if(cfg.apiKey && !u.searchParams.has("apikey")) u.searchParams.set("apikey", cfg.apiKey); return u }
export async function POST(_req: NextRequest){
  let cfg,url:URL; try{ cfg=resolveServiceConfig("sabnzbd"); url=buildUrl(cfg)}catch{ return NextResponse.json({error:"SABnzbd is not configured"},{status:400}) }
  const initial = url.toString()
  const res = await fetch(initial, withOptionalHeaders({ method:"POST", cache:"no-store", redirect:"follow" }, cfg.headers))
  if (!res.ok){ const body=await res.text().catch(()=> ""); return withCors(NextResponse.json({ error:"Upstream request failed", status:res.status, statusText:res.statusText, upstreamInitial:initial, upstreamFinal:initial, upstreamBody: body }, { status: res.status })) }
  const out = new NextResponse(res.body, { status: res.status, statusText: res.statusText })
  const ct=res.headers.get("content-type"); if(ct) out.headers.set("content-type", ct)
  out.headers.set("x-upstream-url-initial", initial); out.headers.set("x-upstream-url-final", initial); out.headers.set("x-upstream-method","POST")
  return withCors(out)
}
