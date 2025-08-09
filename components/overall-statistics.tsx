"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Download, Tv, Settings } from 'lucide-react'
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
