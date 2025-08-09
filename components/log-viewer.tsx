"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Search, Download, RefreshCw, Filter, AlertCircle, Info, CheckCircle, XCircle } from 'lucide-react'
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"

const logLevels = [
  { value: 'all', label: 'All Levels' },
  { value: 'error', label: 'Error', color: 'destructive' },
  { value: 'warning', label: 'Warning', color: 'secondary' },
  { value: 'info', label: 'Info', color: 'default' },
  { value: 'debug', label: 'Debug', color: 'outline' }
]

const modules = [
  { value: 'all', label: 'All Modules' },
  { value: 'sabnzbd', label: 'SABnzbd' },
  { value: 'sonarr', label: 'Sonarr' }
]

const mockLogs = [
  {
    id: 1,
    timestamp: '2024-01-15 14:30:25',
    module: 'sonarr',
    level: 'info',
    message: 'Episode downloaded successfully: The Last of Us S01E08',
    details: 'File: The.Last.of.Us.S01E08.1080p.WEB.H264-CAKES.mkv'
  },
  {
    id: 2,
    timestamp: '2024-01-15 14:28:15',
    module: 'sonarr',
    level: 'info',
    message: 'Added series: House of the Dragon',
    details: 'Quality Profile: HD-1080p, Language: English, Monitored: Yes'
  },
  {
    id: 3,
    timestamp: '2024-01-15 14:25:10',
    module: 'sabnzbd',
    level: 'warning',
    message: 'Disk space warning: 85% full',
    details: 'Available: 600 GB, Used: 3.4 TB, Total: 4 TB'
  },
  {
    id: 4,
    timestamp: '2024-01-15 14:22:45',
    module: 'sabnzbd',
    level: 'info',
    message: 'Queue processed: 5 items completed',
    details: 'Total downloaded: 8.7 GB, Average speed: 11.2 MB/s'
  },
  {
    id: 5,
    timestamp: '2024-01-15 14:20:30',
    module: 'sabnzbd',
    level: 'debug',
    message: 'Connection test successful to news server',
    details: 'Server: news.example.com:563, SSL: Enabled, Response: 200ms'
  },
  {
    id: 6,
    timestamp: '2024-01-15 14:18:20',
    module: 'sabnzbd',
    level: 'error',
    message: 'Download failed: Incomplete file',
    details: 'File: Movie.2024.1080p.mkv, Missing blocks: 15, Retry attempts: 3'
  },
  {
    id: 7,
    timestamp: '2024-01-15 14:15:55',
    module: 'sabnzbd',
    level: 'info',
    message: 'Post-processing completed',
    details: 'Script: cleanup.py, Status: Success, Time: 45s'
  },
  {
    id: 8,
    timestamp: '2024-01-15 14:12:10',
    module: 'sabnzbd',
    level: 'info',
    message: 'Disk cleanup: Removed 15 old downloads',
    details: 'Freed space: 2.3 GB, Retention: 30 days'
  }
]

const getLevelIcon = (level: string) => {
  switch (level) {
    case 'error':
      return <XCircle className="h-4 w-4 text-red-500" />
    case 'warning':
      return <AlertCircle className="h-4 w-4 text-yellow-500" />
    case 'info':
      return <Info className="h-4 w-4 text-blue-500" />
    case 'debug':
      return <CheckCircle className="h-4 w-4 text-gray-500" />
    default:
      return <Info className="h-4 w-4" />
  }
}

const getLevelBadgeVariant = (level: string) => {
  switch (level) {
    case 'error':
      return 'destructive'
    case 'warning':
      return 'secondary'
    case 'info':
      return 'default'
    case 'debug':
      return 'outline'
    default:
      return 'default'
  }
}

export function LogViewer() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('all')
  const [selectedModule, setSelectedModule] = useState('all')
  const [selectedLog, setSelectedLog] = useState<typeof mockLogs[0] | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleLogClick = (log: typeof mockLogs[0]) => {
    setSelectedLog(log)
    setIsDialogOpen(true)
  }

  const filteredLogs = mockLogs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLevel = selectedLevel === 'all' || log.level === selectedLevel
    const matchesModule = selectedModule === 'all' || log.module === selectedModule
    
    return matchesSearch && matchesLevel && matchesModule
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">System Logs</h2>
          <p className="text-muted-foreground">Monitor and troubleshoot module activities</p>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-1 pt-3 px-3">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Log Filters
          </CardTitle>
          <CardDescription>
            Filter logs by module, level, or search terms
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-3 px-3">
          <div className="grid gap-2 md:grid-cols-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 h-9"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Module</label>
              <Select value={selectedModule} onValueChange={setSelectedModule}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {modules.map((module) => (
                    <SelectItem key={module.value} value={module.value}>
                      {module.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Log Level</label>
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {logLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Log Entries */}
      <Card>
        <CardHeader className="pb-1 pt-3 px-3">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Log Entries
          </CardTitle>
          <CardDescription>
            Showing {filteredLogs.length} of {mockLogs.length} log entries
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-3 px-3">
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {filteredLogs.map((log) => (
              <div key={log.id} className="border rounded-lg p-2 space-y-1 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleLogClick(log)}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-1">
                    {getLevelIcon(log.level)}
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1">
                        <Badge variant={getLevelBadgeVariant(log.level) as any} className="h-5 px-1.5 text-xs">
                          {log.level.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="h-5 px-1.5 text-xs">
                          {log.module.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {log.timestamp}
                        </span>
                      </div>
                      <p className="font-medium text-sm">{log.message}</p>
                      <p className="text-xs text-muted-foreground">{log.details}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredLogs.length === 0 && (
              <div className="text-center py-6 text-muted-foreground text-sm">
                No logs found matching your filters
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      {selectedLog && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {getLevelIcon(selectedLog.level)}
                Log Entry Details
              </DialogTitle>
              <DialogDescription>
                Detailed information for the selected log entry.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-2 py-4 text-sm">
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-muted-foreground">Timestamp:</span>
                <span className="col-span-3 font-medium">{selectedLog.timestamp}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-muted-foreground">Module:</span>
                <span className="col-span-3 font-medium">{selectedLog.module.toUpperCase()}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-muted-foreground">Level:</span>
                <span className="col-span-3">
                  <Badge variant={getLevelBadgeVariant(selectedLog.level) as any}>
                    {selectedLog.level.toUpperCase()}
                  </Badge>
                </span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-muted-foreground">Message:</span>
                <span className="col-span-3 font-medium">{selectedLog.message}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="text-muted-foreground">Details:</span>
                <span className="col-span-3 text-muted-foreground">{selectedLog.details}</span>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Close
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
