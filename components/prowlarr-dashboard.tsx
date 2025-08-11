"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Radio, Search, Plus, Bookmark, BookmarkIcon as BookmarkOff, Download, Calendar, BarChart3, Settings, MoreHorizontal, Star, Clock, HardDrive, CheckCircle, XCircle, Edit, Filter, Trash2, RefreshCw, Cpu, Activity, AlertTriangle, Info, Zap, Globe, Database } from 'lucide-react'
import { useMemo, useState, useEffect } from "react"
import { ModuleLogViewer } from "./module-log-viewer"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
// import { useProwlarr } from "@/hooks/use-prowlarr"

interface ProwlarrDashboardProps {
  displayMode?: 'table' | 'poster'
}

const isDev = process.env.NODE_ENV !== 'production'

// Minimal dev-only sample to preserve UI shape in development
const devIndexers = [
  { id: 1, name: 'Sample Indexer', protocol: 'torrent', enable: true, priority: 1, appProfile: 'Default', tags: [1] }
]

// Helper function to format bytes to human-readable format
function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function ProwlarrDashboard({ displayMode = 'table' }: ProwlarrDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProtocol, setSelectedProtocol] = useState('all')
  const [selectedEnabled, setSelectedEnabled] = useState('all')
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editedEnabled, setEditedEnabled] = useState(false)
  const [editedPriority, setEditedPriority] = useState('')
  const [editedTags, setEditedTags] = useState('')

  // Use the internal proxy route; server-side envs inject credentials/headers
  const prowlarrEnabled = true
  // Placeholder for useProwlarr hook until it's implemented
  const useProwlarr = () => ({
    indexers: [],
    downloadClients: [],
    applications: [],
    systemStatus: {
      version: '1.0.0',
      buildTime: new Date().toISOString(),
      startTime: new Date().toISOString(),
      appData: '/config',
      osName: 'Linux',
      osVersion: '5.4.0',
      architecture: 'x64',
      runtimeVersion: '18.0.0'
    },
    systemHealth: [],
    systemTasks: [],
    updateInfo: {
      version: '1.0.0',
      latestVersion: '1.0.0',
      updateAvailable: false,
      changes: []
    },
    notifications: [],
    tags: [],
    lookupResults: [],
    actions: {
      testAllIndexers: async () => {},
      indexers: {
        toggleEnable: async (id: number) => {},
        testIndexer: async (id: number) => {},
        deleteIndexer: async (id: number) => {},
        addIndexer: async (indexer: any) => {}
      },
      lookupIndexer: async (term: string) => {}
    },
    fetch: {
      indexers: async () => {},
      downloadClients: async () => {},
      applications: async () => {},
      systemStatus: async () => {},
      systemHealth: async () => {},
      systemTasks: async () => {},
      updateInfo: async () => {},
      notifications: async () => {},
      tags: async () => {}
    },
    loading: false
  })
  
  const { indexers, downloadClients, applications, systemStatus, systemHealth, systemTasks, updateInfo, notifications, tags, lookupResults, actions, fetch, loading } =
    useProwlarr()

  // Type for an indexer item (best-effort shape)
  type IndexerItem = typeof devIndexers[number] & Partial<{
    id: number
    name: string
    protocol: string
    enable: boolean
    priority: number
    appProfile: string
    tags: number[]
  }>

  const [indexerToEdit, setIndexerToEdit] = useState<IndexerItem | null>(null)

  // Add Indexer dialog state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [addSearchTerm, setAddSearchTerm] = useState('')
  const [selectedIndexerId, setSelectedIndexerId] = useState<number | null>(null)
  const [selectedAppProfile, setSelectedAppProfile] = useState<string>('')
  const [addEnabled, setAddEnabled] = useState(true)
  const [addPriority, setAddPriority] = useState(1)

  // Persist and react to tab selection
  const [selectedTab, setSelectedTab] = useState<string>(() => {
    if (typeof window === 'undefined') return 'indexers'
    try { return localStorage.getItem('prowlarr_tabs_selected') || 'indexers' } catch { return 'indexers' }
  })
  useEffect(() => {
    try { if (typeof window !== 'undefined') localStorage.setItem('prowlarr_tabs_selected', selectedTab) } catch {}
    if (!prowlarrEnabled) return
    if (selectedTab === 'downloadclients') {
      fetch.downloadClients()
    } else if (selectedTab === 'applications') {
      fetch.applications()
    } else if (selectedTab === 'system') {
      fetch.systemStatus()
      fetch.systemHealth()
      fetch.systemTasks()
      fetch.updateInfo()
    } else if (selectedTab === 'notifications') {
      fetch.notifications()
    }
  }, [selectedTab, prowlarrEnabled, fetch.downloadClients, fetch.applications, fetch.systemStatus, fetch.systemHealth, fetch.systemTasks, fetch.updateInfo, fetch.notifications])

  // Load catalogs when Add Indexer dialog opens
  useEffect(() => {
    if (!isAddDialogOpen) return
    fetch.tags()
  }, [isAddDialogOpen, fetch])

  // Compute effective data with dev-only fallback
  const effectiveIndexers: IndexerItem[] = useMemo(() => {
    if (indexers && Array.isArray(indexers) && indexers.length) return (indexers as unknown) as IndexerItem[]
    return isDev ? (devIndexers as IndexerItem[]) : []
  }, [indexers])

  const filteredIndexers = effectiveIndexers.filter((indexer: IndexerItem) => {
    const name = (indexer.name || '').toLowerCase()
    const matchesSearch = name.includes(searchTerm.toLowerCase())
    const matchesProtocol = selectedProtocol === 'all' || indexer.protocol === selectedProtocol
    const matchesEnabled = selectedEnabled === 'all' ||
      (selectedEnabled === 'enabled' && !!indexer.enable) ||
      (selectedEnabled === 'disabled' && !indexer.enable)
    return matchesSearch && matchesProtocol && matchesEnabled
  })

  const handleIndexerAction = async (action: string, indexerId?: number) => {
    if (!indexerId || !prowlarrEnabled) return
    
    switch (action) {
      case 'toggle_enable':
        if ('toggleEnable' in actions.indexers) {
          await actions.indexers.toggleEnable(indexerId)
        }
        break
      case 'test':
        if ('testIndexer' in actions.indexers) {
          await actions.indexers.testIndexer(indexerId)
        }
        break
      case 'delete':
        if ('deleteIndexer' in actions.indexers) {
          await actions.indexers.deleteIndexer(indexerId)
        }
        break
      default:
        console.log(`Unknown indexer action: ${action}`, indexerId)
    }
  }

  const handleEditClick = (i: IndexerItem) => {
    setIndexerToEdit(i)
    setEditedEnabled(!!i.enable)
    setEditedPriority(i.priority?.toString() || '')
    const tags = Array.isArray(i.tags) ? i.tags : []
    setEditedTags(tags.join(', '))
    setIsEditDialogOpen(true)
  }

  const handleSaveIndexerEdit = async () => {
    if (indexerToEdit && prowlarrEnabled) {
      const updatedIndexer: IndexerItem = {
        ...indexerToEdit,
        enable: editedEnabled,
        priority: parseInt(editedPriority) || 1,
        tags: editedTags.split(',').map(tag => parseInt(tag.trim())).filter(tag => !isNaN(tag)),
      }
      
      try {
        if ('toggleEnable' in actions.indexers && updatedIndexer.enable !== indexerToEdit.enable) {
          await actions.indexers.toggleEnable(indexerToEdit.id)
        }
        // Note: Priority and tags updates would need additional API methods
        console.log('Saving updated indexer:', updatedIndexer)
        setIsEditDialogOpen(false)
        setIndexerToEdit(null)
        // Refresh the indexer data
        fetch.indexers()
      } catch (error) {
        console.error('Failed to save indexer:', error)
      }
    }
  };

  const handleDeleteIndexer = async (indexerId: number) => {
    if (!prowlarrEnabled) return
    
    try {
      if ('deleteIndexer' in actions.indexers) {
        await actions.indexers.deleteIndexer(indexerId)
        // Refresh the indexer data
        fetch.indexers()
      }
    } catch (error) {
      console.error('Failed to delete indexer:', error)
    }
  };

  const handleTestIndexer = async (indexerId: number) => {
    if (!prowlarrEnabled) return
    
    try {
      if ('testIndexer' in actions.indexers) {
        await actions.indexers.testIndexer(indexerId)
        // Refresh the activity data
        fetch.indexers()
      }
    } catch (error) {
      console.error('Failed to test indexer:', error)
    }
  };

  const getProtocolColor = (protocol: string) => {
    switch (protocol) {
      case 'torrent': return 'default'
      case 'usenet': return 'secondary'
      default: return 'outline'
    }
  }

  return (
    <div className="space-y-4">
      {/* Header with Global Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Prowlarr</h2>
          <p className="text-muted-foreground">Indexer Management</p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              try {
                await actions.testAllIndexers()
                fetch.indexers()
              } catch (e) {
                console.error(e)
              }
            }}
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Test All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Indexer
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-1" />
            Settings
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3">
            <CardTitle className="text-sm font-medium">Total Indexers</CardTitle>
            <Radio className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-3 px-3">
            <div className="text-xl font-bold">{effectiveIndexers.length}</div>
            <p className="text-xs text-muted-foreground">
              {effectiveIndexers.filter(i => i.enable).length} enabled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3">
            <CardTitle className="text-sm font-medium">Download Clients</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-3 px-3">
            <div className="text-xl font-bold">{Array.isArray(downloadClients) ? downloadClients.length : 0}</div>
            <p className="text-xs text-muted-foreground">
              {/* active count placeholder */}
              0 active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-3 px-3">
            <div className="text-xl font-bold">{Array.isArray(applications) ? applications.length : 0}</div>
            <p className="text-xs text-muted-foreground">
              {/* synced count placeholder */}
              0 synced
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-3 px-3">
            <div className="text-xl font-bold">{Array.isArray(notifications) ? notifications.length : 0}</div>
            <p className="text-xs text-muted-foreground">
              {/* active count placeholder */}
              0 active
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v)} className="space-y-3">
        <TabsList>
          <TabsTrigger value="indexers">Indexers</TabsTrigger>
          <TabsTrigger value="downloadclients">Download Clients</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        {/* Indexers Tab */}
        <TabsContent value="indexers" className="space-y-3">
          {/* Filters */}
          <Card>
            <CardHeader className="pb-1 pt-3 px-3">
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-3 px-3">
              <div className="grid gap-2 md:grid-cols-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Search</label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search indexers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 h-9"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Protocol</label>
                  <Select value={selectedProtocol} onValueChange={setSelectedProtocol}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Protocols</SelectItem>
                      <SelectItem value="torrent">Torrent</SelectItem>
                      <SelectItem value="usenet">Usenet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={selectedEnabled} onValueChange={setSelectedEnabled}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="enabled">Enabled</SelectItem>
                      <SelectItem value="disabled">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Actions</label>
                  <Button variant="outline" className="w-full h-9">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Indexer
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Indexers List */}
          <Card>
            <CardHeader className="pb-1 pt-3 px-3">
              <CardTitle className="flex items-center gap-2">
                <Radio className="h-5 w-5" />
                Indexer Library
              </CardTitle>
              <CardDescription>
                Manage your indexer collection
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-3 px-3">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Protocol</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>App Profile</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredIndexers.map((indexer: IndexerItem) => (
                      <TableRow key={indexer.id}>
                        <TableCell className="font-medium">{indexer.name}</TableCell>
                        <TableCell>
                          <Badge variant={getProtocolColor(indexer.protocol) as any}>
                            {indexer.protocol}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={indexer.enable ? 'default' : 'secondary'}>
                            {indexer.enable ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </TableCell>
                        <TableCell>{indexer.priority}</TableCell>
                        <TableCell>{indexer.appProfile}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => handleIndexerAction('toggle_enable', indexer.id)}
                            >
                              {indexer.enable ? (
                                <Bookmark className="h-4 w-4 text-green-500" />
                              ) : (
                                <BookmarkOff className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                              <Search className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleEditClick(indexer)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleTestIndexer(indexer.id)}>
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  Test Indexer
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteIndexer(indexer.id)}>
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Indexer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Download Clients Tab */}
        <TabsContent value="downloadclients" className="space-y-3">
          <Card>
            <CardHeader className="pb-1 pt-3 px-3">
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Download Clients
              </CardTitle>
              <CardDescription>
                Manage your download client configurations
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-3 px-3">
              <div className="space-y-2">
                {Array.isArray(downloadClients) && downloadClients.length > 0 ? (
                  downloadClients.map((client: any) => (
                    <div key={client.id} className="border rounded-lg p-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-sm">{client.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {client.implementation} • {client.protocol}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                            <span>Priority: {client.priority}</span>
                            <Badge variant={client.enable ? 'default' : 'secondary'}>
                              {client.enable ? 'Enabled' : 'Disabled'}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">No download clients configured</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Applications Tab */}
        <TabsContent value="applications" className="space-y-3">
          <Card>
            <CardHeader className="pb-1 pt-3 px-3">
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Applications
              </CardTitle>
              <CardDescription>
                Manage your application connections
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-3 px-3">
              <div className="space-y-2">
                {Array.isArray(applications) && applications.length > 0 ? (
                  applications.map((app: any) => (
                    <div key={app.id} className="border rounded-lg p-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-sm">{app.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {app.implementation} • {app.syncType}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                            <span>Last sync: {app.lastSync ? new Date(app.lastSync).toLocaleString() : 'Never'}</span>
                            <Badge variant={app.enable ? 'default' : 'secondary'}>
                              {app.enable ? 'Enabled' : 'Disabled'}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">No applications configured</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-3">
          <Card>
            <CardHeader className="pb-1 pt-3 px-3">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Manage your notification connections
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-3 px-3">
              <div className="space-y-2">
                {Array.isArray(notifications) && notifications.length > 0 ? (
                  notifications.map((notification: any) => (
                    <div key={notification.id} className="border rounded-lg p-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-sm">{notification.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {notification.implementation}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                            <Badge variant={notification.enable ? 'default' : 'secondary'}>
                              {notification.enable ? 'Enabled' : 'Disabled'}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">No notifications configured</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Status Tab */}
        <TabsContent value="system" className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            {/* System Status Card */}
            <Card>
              <CardHeader className="pb-1 pt-3 px-3">
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-5 w-5" />
                  System Status
                </CardTitle>
                <CardDescription>Current Prowlarr system information</CardDescription>
              </CardHeader>
              <CardContent className="pb-3 px-3">
                <div className="space-y-2 text-sm">
                  {systemStatus ? (
                    <>
                      <div className="flex justify-between">
                        <span>Version</span>
                        <span className="font-medium">{systemStatus.version || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Build Time</span>
                        <span className="font-medium">
                          {systemStatus.buildTime ? new Date(systemStatus.buildTime).toLocaleDateString() : '—'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Runtime</span>
                        <span className="font-medium">
                          {systemStatus.startTime ?
                            `${Math.floor((Date.now() - new Date(systemStatus.startTime).getTime()) / (1000 * 60 * 60 * 24))} days` :
                            '—'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>App Data</span>
                        <span className="font-medium">{systemStatus.appData || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>OS</span>
                        <span className="font-medium">{systemStatus.osName || '—'} {systemStatus.osVersion || ''}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Architecture</span>
                        <span className="font-medium">{systemStatus.architecture || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Runtime Version</span>
                        <span className="font-medium">{systemStatus.runtimeVersion || '—'}</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-muted-foreground">No system status available</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* System Health Card */}
            <Card>
              <CardHeader className="pb-1 pt-3 px-3">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  System Health
                </CardTitle>
                <CardDescription>Health status of Prowlarr components</CardDescription>
              </CardHeader>
              <CardContent className="pb-3 px-3">
                <div className="space-y-2 text-sm">
                  {systemHealth && systemHealth.length > 0 ? (
                    systemHealth.map((health: any, index: number) => (
                      <div key={`health-${health.source || health.type}-${index}`} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {health.type === 'error' ? (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                          <span>{health.source || 'Unknown'}</span>
                        </div>
                        <Badge variant={health.type === 'error' ? 'destructive' : 'default'}>
                          {health.type || 'Unknown'}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground">No health issues reported</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Updates Card */}
            <Card>
              <CardHeader className="pb-1 pt-3 px-3">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Updates
                </CardTitle>
                <CardDescription>Available updates for Prowlarr</CardDescription>
              </CardHeader>
              <CardContent className="pb-3 px-3">
                <div className="space-y-2 text-sm">
                  {updateInfo ? (
                    <>
                      <div className="flex justify-between">
                        <span>Current Version</span>
                        <span className="font-medium">{updateInfo.version || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Latest Version</span>
                        <span className="font-medium">{updateInfo.latestVersion || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Update Available</span>
                        <Badge variant={updateInfo.updateAvailable ? 'default' : 'secondary'}>
                          {updateInfo.updateAvailable ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                      {updateInfo.updateAvailable && (
                        <div className="flex justify-between">
                          <span>Changes</span>
                          <span className="font-medium">
                            {updateInfo.changes && updateInfo.changes.length > 0 ?
                              `${updateInfo.changes.length} changes` : '—'}
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-sm text-muted-foreground">No update information available</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* System Tasks */}
            <Card>
              <CardHeader className="pb-1 pt-3 px-3">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  System Tasks
                </CardTitle>
                <CardDescription>Currently running system tasks</CardDescription>
              </CardHeader>
              <CardContent className="pb-3 px-3">
                <div className="space-y-2 text-sm">
                  {systemTasks && systemTasks.length > 0 ? (
                    systemTasks.map((task: any, index: number) => (
                      <div key={`task-${task.name || task.id || index}`} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            task.status === 'completed' ? 'bg-green-500' :
                            task.status === 'running' ? 'bg-yellow-500' :
                            task.status === 'failed' ? 'bg-red-500' : 'bg-gray-500'
                          }`} />
                          <span className="font-medium">{task.name || 'Unknown Task'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            task.status === 'completed' ? 'default' :
                            task.status === 'running' ? 'secondary' :
                            task.status === 'failed' ? 'destructive' : 'outline'
                          }>
                            {task.status || 'Unknown'}
                          </Badge>
                          {task.startTime && (
                            <span className="text-xs text-muted-foreground">
                              {new Date(task.startTime).toLocaleTimeString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground">No system tasks running</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-3">
          <ModuleLogViewer moduleName="Prowlarr" logs={[]} />
        </TabsContent>
      </Tabs>

      {/* Module Settings (proxy-only; no secrets exposed) */}
      <Card>
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
              <div className="font-mono px-2 py-1 rounded bg-muted/50 break-all">/api/prowlarr</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Indexer Dialog */}
      {indexerToEdit && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Indexer: {indexerToEdit.name}</DialogTitle>
              <DialogDescription>
                Make changes to the indexer settings here. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="enabled" className="text-right">
                  Enabled
                </Label>
                <Switch
                  id="enabled"
                  checked={editedEnabled}
                  onCheckedChange={setEditedEnabled}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="priority" className="text-right">
                  Priority
                </Label>
                <Input
                  id="priority"
                  type="number"
                  value={editedPriority}
                  onChange={(e) => setEditedPriority(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tags" className="text-right">
                  Tags
                </Label>
                <Input
                  id="tags"
                  value={editedTags}
                  onChange={(e) => setEditedTags(e.target.value)}
                  className="col-span-3"
                  placeholder="Comma-separated tags (e.g., 1, 2, 3)"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" onClick={handleSaveIndexerEdit}>Save changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Indexer Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Add Indexer</DialogTitle>
            <DialogDescription>Search and add an indexer to Prowlarr</DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 py-2">
            <div className="space-y-1">
              <Label className="text-sm">Search</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., The Pirate Bay"
                  value={addSearchTerm}
                  onChange={(e) => setAddSearchTerm(e.target.value)}
                  className="h-9"
                />
                <Button
                  variant="outline"
                  className="h-9"
                  onClick={() => actions.lookupIndexer(addSearchTerm)}
                  disabled={!addSearchTerm.trim() || loading}
                >
                  <Search className="h-4 w-4 mr-1" />
                  Lookup
                </Button>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-sm">Results</Label>
              <div className="max-h-48 overflow-y-auto border rounded">
                {Array.isArray(lookupResults) && lookupResults.length > 0 ? (
                  lookupResults.map((i: any) => (
                    <div
                      key={i.id}
                      className={`px-2 py-1 text-sm cursor-pointer ${selectedIndexerId === i.id ? 'bg-muted' : ''}`}
                      onClick={() => setSelectedIndexerId(i.id)}
                      role="button"
                    >
                      {i.name} {i.protocol ? `(${i.protocol})` : ''}
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-muted-foreground px-2 py-2">
                    No results yet. Enter a search term and click Lookup.
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-sm">App Profile</Label>
                <Select
                  value={selectedAppProfile}
                  onValueChange={(v) => setSelectedAppProfile(v)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select profile" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="sonarr">Sonarr</SelectItem>
                    <SelectItem value="radarr">Radarr</SelectItem>
                    <SelectItem value="lidarr">Lidarr</SelectItem>
                    <SelectItem value="readarr">Readarr</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-sm">Priority</Label>
                <Input
                  type="number"
                  value={addPriority}
                  onChange={(e) => setAddPriority(parseInt(e.target.value) || 1)}
                  className="h-9"
                  min="1"
                  max="100"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm">Enabled</Label>
              <Switch checked={addEnabled} onCheckedChange={setAddEnabled} />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">Cancel</Button>
            </DialogClose>
            <Button
              onClick={async () => {
                try {
                  const sel = (lookupResults || []).find((i: any) => i.id === selectedIndexerId) as any
                  if (!sel || !selectedAppProfile) return
                  await actions.indexers.addIndexer({
                    name: sel.name || '',
                    implementation: sel.implementation || '',
                    configContract: sel.configContract || '',
                    protocol: sel.protocol || '',
                    enable: addEnabled,
                    priority: addPriority,
                    appProfileId: selectedAppProfile,
                    tags: [],
                  } as any)
                  setIsAddDialogOpen(false)
                  setAddSearchTerm('')
                  setSelectedIndexerId(null)
                  setSelectedAppProfile('')
                  setAddEnabled(true)
                  setAddPriority(1)
                  fetch.indexers()
                } catch (e) {
                  console.error('Failed to add indexer', e)
                }
              }}
              disabled={!selectedIndexerId || !selectedAppProfile}
            >
              Add Indexer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}