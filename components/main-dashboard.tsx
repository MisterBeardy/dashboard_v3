"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Activity, CheckCircle, XCircle, Clock, Download, HardDrive, Tv, Settings } from 'lucide-react'
import { Button } from "@/components/ui/button" // Import Button
import { type DashboardSettingsState } from "./dashboard-settings"
import { ViewType } from "./dashboard"
import { useSABnzbd } from "@/hooks/use-sabnzbd"
import { useMemo } from "react"

interface MainDashboardProps {
  settings: DashboardSettingsState
  setCurrentView: (view: ViewType) => void
  setSelectedSettingModuleId: (id: string | null) => void
  enabledModules: Record<string, boolean>
}

function parseSizeToMB(val?: string) {
  if (!val) return null
  const m = String(val).trim().match(/^([\d.]+)\s*(GB|MB)?$/i)
  if (!m) return null
  const n = parseFloat(m[1])
  const unit = (m[2] || 'MB').toUpperCase()
  return unit === 'GB' ? n * 1024 : n
}
function formatSmartMB(mb?: number | null) {
  if (mb == null || isNaN(mb)) return '-'
  if (mb >= 1000) return `${(mb / 1024).toFixed(1)} GB`
  return `${mb.toFixed(1)} MB`
}

/* remove dev-only static queue; we will render live compact queue from SAB */

export function MainDashboard({ settings, setCurrentView, setSelectedSettingModuleId, enabledModules }: MainDashboardProps) {
  // SAB enablement
  const sabEnabled = !!enabledModules.sabnzbd

  const { queue, loading, error } = sabEnabled
    ? useSABnzbd('/api/sab', '')
    : ({ queue: null, loading: false, error: null } as any)

  const computedModuleStatus = useMemo(() => {
    const out: Array<{ name: string; id: string; icon: any; status: string; version: string; activity: string; stats: any }> = []
    if (enabledModules.sabnzbd) {
      const q = queue
      const speed = q?.speed || '-'
      const timeLeft = q?.timeLeft || (q as any)?.eta || '-'
      const remaining = formatSmartMB(parseSizeToMB(q?.remainingSize))
      const total = formatSmartMB(parseSizeToMB(q?.totalSize))
      out.push({
        name: 'SABnzbd',
        id: 'sabnzbd',
        icon: Download,
        status: error ? 'offline' : 'online',
        version: '',
        activity: speed !== '-' ? `Speed ${speed} • ${timeLeft} left` : 'Idle',
        stats: {
          queueCount: Array.isArray(q?.slots) ? q!.slots.length : 0,
          remaining, total,
          diskLeft: (q as any)?.diskSpaceLeft || '-',
        },
      })
    }
    if (enabledModules.sonarr) {
      out.push({
        name: 'Sonarr',
        id: 'sonarr',
        icon: Tv,
        status: 'online',
        version: '',
        activity: 'Library Overview',
        stats: { total: '-' },
      })
    }
    return out
  }, [enabledModules.sabnzbd, enabledModules.sonarr, queue, error])

  const compactQueue = useMemo(() => {
    const slots = (queue?.slots ?? []) as any[]
    return slots.slice(0, 8).map((s) => {
      const percent = typeof s.percentage === 'number' ? s.percentage : Number(s.percentage || 0)
      return {
        key: s.nzo_id,
        name: s.filename || s.name || '—',
        progress: Math.max(0, Math.min(100, percent)),
        speed: s.speed || queue?.speed || '0 MB/s',
        eta: s.eta || s.timeleft || '-',
      }
    })
  }, [queue])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Dashboard Overview</h2>
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="gap-1">
            <Activity className="h-3 w-3" />
            System Online
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 p-0"
            onClick={() => setCurrentView('dashboard-settings')}
            title="Dashboard Settings"
          >
            <Settings className="h-4 w-4" />
            <span className="sr-only">Dashboard Settings</span>
          </Button>
        </div>
      </div>

      {/* Module Status Cards */}
      {settings.showModuleStatus && (
        <div className="grid gap-3 md:grid-cols-1 lg:grid-cols-2">
          {computedModuleStatus.filter(m => enabledModules[m.id]).length === 0 && (
            <div className="col-span-full text-center py-4 text-muted-foreground text-sm">
              No modules enabled to display status.
            </div>
          )}
          {computedModuleStatus.filter(m => enabledModules[m.id]).map((module) => (
           <Card key={module.id} onClick={() => setCurrentView(module.id as ViewType)} className="cursor-pointer">
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3">
               <CardTitle className="text-sm font-medium">{module.name}</CardTitle>
               <div className="flex items-center gap-1">
                 <module.icon className="h-4 w-4 text-muted-foreground" />
                 <Button
                   variant="ghost"
                   size="icon"
                   className="h-7 w-7 p-0"
                   onClick={(e) => {
                     e.stopPropagation(); // Prevent card click from firing
                     setCurrentView('module-settings');
                     setSelectedSettingModuleId(module.id);
                   }}
                   title={`${module.name} Settings`}
                 >
                   <Settings className="h-4 w-4" />
                   <span className="sr-only">{`${module.name} Settings`}</span>
                 </Button>
               </div>
             </CardHeader>
             <CardContent className="pb-3 px-3">
               <div className="flex items-center gap-2 mb-1">
                 {module.status === 'online' ? (
                   <CheckCircle className="h-4 w-4 text-green-500" />
                 ) : (
                   <XCircle className="h-4 w-4 text-red-500" />
                 )}
                 <span className="text-xs text-muted-foreground">{module.version}</span>
               </div>
               <p className="text-xs text-muted-foreground mb-1">{module.activity}</p>
               <div className="text-xl font-bold">
                 {module.id === 'sabnzbd'
                   ? `${module.stats.queueCount ?? 0} in queue`
                   : module.stats.total}
               </div>
               <p className="text-xs text-muted-foreground">
                 {module.id === 'sabnzbd'
                   ? `Remaining ${module.stats.remaining} / ${module.stats.total} • Free ${module.stats.diskLeft}`
                   : ''}
               </p>
             </CardContent>
           </Card>
          ))}
        </div>
      )}

      {/* Download Queue and System Stats */}
      {(settings.showDownloadQueue || settings.showSystemResources) && (
        <div className="grid gap-3 md:grid-cols-2">
          {/* Download Queue */}
          {settings.showDownloadQueue && (
            <Card>
              <CardHeader className="pb-1 pt-3 px-3">
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Download Queue
                </CardTitle>
                <CardDescription>
                  {sabEnabled ? 'Active downloads and progress' : 'SABnzbd is not configured'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 pb-3 px-3">
                {!sabEnabled ? (
                  <div className="text-sm text-muted-foreground">Configure SABnzbd to view the live queue.</div>
                ) : (loading && !queue) ? (
                  <div className="text-sm text-muted-foreground">Loading…</div>
                ) : (compactQueue.length === 0) ? (
                  <div className="text-sm text-muted-foreground">No items in queue.</div>
                ) : (
                  compactQueue.map((row) => (
                    <div key={row.key} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium truncate">{row.name}</span>
                        <span className="text-muted-foreground">{row.progress}%</span>
                      </div>
                      <Progress value={row.progress} className="h-1.5" />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{row.speed}</span>
                        <span>{row.eta}</span>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )}

          {/* System Stats */}
          {settings.showSystemResources && (
            <Card>
              <CardHeader className="pb-1 pt-3 px-3">
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="h-5 w-5" />
                  System Resources
                </CardTitle>
                <CardDescription>
                  Storage and performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 pb-3 px-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>Disk Usage</span>
                    <span>2.4TB / 4TB</span>
                  </div>
                  <Progress value={60} className="h-1.5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>Memory Usage</span>
                    <span>12GB / 32GB</span>
                  </div>
                  <Progress value={37.5} className="h-1.5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>CPU Usage</span>
                    <span>23%</span>
                  </div>
                  <Progress value={23} className="h-1.5" />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Recent Activity (placeholder) */}
      {settings.showRecentActivity && (
        <Card>
          <CardHeader className="pb-1 pt-3 px-3">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest events across all modules
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 pb-3 px-3">
            <div className="text-sm text-muted-foreground">No activity to display.</div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
