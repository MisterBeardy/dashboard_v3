"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, Tv, Download, Settings } from 'lucide-react'
import { useState, useEffect } from "react"


type DisplayMode = 'table' | 'poster';
interface ModuleConfig {
  id: string;
  name: string;
  icon: typeof Download | typeof Tv;
  displayMode: DisplayMode;
}

const KNOWN_MODULES: Array<{ id: string; name: string; icon: typeof Download | typeof Tv }> = [
  { id: 'sabnzbd', name: 'SABnzbd', icon: Download },
  { id: 'sonarr', name: 'Sonarr', icon: Tv },
  { id: 'radarr', name: 'Radarr', icon: Download },
  { id: 'prowlarr', name: 'Prowlarr', icon: Download },
  { id: 'readarr', name: 'Readarr', icon: Download },
  { id: 'readarr-audiobooks', name: 'Readarr Audiobooks', icon: Download },
]

const PROXY_ENDPOINTS: Record<string, string> = {
  sabnzbd: '/api/sab',
  sonarr: '/api/sonarr',
  radarr: '/api/radarr',
  prowlarr: '/api/prowlarr',
  readarr: '/api/readarr',
  'readarr-audiobooks': '/api/readarr-audiobooks',
}

interface ModuleSettingsProps {
  moduleDisplayModes: Record<string, 'table' | 'poster'>
  setModuleDisplayModes: (modes: Record<string, 'table' | 'poster'>) => void
  selectedModuleId: string | null // New prop to indicate which module to display
}

export function ModuleSettings({ moduleDisplayModes, setModuleDisplayModes, selectedModuleId }: ModuleSettingsProps) {
  const [moduleConfigs, setModuleConfigs] = useState<ModuleConfig[]>(
    KNOWN_MODULES.map(m => ({
      id: m.id,
      name: m.name,
      icon: m.icon,
      displayMode: (moduleDisplayModes[m.id] as DisplayMode) || 'table',
    }))
  )

  // Update moduleConfigs when moduleDisplayModes changes from parent
  useEffect(() => {
    setModuleConfigs(
      KNOWN_MODULES.map(m => ({
        id: m.id,
        name: m.name,
        icon: m.icon,
        displayMode: (moduleDisplayModes[m.id] as DisplayMode) || 'table',
      }))
    )
  }, [moduleDisplayModes])

  const updateModule = (id: string, updates: Partial<ModuleConfig>) => {
    setModuleConfigs(prev =>
      prev.map(module => {
        if (module.id !== id) return module;
        // If displayMode is being updated, ensure it is a valid DisplayMode
        if (updates.displayMode && updates.displayMode !== 'table' && updates.displayMode !== 'poster') {
          return module;
        }
        return { ...module, ...updates };
      })
    );
  }


  const saveSettings = () => {
    const newDisplayModes: Record<string, 'table' | 'poster'> = {}
    moduleConfigs.forEach(config => {
      newDisplayModes[config.id] = config.displayMode
    })
    setModuleDisplayModes(newDisplayModes as Record<string, 'table' | 'poster'>)
    console.log('Saved module display modes:', newDisplayModes)
  }

  const resolvedModule = (() => {
    if (!selectedModuleId) return null
    const known = moduleConfigs.find(m => m.id === selectedModuleId)
    if (known) return known
    const name = selectedModuleId
      .split('-')
      .map(s => s.charAt(0).toUpperCase() + s.slice(1))
      .join(' ')
    const displayMode = (moduleDisplayModes[selectedModuleId] as DisplayMode) || 'table'
    return { id: selectedModuleId, name, icon: Download, displayMode } as ModuleConfig
  })()

  const connectionMode = process.env.NEXT_PUBLIC_BACKEND_TARGET || '—'
  const proxyEndpoint = resolvedModule ? (PROXY_ENDPOINTS[resolvedModule.id] || `/api/${resolvedModule.id}`) : '—'
  const upstreamTarget = connectionMode === 'remote' ? 'remote service' : 'local service'
  const traefikStatus = connectionMode === 'remote' ? 'active (server-proxied)' : 'not used (local mode)'

  return (
    <div className="space-y-4">
      {!selectedModuleId ? (
        // Prompt to select a module if none is selected
        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center">
          <Settings className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold tracking-tight">Module Settings</h2>
          <p className="text-muted-foreground max-w-md">
            Select a module from the "Module Settings" section in the sidebar to configure its specific settings.
          </p>
        </div>
      ) : (
        // Display individual module settings
        <>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{resolvedModule?.name} Settings</h2>
            <p className="text-muted-foreground">Client-safe connection overview and display preferences</p>
          </div>

          <Card>
            <CardHeader className="pb-1 pt-3 px-3">
              <CardTitle className="flex items-center gap-2">
                {resolvedModule?.icon && <resolvedModule.icon className="h-5 w-5" />}
                {resolvedModule?.name} Configuration
              </CardTitle>
              <CardDescription>
                Read-only connection info with per-module display mode
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pb-3 px-3">
              {/* Client-safe connection overview */}
              <div className="grid gap-2 sm:grid-cols-2 text-sm">
                <div className="space-y-1">
                  <div className="text-muted-foreground">Connection Mode</div>
                  <div className="font-mono px-2 py-1 rounded bg-muted/50 break-all">
                    {connectionMode}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground">Proxy Endpoint</div>
                  <div className="font-mono px-2 py-1 rounded bg-muted/50 break-all">
                    {proxyEndpoint}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground">Upstream Target</div>
                  <div className="font-mono px-2 py-1 rounded bg-muted/50 break-all">
                    {upstreamTarget}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground">Traefik Status</div>
                  <div className="font-mono px-2 py-1 rounded bg-muted/50 break-all">
                    {traefikStatus}
                  </div>
                </div>
              </div>
 
              {/* Display Mode (per-module, client-side preference) */}
              <div className="space-y-1">
                <Label htmlFor={`${resolvedModule?.id}-display-mode`} className="text-sm">Display Mode</Label>
                <Select
                  value={resolvedModule?.displayMode || 'table'}
                  onValueChange={(value: 'table' | 'poster') => resolvedModule && updateModule(resolvedModule.id, { displayMode: value })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select display mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="table">Table View</SelectItem>
                    <SelectItem value="poster">Poster View</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Save display modes */}
      <div className="flex justify-end gap-2">
        <Button onClick={saveSettings} className="h-9">
          <Save className="h-4 w-4 mr-1" />
          Save Display Preferences
        </Button>
      </div>
    </div>
  )
}
