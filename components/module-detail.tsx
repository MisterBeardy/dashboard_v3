"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, XCircle, RefreshCw, Settings, Activity, Calendar, Download, Search } from 'lucide-react'
import { ViewType } from "./dashboard"
import { SABnzbdDashboard } from './sabnzbd-dashboard'
import { SonarrDashboard } from './sonarr-dashboard'

interface ModuleDetailProps {
  module: ViewType
  displayMode?: 'table' | 'poster' // Add displayMode prop
}

const moduleData = {
  sabnzbd: {
    name: 'SABnzbd',
    description: 'Usenet Downloader',
    status: 'online',
    version: '4.1.0',
    uptime: '18 days, 12 hours',
    stats: {
      queue: 3,
      speed: '12.4 MB/s',
      remaining: '2.3GB',
      completed: 1247,
      diskSpace: '3.2TB / 4TB'
    },
    recentActivity: [
      'Completed: Taylor Swift - Midnights',
      'Added to queue: The Last of Us S01E08',
      'Download speed: 12.4 MB/s',
      'Queue processed: 5 items',
      'Disk cleanup: Removed 15 old downloads'
    ]
  },
  sonarr: {
    name: 'Sonarr',
    description: 'TV Show Manager',
    status: 'online',
    version: '4.0.0',
    uptime: '15 days, 8 hours',
    stats: {
      queue: 2,
      speed: '5.6 MB/s',
      remaining: '1.8GB',
      completed: 987,
      diskSpace: '2.5TB / 3TB'
    },
    recentActivity: [
      'Completed: Breaking Bad S05E18',
      'Added to queue: Game of Thrones S08E07',
      'Download speed: 5.6 MB/s',
      'Queue processed: 3 items',
      'Disk cleanup: Removed 10 old downloads'
    ]
  }
}

export function ModuleDetail({ module, displayMode }: ModuleDetailProps) { // Accept displayMode
  const data = moduleData[module as keyof typeof moduleData]
  
  if (!data) {
    return <div>Module not found</div>
  }

  // For SABnzbd, show the full dashboard
  if (module === 'sabnzbd') {
    return <SABnzbdDashboard displayMode={displayMode} /> // Pass displayMode
  }

  // For Sonarr, show the full dashboard
  if (module === 'sonarr') {
    return <SonarrDashboard displayMode={displayMode} /> // Pass displayMode
  }

  // For other modules, show the simplified view
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{data.name}</h2>
          <p className="text-muted-foreground">{data.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Compact Status Header */}
      <Card>
        <CardContent className="py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {data.status === 'online' ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <Badge variant={data.status === 'online' ? 'default' : 'destructive'}>
                  {data.status}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">v{data.version}</div>
              <div className="text-sm text-muted-foreground">Uptime: {data.uptime}</div>
              <div className="text-sm text-muted-foreground">Last Updated: 2 minutes ago</div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compact Statistics */}
      <div className="grid gap-4 grid-cols-5 md:grid-cols-5 lg:grid-cols-5">
        {Object.entries(data.stats).map(([key, value]) => (
          <Card key={key} className="p-3">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </div>
              {key === 'downloading' && <Download className="h-3 w-3 text-muted-foreground" />}
              {key === 'searches' && <Search className="h-3 w-3 text-muted-foreground" />}
              {key === 'queue' && <Calendar className="h-3 w-3 text-muted-foreground" />}
            </div>
            <div className="text-lg font-bold mt-1">{value}</div>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest events and actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                <div className="flex-1 space-y-1">
                  <p className="text-muted-foreground">{activity}</p>
                  <p className="text-xs text-muted-foreground">
                    {Math.floor(Math.random() * 60)} minutes ago
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
