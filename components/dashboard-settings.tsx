"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { LayoutDashboard, Save } from 'lucide-react' // Added Settings, Tv, Download
import { useState, useEffect } from "react"

export interface DashboardSettingsState {
showModuleStatus: boolean
showDownloadQueue: boolean
showSystemResources: boolean
showRecentActivity: boolean
}

interface DashboardSettingsProps {
  settings: DashboardSettingsState
  setSettings: (settings: DashboardSettingsState) => void
  enabledModules: Record<string, boolean>
  setEnabledModules: (modules: Record<string, boolean>) => void
}

const allModules = [
{ id: 'sabnzbd', name: 'SABnzbd' },
{ id: 'sonarr', name: 'Sonarr' },
// Add other modules here as they are introduced (e.g., Radarr)
]

export function DashboardSettings({ settings, setSettings, enabledModules, setEnabledModules }: DashboardSettingsProps) {
const [localSettings, setLocalSettings] = useState(settings);

useEffect(() => {
setLocalSettings(settings);
}, [settings]);

const handleSettingChange = (key: keyof DashboardSettingsState, value: boolean) => {
setLocalSettings(prev => ({ ...prev, [key]: value }));
};

const handleSave = () => {
setSettings(localSettings);
console.log("Dashboard settings saved:", localSettings);
};

const handleReset = () => {
const defaultDashboardSettings: DashboardSettingsState = {
  showModuleStatus: true,
  showDownloadQueue: true,
  showSystemResources: true,
  showRecentActivity: true,
};
setLocalSettings(defaultDashboardSettings);
setSettings(defaultDashboardSettings);

console.log("Dashboard settings reset to default.");
};

return (
<div className="space-y-4">
  <div>
    <h2 className="text-2xl font-bold tracking-tight">Dashboard Settings</h2>
    <p className="text-muted-foreground">Customize the content displayed on your main dashboard</p>
  </div>

  {/* Connection Mode (client-safe) */}
  <Card>
    <CardHeader className="pb-1 pt-3 px-3">
      <CardTitle className="flex items-center gap-2">
        Connection Mode
      </CardTitle>
      <CardDescription>How the UI connects to backend services</CardDescription>
    </CardHeader>
    <CardContent className="space-y-2 pb-3 px-3">
      <div className="space-y-1">
        <div className="text-sm text-muted-foreground">Current Mode</div>
        <div className="font-mono px-2 py-1 rounded bg-muted/50 break-all">
          {process.env.NEXT_PUBLIC_BACKEND_TARGET || '—'}
        </div>
      </div>
      <div className="text-xs text-muted-foreground space-y-1">
        <p>
          <strong>remote</strong> — All requests go through the Next.js API proxy (server). API keys and any Traefik bypass headers are injected on the server only; the browser never sees them.
        </p>
        <p>
          <strong>local</strong> — The server connects directly to your LAN services. API keys are added on the server; the browser never sees them.
        </p>
        <p className="pt-2">
          Change the connection mode by setting <code className="bg-muted px-1 py-0.5 rounded text-xs">BACKEND_TARGET=local</code> or <code className="bg-muted px-1 py-0.5 rounded text-xs">BACKEND_TARGET=remote</code> in your environment variables.
        </p>
      </div>
    </CardContent>
  </Card>

  <Card>
    <CardHeader className="pb-1 pt-3 px-3">
      <CardTitle className="flex items-center gap-2">
        <LayoutDashboard className="h-5 w-5" />
        Dashboard Sections
      </CardTitle>
      <CardDescription>
        Toggle visibility of different sections on the main dashboard
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-3 pb-3 px-3">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label className="text-sm">Module Status</Label>
          <div className="text-xs text-muted-foreground">
            Show the status and quick stats for each configured module
          </div>
        </div>
        <Switch 
          checked={localSettings.showModuleStatus}
          onCheckedChange={(checked) => handleSettingChange('showModuleStatus', checked)}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label className="text-sm">Download Queue</Label>
          <div className="text-xs text-muted-foreground">
            Display active downloads and their progress
          </div>
        </div>
        <Switch 
          checked={localSettings.showDownloadQueue}
          onCheckedChange={(checked) => handleSettingChange('showDownloadQueue', checked)}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label className="text-sm">System Resources</Label>
          <div className="text-xs text-muted-foreground">
            Show disk usage, memory, and CPU metrics
          </div>
        </div>
        <Switch 
          checked={localSettings.showSystemResources}
          onCheckedChange={(checked) => handleSettingChange('showSystemResources', checked)}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label className="text-sm">Recent Activity</Label>
          <div className="text-xs text-muted-foreground">
            Display a log of recent events across all modules
          </div>
        </div>
        <Switch 
          checked={localSettings.showRecentActivity}
          onCheckedChange={(checked) => handleSettingChange('showRecentActivity', checked)}
        />
      </div>
    </CardContent>
  </Card>

  {/* Save Settings */}
  <div className="flex justify-end gap-2">
    <Button variant="outline" className="h-9" onClick={handleReset}>Reset to Default</Button>
    <Button className="h-9" onClick={handleSave}>
      <Save className="h-4 w-4 mr-1" />
      Save Changes
    </Button>
  </div>
</div>
)
}
