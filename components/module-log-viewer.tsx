"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Search, Download, RefreshCw, Filter, AlertCircle, Info, CheckCircle, XCircle } from 'lucide-react'
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"

interface LogEntry {
  id: number
  timestamp: string
  module: string
  level: 'info' | 'warning' | 'error' | 'debug'
  message: string
  details: string
}

interface ModuleLogViewerProps {
  moduleName: string
  logs: LogEntry[]
}

const logLevels = [
  { value: 'all', label: 'All Levels' },
  { value: 'error', label: 'Error', color: 'destructive' },
  { value: 'warning', label: 'Warning', color: 'secondary' },
  { value: 'info', label: 'Info', color: 'default' },
  { value: 'debug', label: 'Debug', color: 'outline' }
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

export function ModuleLogViewer({ moduleName, logs }: ModuleLogViewerProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('all')
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLevel = selectedLevel === 'all' || log.level === selectedLevel
    
    return matchesSearch && matchesLevel
  })

  const handleLogClick = (log: LogEntry) => {
    setSelectedLog(log)
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardHeader className="pb-1 pt-3 px-3">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Log Filters
          </CardTitle>
          <CardDescription>
            Filter logs by level or search terms for {moduleName}
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-3 px-3">
          <div className="grid gap-2 md:grid-cols-2">
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
            Showing {filteredLogs.length} of {logs.length} log entries for {moduleName}
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
