"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Download, Tv, Settings, Film, Radio, BookOpen, Headphones } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { type ViewType } from "./dashboard"

interface OverallStatisticsProps {
  setCurrentView: (view: ViewType) => void
  enabledModules: Record<string, boolean>
}

const overallStatsData = [
  {
    id: 'sabnzbd',
    name: 'SABnzbd',
    icon: Download,
    metrics: [
      { label: 'Total Downloaded', value: '5.7 TB' },
      { label: 'Average Speed', value: '9.8 MB/s' },
      { label: 'Queue Size', value: 3 },
      { label: 'Disk Usage', value: '2.4 TB / 4 TB' },
      { label: 'Download Success Rate', value: '96.5%' },
    ]
  },
  {
    id: 'sonarr',
    name: 'Sonarr',
    icon: Tv,
    metrics: [
      { label: 'Total Series', value: 45 },
      { label: 'Total Episodes', value: 1247 },
      { label: 'Missing Episodes', value: 67, isDestructive: true },
      { label: 'Monitored Series', value: 38 },
      { label: 'Disk Usage', value: '2.4 TB / 4 TB' },
    ]
  },
  {
    id: 'radarr',
    name: 'Radarr',
    icon: Film,
    metrics: [
      { label: 'Total Movies', value: 238 },
      { label: 'Missing Movies', value: 42, isDestructive: true },
      { label: 'Monitored Movies', value: 196 },
      { label: 'Total Size', value: '1.8 TB' },
      { label: 'Quality Profiles', value: 3 },
    ]
  },
  {
    id: 'prowlarr',
    name: 'Prowlarr',
    icon: Radio,
    metrics: [
      { label: 'Total Indexers', value: 24 },
      { label: 'Enabled Indexers', value: 21 },
      { label: 'Disabled Indexers', value: 3, isDestructive: true },
      { label: 'Total Searches', value: 12456 },
      { label: 'Search Success Rate', value: '92.3%' },
    ]
  },
  {
    id: 'readarr',
    name: 'Readarr Ebook',
    icon: BookOpen,
    metrics: [
      { label: 'Total Books', value: 1247 },
      { label: 'Missing Books', value: 89, isDestructive: true },
      { label: 'Monitored Books', value: 1158 },
      { label: 'Total Authors', value: 342 },
      { label: 'Total Size', value: '3.2 GB' },
    ]
  },
  {
    id: 'readarr-audiobooks',
    name: 'Readarr Audiobooks',
    icon: Headphones,
    metrics: [
      { label: 'Total Audiobooks', value: 312 },
      { label: 'Missing Audiobooks', value: 24, isDestructive: true },
      { label: 'Monitored Audiobooks', value: 288 },
      { label: 'Total Authors', value: 187 },
      { label: 'Total Size', value: '28.4 GB' },
    ]
  },
]

export function OverallStatistics({ setCurrentView, enabledModules }: OverallStatisticsProps) {
  const filteredOverallStats = overallStatsData.filter(stat => enabledModules[stat.id])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Overall Statistics</h2>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 p-0"
          onClick={() => setCurrentView('dashboard-settings')} // Navigate to dashboard settings
          title="Module Enable/Disable Settings"
        >
          <Settings className="h-4 w-4" />
          <span className="sr-only">Module Enable/Disable Settings</span>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-1 pt-3 px-3">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Combined Metrics
          </CardTitle>
          <CardDescription>
            Combined metrics for your entire media suite
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-3 px-3">
          {filteredOverallStats.length === 0 && (
            <div className="text-center py-4 text-muted-foreground text-sm">
              No module statistics to display. Enable modules in settings.
            </div>
          )}
          {filteredOverallStats.map((moduleStat, index) => (
            <div key={moduleStat.id}>
              <h3 className={`text-md font-semibold mb-2 flex items-center gap-2 ${index > 0 ? 'mt-4' : ''}`}>
                {moduleStat.icon && <moduleStat.icon className="h-4 w-4" />} {moduleStat.name}
              </h3>
              <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3 text-sm">
                {moduleStat.metrics.map((metric, metricIndex) => (
                  <div key={metricIndex} className="flex justify-between">
                    <span>{metric.label}</span>
                    <span className={`font-medium ${metric.isDestructive ? 'text-destructive' : ''}`}>
                      {metric.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
