"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Pause, Play, Trash2, Settings, History, BarChart3, Server, FolderOpen, Clock, HardDrive, Zap, CheckCircle, XCircle, MoreHorizontal } from 'lucide-react'
import { useMemo, useEffect, useState, useCallback } from "react"
import { ModuleLogViewer } from "./module-log-viewer"
import { useSABnzbd } from "@/hooks/use-sabnzbd"

interface SABnzbdDashboardProps {
  displayMode?: 'table' | 'poster'
}

// Dev-only sample helpers
const isDev = process.env.NODE_ENV !== 'production'
const devSample = {
  queue: {
    status: 'Downloading',
    speed: '12.4 MB/s',
    timeLeft: '1h 23m',
    totalSize: '15.2 GB',
    remainingSize: '8.7 GB',
    diskSpaceTotal: '4 TB',
    diskSpaceLeft: '1.2 TB',
    slots: [
      {
        nzo_id: '1',
        filename: 'The.Last.of.Us.S01E08.1080p.WEB.H264-CAKES',
        size: '2.1 GB',
        sizeleft: '0.3 GB',
        percentage: 85,
        status: 'Downloading',
        priority: 'Normal',
        category: 'tv',
        eta: '2m 15s',
        speed: '8.2 MB/s'
      }
    ]
  },
  history: [
    {
      nzo_id: '101',
      name: 'Breaking.Bad.S05E14.1080p.BluRay.x264',
      size: '1.8 GB',
      status: 'Completed',
      completed: '2024-01-15 14:30:25',
      category: 'tv',
      downloadTime: '12m 45s',
      postProcessing: 'Success'
    }
  ],
  logs: [
    {
      id: 1001,
      timestamp: '2024-01-15 14:25:10',
      module: 'sabnzbd',
      level: 'info',
      message: 'Dev mode: sample log entry',
      details: 'Replace with live logs once connected'
    }
  ],
  serverStats: { totalConnections: 0, maxConnections: 0, servers: [] as any[] },
  stats: {
    downloadsByStatus: {},
    downloadsByCategory: {},
    dailyDownloadTrend: [] as any[],
    totalDownloaded: '-',
    averageSpeed: '-',
    peakSpeed: '-',
    successRate: '-',
    downloadsToday: '-',
    downloadsThisWeek: '-',
    downloadsThisMonth: '-',
  }
}

export function SABnzbdDashboard({ displayMode = 'table' }: SABnzbdDashboardProps) {
  const sabEnabled = true

  // Track selected tab and persist between reloads
  const [selectedTab, setSelectedTab] = useState<string>(() => {
    if (typeof window === 'undefined') return 'queue'
    return localStorage.getItem('sab_tabs_selected') || 'queue'
  })

 // Only instantiate the hook when configured, otherwise return empty states (dev-only fallbacks still handled below)
 const {
   queue,
   history,
   serverStats,
   categories,
   actions,
   loading,
   error,
   fetchHistory,
   fetchServerStats,
   getQueueDetails,
   fetchQueue,
 } = sabEnabled
   ? useSABnzbd('/api/sab', '')
   : {
       queue: null,
       history: null,
       serverStats: null,
       categories: [],
       actions: {
         pause: async () => {},
         resume: async () => {},
         deleteItem: async (_: string) => {},
         pauseItem: async (_: string) => {},
         resumeItem: async (_: string) => {},
         setCategory: async (_: string, __: string) => {},
         setPriority: async (_: string, __: string) => {},
         moveItem: async (_: string, __: number) => {},
         addUrl: async (_url: string, _name?: string, _cat?: string, _priority?: string) => {},
         addNzb: async (_data: string, _name?: string, _cat?: string, _priority?: string) => {},
       },
       loading: false,
       error: null as any,
       fetchHistory: async () => {},
       fetchServerStats: async () => {},
       fetchQueue: async () => {},
     } as any

  // In dev, only show sample data when SAB is not configured. If configured, never show samples.
  const effectiveQueue = useMemo(() => {
    if (queue && queue.slots?.length) return queue
    if (isDev && !sabEnabled) return devSample.queue as any
    return { ...(queue as any), slots: [] }
  }, [queue, sabEnabled])

  const effectiveHistory = useMemo(() => {
    if (history?.slots?.length) return history.slots as any[]
    if (isDev && !sabEnabled) return devSample.history as any[]
    return []
  }, [history, sabEnabled])

  const effectiveLogs = useMemo(() => {
    return isDev && !sabEnabled ? devSample.logs : []
  }, [sabEnabled])

  // On tab change, trigger the appropriate fetchers (lazy-load)
  useEffect(() => {
    if (!sabEnabled) return
    if (selectedTab === 'history' && !history) {
      fetchHistory()
    }
    if (selectedTab === 'servers' && !serverStats) {
      fetchServerStats()
    }
  }, [selectedTab, sabEnabled, history, serverStats, fetchHistory, fetchServerStats])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Downloading': return 'default'
      case 'Completed': return 'default'
      case 'Failed': return 'destructive'
      case 'Queued': return 'secondary'
      case 'Paused': return 'outline'
      default: return 'outline'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-500'
      case 'Normal': return 'text-blue-500'
      case 'Low': return 'text-gray-500'
      default: return 'text-blue-500'
    }
  }

  // Local filter state for full queue output (auto-applied)
  const [filterCat, setFilterCat] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [filterSearch, setFilterSearch] = useState<string>('')

  // Add URL / Upload NZB lightweight state
  const [nzbUrl, setNzbUrl] = useState<string>('')
  const [nzbFile, setNzbFile] = useState<File | null>(null)
  const [adding, setAdding] = useState<boolean>(false)

  // Derived displayed queue: unfiltered header tiles come from queue, but list respects filters via full queue output
  const [filteredSlots, setFilteredSlots] = useState<any[] | null>(null)

  // Helper: optimistic update for a queue item across the currently rendered list
  const applyOptimisticToItem = useCallback((nzoId: string, patch: Partial<any>) => {
    setFilteredSlots((prev) => {
      if (!prev) return prev
      return prev.map((s) => (s.nzo_id === nzoId ? { ...s, ...patch } : s))
    })
    // When filteredSlots is null, the UI is using effectiveQueue.slots (from hook polling).
    // We cannot mutate effectiveQueue directly here; rely on subsequent fetchQueue or re-fetch of filters.
  }, [])

  // Auto-apply filters by calling full queue output when filters change and SAB is enabled
  useEffect(() => {
    let mounted = true
    async function load() {
      if (!sabEnabled) {
        setFilteredSlots(null)
        return
      }
      const opts: any = {}
      if (filterCat && filterCat !== 'all') opts.cat = filterCat
      if (filterPriority && filterPriority !== 'all') opts.priority = filterPriority
      if (filterSearch) opts.search = filterSearch
      try {
        if (typeof getQueueDetails === 'function') {
          const res = await getQueueDetails(0, 50, opts)
          if (!mounted) return
          setFilteredSlots(Array.isArray(res?.slots) ? res.slots : null)
        } else {
          setFilteredSlots(null)
        }
      } catch {
        // ignore transient errors, keep last good filteredSlots
      }
    }
    load()
    return () => { mounted = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterCat, filterPriority, filterSearch, sabEnabled])

  // Show filteredSlots if present, else fall back to queue slots
  const currentQueue = (filteredSlots ?? effectiveQueue?.slots) || []

  // Move early returns AFTER all hooks
  if (loading && !queue) {
    return <div>Loading SABnzbd data...</div>
  }

  if (error && !isDev) {
    return <div className="text-red-500">Error: {error}</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">SABnzbd</h2>
          <p className="text-muted-foreground">Download Manager</p>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={() => actions.pause()}>
            <Pause className="h-4 w-4 mr-1" />
            Pause All
          </Button>
          <Button variant="outline" size="sm" onClick={() => actions.resume()}>
            <Play className="h-4 w-4 mr-1" />
            Resume All
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-1" />
            Settings
          </Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3">
            <CardTitle className="text-sm font-medium">Download Speed</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-3 px-3">
            <div className="text-xl font-bold">{queue?.speed || (isDev ? devSample.queue.speed : '-')}</div>
            <p className="text-xs text-muted-foreground">
              {queue?.timeLeft || (isDev ? devSample.queue.timeLeft : '-')} remaining
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3">
            <CardTitle className="text-sm font-medium">Queue Size</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-3 px-3">
            <div className="text-xl font-bold">{currentQueue.length}</div>
            <p className="text-xs text-muted-foreground">
              {(() => {
                // Format remaining/total as MB unless >= 1000 MB, then GB
                const parseSize = (val?: string) => {
                  if (!val) return null
                  // Accept formats like "135.4 GB" or "197052.24 MB" or "197052.24"
                  const m = String(val).trim().match(/^([\d.]+)\s*(GB|MB)?$/i)
                  if (!m) return null
                  const n = parseFloat(m[1])
                  const unit = (m[2] || 'MB').toUpperCase()
                  const mb = unit === 'GB' ? n * 1024 : n
                  return mb
                }
                const formatSmart = (mb?: number | null) => {
                  if (mb == null || isNaN(mb)) return '-'
                  if (mb >= 1000) return `${(mb / 1024).toFixed(1)} GB`
                  return `${mb.toFixed(1)} MB`
                }
                const remainingMb = parseSize(queue?.remainingSize || (isDev ? devSample.queue.remainingSize : ''))
                const totalMb = parseSize(queue?.totalSize || (isDev ? devSample.queue.totalSize : ''))
                return `${formatSmart(remainingMb)} / ${formatSmart(totalMb)}`
              })()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3">
            <CardTitle className="text-sm font-medium">Disk Space</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-3 px-3">
            <div className="text-xl font-bold">{(queue as any)?.diskSpaceLeft || (isDev ? devSample.queue.diskSpaceLeft : '-')}</div>
            <p className="text-xs text-muted-foreground">
              of {(queue as any)?.diskSpaceTotal || (isDev ? devSample.queue.diskSpaceTotal : '-')} free
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3">
            <CardTitle className="text-sm font-medium">Connections</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-3 px-3">
            <div className="text-xl font-bold">{isDev ? 0 : 0}</div>
            <p className="text-xs text-muted-foreground">of {isDev ? 0 : 0} max</p>
          </CardContent>
        </Card>
      </div>

      {/* Persist selected tab in localStorage to prevent jumps on refresh/auto-poll and fire API loads */}
      <Tabs
        value={selectedTab}
        onValueChange={(v) => {
          setSelectedTab(v)
          try { if (typeof window !== 'undefined') localStorage.setItem('sab_tabs_selected', v) } catch {}
        }}
        className="space-y-3"
      >
        <TabsList>
          <TabsTrigger value="queue">Queue</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="servers">Servers</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-3">
          <Card>
            <CardHeader className="pb-1 pt-3 px-3">
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Download Queue
              </CardTitle>
              <CardDescription>Manage your download queue and priorities</CardDescription>
            </CardHeader>
            <CardContent className="pb-3 px-3">
              {/* Queue filters - align with SAB full queue output (auto-apply) */}
              <div className="grid gap-2 md:grid-cols-4 mb-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Category</label>
                  <Select
                    value={filterCat}
                    onValueChange={(v) => setFilterCat(v)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {categories.map((cat: string) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Priority</label>
                  <Select
                    value={filterPriority}
                    onValueChange={(v) => setFilterPriority(v)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="All priorities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {['Paused','Low','Normal','High','Force','-2','-1','0','1','2'].map(p => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-medium">Search</label>
                  <div className="relative">
                    <input
                      className="w-full h-9 rounded border px-3 text-sm bg-background"
                      placeholder="Filter by name..."
                      value={filterSearch}
                      onChange={(e) => setFilterSearch(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {currentQueue.length === 0 ? (
                <div className="text-sm text-muted-foreground">No items in queue.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-muted-foreground">
                        <th className="px-2 py-2 w-10"></th>
                        <th className="px-2 py-2">Item</th>
                        <th className="px-2 py-2">Category</th>
                        <th className="px-2 py-2">Priority</th>
                        <th className="px-2 py-2">Age</th>
                        <th className="px-2 py-2">Percent</th>
                        <th className="px-2 py-2">Size</th>
                        <th className="px-2 py-2 w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentQueue.map((item: any) => {
                        const age = item.avg_age || item.age || '—'
                        const percent = typeof item.percentage === 'number' ? item.percentage : Number(item.percentage || 0)
                        const isPaused = String(item.status).toLowerCase() === 'paused'
                        return (
                          <tr key={item.nzo_id} className="border-b last:border-b-0">
                            <td className="px-2 py-2">
                              {isPaused ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  onClick={async () => {
                                    try {
                                      await actions.resumeItem(item.nzo_id)
                                      // optimistic: update local state immediately
                                      applyOptimisticToItem(item.nzo_id, { status: 'Downloading' })
                                    } catch {}
                                  }}
                                  title="Resume"
                                >
                                  <Play className="h-4 w-4" />
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  onClick={async () => {
                                    try {
                                      await actions.pauseItem(item.nzo_id)
                                      // optimistic: update local state immediately
                                      applyOptimisticToItem(item.nzo_id, { status: 'Paused' })
                                    } catch {}
                                  }}
                                  title="Pause"
                                >
                                  <Pause className="h-4 w-4" />
                                </Button>
                              )}
                            </td>
                            <td className="px-2 py-2">
                              <div className="flex items-center gap-2">
                                <Badge variant={getStatusColor(item.status) as any}>{item.status}</Badge>
                                <div className="min-w-0">
                                  <div className="font-medium truncate max-w-[380px]">{item.filename}</div>
                                  <div className="text-xs text-muted-foreground">
                                    ETA: {item.eta || item.timeleft || '—'} • {item.speed || '0 MB/s'}
                                  </div>
                                  <div className="mt-1">
                                    <Progress value={percent} className="h-1.5 w-56" />
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-2 py-2">
                              {(() => {
                                // Build category options ensuring the current item's category is included and list is unique
                                const baseCats: string[] = (Array.isArray(categories) ? categories : []).filter(Boolean)
                                const curRaw = (item.category ?? '').toString().trim()
                                const currentCategory = curRaw.length > 0 ? curRaw : (baseCats[0] ?? '')
                                const optionsSet = new Set<string>()
                                if (currentCategory) optionsSet.add(currentCategory)
                                for (const c of baseCats) optionsSet.add(c)
                                const categoryOptions = Array.from(optionsSet)

                                const handleChange = async (value: string) => {
                                  try {
                                    await actions.setCategory(item.nzo_id, value)
                                  } finally {
                                    // Optimistically update local view to reflect the change immediately
                                    setFilteredSlots((prev) => {
                                      if (!prev) return prev
                                      return prev.map(s => s.nzo_id === item.nzo_id ? { ...s, category: value } : s)
                                    })
                                    // Also update in-place for the unfiltered effectiveQueue case if currently shown
                                    if (!filteredSlots) {
                                      // no state setter for effectiveQueue (comes from hook), rely on poll refresh
                                      // but ensure render uses the value passed to Select by controlling it
                                    }
                                  }
                                }

                                return (
                                  <Select
                                    value={currentCategory}
                                    onValueChange={async (value) => {
                                      await handleChange(value)
                                      // already optimistically updated category in handleChange
                                    }}
                                  >
                                    <SelectTrigger className="h-7 px-2 text-xs w-[140px]">
                                      <SelectValue placeholder="Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {categoryOptions.map((cat: string) => (
                                        <SelectItem key={`${item.nzo_id}-${cat}`} value={cat}>{cat}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )
                              })()}
                            </td>
                            <td className="px-2 py-2">
                              {(() => {
                                // Canonical SAB priorities shown to user; map to numeric values for API
                                const PRIORITY_LABELS = ['Paused','Low','Normal','High','Force'] as const
                                const labelToValue: Record<string, number> = {
                                  Paused: -2, Low: -1, Normal: 0, High: 1, Force: 2,
                                }
                                const normalize = (p: any): string => {
                                  if (typeof p === 'number') {
                                    const entry = Object.entries(labelToValue).find(([, v]) => v === p)
                                    return entry ? entry[0] : 'Normal'
                                  }
                                  if (typeof p === 'string') {
                                    const s = p.trim()
                                    // Handle numeric strings and existing textual labels
                                    if (/^-?\d+$/.test(s)) {
                                      const num = parseInt(s, 10)
                                      const entry = Object.entries(labelToValue).find(([, v]) => v === num)
                                      return entry ? entry[0] : 'Normal'
                                    }
                                    const found = PRIORITY_LABELS.find(l => l.toLowerCase() === s.toLowerCase())
                                    return found || 'Normal'
                                  }
                                  return 'Normal'
                                }
                                const currentLabel = normalize(item.priority)
                                return (
                                  <Select
                                    value={currentLabel}
                                    onValueChange={async (label) => {
                                      try {
                                        const val = labelToValue[label] ?? 0
                                        await actions.setPriority(item.nzo_id, String(val))
                                        // optimistic: update priority label shown in table
                                        applyOptimisticToItem(item.nzo_id, { priority: label })
                                      } catch {}
                                    }}
                                  >
                                    <SelectTrigger className="h-7 px-2 text-xs w-[120px]">
                                      <SelectValue placeholder="Priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {PRIORITY_LABELS.map((l) => (
                                        <SelectItem key={`${item.nzo_id}-${l}`} value={l}>{l}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )
                              })()}
                            </td>
                            <td className="px-2 py-2">{age}</td>
                            <td className="px-2 py-2">{percent}%</td>
                            <td className="px-2 py-2">
                              <div className="text-xs">
                                {item.sizeleft || '—'} / {item.size || '—'}
                              </div>
                            </td>
                            <td className="px-2 py-2">
                              <div className="flex items-center justify-end gap-1">
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => actions.deleteItem(item.nzo_id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}

            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-3">
          <Card>
            <CardHeader className="pb-1 pt-3 px-3">
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Download History
              </CardTitle>
              <CardDescription>View completed and failed downloads</CardDescription>
            </CardHeader>
            <CardContent className="pb-3 px-3">
              {/* History Filters (mode=history) */}
              <HistoryFilters />
              <HistoryTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="servers" className="space-y-3">
          <Card>
            <CardHeader className="pb-1 pt-3 px-3">
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                News Servers
              </CardTitle>
              <CardDescription>Monitor and manage your news server connections</CardDescription>
            </CardHeader>
            <CardContent className="pb-3 px-3">
              {!sabEnabled ? (
                <div className="text-sm text-muted-foreground">No server info available.</div>
              ) : loading && !serverStats ? (
                <div className="text-sm text-muted-foreground">Loading server stats…</div>
              ) : serverStats ? (
                <div className="text-sm">
                  <div className="grid gap-2 md:grid-cols-2">
                    <div>
                      <div className="text-muted-foreground">Total Connections</div>
                      <div className="font-medium">{serverStats.totalConnections ?? '—'}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Max Connections</div>
                      <div className="font-medium">{serverStats.maxConnections ?? '—'}</div>
                    </div>
                  </div>
                  {Array.isArray(serverStats.servers) && serverStats.servers.length > 0 ? (
                    <div className="mt-3 space-y-2">
                      {serverStats.servers.map((s: any, idx: number) => (
                        <div key={idx} className="border rounded-lg p-2">
                          <div className="flex items-center justify-between text-sm">
                            <div className="font-medium">{s.name || s.host || `Server ${idx+1}`}</div>
                            <Badge variant={s.enabled ? 'default' : 'secondary'}>
                              {s.enabled ? 'Enabled' : 'Disabled'}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {s.host ? `Host: ${s.host}` : null}
                            {s.port ? ` • Port: ${s.port}` : null}
                            {typeof s.connections !== 'undefined' ? ` • Conns: ${s.connections}` : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground mt-2">No servers reported.</div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No server info available.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-3">
          <Card>
            <CardHeader className="pb-1 pt-3 px-3">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Download Statistics
              </CardTitle>
              <CardDescription>Overall download metrics</CardDescription>
            </CardHeader>
            <CardContent className="pb-3 px-3">
              <div className="text-sm text-muted-foreground">No statistics available.</div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-3">
          {effectiveLogs.length === 0 ? (
            <div className="text-sm text-muted-foreground px-3">No logs to display.</div>
          ) : (
            <ModuleLogViewer moduleName="SABnzbd" logs={effectiveLogs as any} />
          )}
        </TabsContent>
      </Tabs>

      {/* Module Settings (proxy-only; no secrets exposed) */}
      <Card className="mt-3">
        <CardHeader className="pb-1 pt-3 px-3">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Module Settings
          </CardTitle>
          <CardDescription>Connection overview (client-safe)</CardDescription>
        </CardHeader>
        <CardContent className="pb-3 px-3">
          <div className="grid gap-2 sm:grid-cols-2 text-sm">
            <div className="space-y-1">
              <div className="text-muted-foreground">Connection Mode</div>
              <div className="font-mono px-2 py-1 rounded bg-muted/50 break-all">
                {process.env.NEXT_PUBLIC_BACKEND_TARGET || '—'}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground">Proxy Endpoint</div>
              <div className="font-mono px-2 py-1 rounded bg-muted/50 break-all">/api/sab</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
* Lightweight History UI wired to hook-level filtered fetch (mode=history).
* We keep these as inner components to access the same hook instance/state.
*/
function HistoryFilters() {
 const sabEnabled = true

 const { fetchHistory, categories } = sabEnabled
   ? useSABnzbd('/api/sab', '')
   : { fetchHistory: async () => {}, categories: [] as string[] } as any

 const [cat, setCat] = useState<string>('all')
 const [search, setSearch] = useState<string>('')
 const [failedOnly, setFailedOnly] = useState<boolean>(false)
 // Pagination local state
 const [start, setStart] = useState<number>(0)
 const [limit, setLimit] = useState<number>(50)

 // Auto-apply on change and pagination
 useEffect(() => {
   if (!sabEnabled) return
   const opts: any = {}
   if (cat && cat !== 'all') opts.cat = cat
   if (search) opts.search = search
   opts.failed_only = failedOnly ? 1 : 0
   fetchHistory(start, limit, opts)
   // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [cat, search, failedOnly, start, limit, sabEnabled])

 return (
   <div className="grid gap-2 md:grid-cols-4 mb-3">
     <div className="space-y-1">
       <label className="text-sm font-medium">Category</label>
       <Select value={cat} onValueChange={(v) => setCat(v)}>
         <SelectTrigger className="h-9">
           <SelectValue placeholder="All categories" />
         </SelectTrigger>
         <SelectContent>
           <SelectItem value="all">All</SelectItem>
           {categories.map((c: string) => (
             <SelectItem key={c} value={c}>{c}</SelectItem>
           ))}
         </SelectContent>
       </Select>
     </div>
     <div className="space-y-1 md:col-span-2">
       <label className="text-sm font-medium">Search</label>
       <input
         className="w-full h-9 rounded border px-3 text-sm bg-background"
         placeholder="Find by name…"
         value={search}
         onChange={(e) => setSearch(e.target.value)}
       />
     </div>
     <div className="space-y-1">
       <label className="text-sm font-medium">Failed Only</label>
       <Select value={failedOnly ? '1' : '0'} onValueChange={(v) => setFailedOnly(v === '1')}>
         <SelectTrigger className="h-9">
           <SelectValue placeholder="All results" />
         </SelectTrigger>
         <SelectContent>
           <SelectItem value="0">No</SelectItem>
           <SelectItem value="1">Yes</SelectItem>
         </SelectContent>
       </Select>
     </div>

     {/* Pagination removed to show all history by default; filters above narrow results server-side */}
   </div>
 )
}

function HistoryTable() {
 const sabEnabled = true

 const { history, actions, loading } = sabEnabled
   ? useSABnzbd('/api/sab', '')
   : { history: { slots: [] }, actions: { deleteItem: async () => {} }, loading: false } as any

 const rows = Array.isArray(history?.slots) ? history!.slots : []

 if (!sabEnabled) {
   return <div className="text-sm text-muted-foreground">History requires SAB configuration.</div>
 }

 if (loading && rows.length === 0) {
   return <div className="text-sm text-muted-foreground">Loading history…</div>
 }

 if (rows.length === 0) {
   return <div className="text-sm text-muted-foreground">No history available.</div>
 }

 return (
   <div className="overflow-x-auto">
     <table className="w-full text-sm">
       <thead>
         <tr className="text-left text-muted-foreground">
           <th className="px-2 py-2">Name</th>
           <th className="px-2 py-2">Status</th>
           <th className="px-2 py-2">Category</th>
           <th className="px-2 py-2">Size</th>
           <th className="px-2 py-2">Completed</th>
           <th className="px-2 py-2">Time</th>
           <th className="px-2 py-2 w-10"></th>
         </tr>
       </thead>
       <tbody>
         {rows.map((item: any) => (
           <tr key={item.nzo_id} className="border-b last:border-b-0">
             <td className="px-2 py-2">
               <div className="font-medium truncate max-w-[420px]">{item.name}</div>
             </td>
             <td className="px-2 py-2">
               <Badge variant={(function(status: string){
                 switch (status) {
                   case 'Downloading': return 'default'
                   case 'Completed': return 'default'
                   case 'Failed': return 'destructive'
                   case 'Queued': return 'secondary'
                   case 'Paused': return 'outline'
                   default: return 'outline'
                 }
               })(item.status) as any}>
                 {item.status === 'Completed' ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                 {item.status}
               </Badge>
             </td>
             <td className="px-2 py-2">{item.category || '—'}</td>
             <td className="px-2 py-2">{item.size || '—'}</td>
             <td className="px-2 py-2">{item.completed || '—'}</td>
             <td className="px-2 py-2">{item.downloadTime || '—'}</td>
             <td className="px-2 py-2">
               <div className="flex items-center justify-end gap-1">
                 <Button
                   variant="ghost"
                   size="sm"
                   className="h-7 w-7 p-0"
                   onClick={() => actions.deleteItem(item.nzo_id)}
                   title="Delete from history"
                 >
                   <Trash2 className="h-4 w-4" />
                 </Button>
               </div>
             </td>
           </tr>
         ))}
       </tbody>
     </table>
   </div>
 )
}
