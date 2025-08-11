"use client"

import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { MainDashboard } from "@/components/main-dashboard"
import { ModuleSettings } from "@/components/module-settings"
import { UISettings } from "@/components/ui-settings"
import { LogViewer } from "@/components/log-viewer"
import { ModuleDetail } from "@/components/module-detail"
import { useState } from "react"
import { SABnzbdDashboard } from "@/components/sabnzbd-dashboard"
import { SonarrDashboard } from "@/components/sonarr-dashboard"
import { RadarrDashboard } from "@/components/radarr-dashboard"
import { ProwlarrDashboard } from "@/components/prowlarr-dashboard"
import { ReadarrDashboard } from "@/components/readarr-dashboard"
import { ReadarrAudiobooksDashboard } from "@/components/readarr-audiobooks-dashboard"
import { DashboardSettings, type DashboardSettingsState } from "@/components/dashboard-settings"
import { OverallStatistics } from "@/components/overall-statistics" // New import
import { hexToHsl } from "@/lib/utils" // Import hexToHsl

export type ViewType = 'dashboard' | 'sabnzbd' | 'sonarr' | 'radarr' | 'prowlarr' | 'readarr' | 'readarr-audiobooks' | 'logs' | 'ui-settings' | 'module-settings' | 'dashboard-settings' | 'overview' // New ViewType

export function Dashboard() {
const [currentView, setCurrentView] = useState<ViewType>('dashboard')
const [primaryHexColor, setPrimaryHexColor] = useState('#3b82f6') // Changed to primaryHexColor, default blue
const [moduleDisplayModes, setModuleDisplayModes] = useState<Record<string, 'table' | 'poster'>>({
  sabnzbd: 'table',
  sonarr: 'table',
  radarr: 'table',
  prowlarr: 'table',
  readarr: 'table',
  'readarr-audiobooks': 'table',
})
const [selectedSettingModuleId, setSelectedSettingModuleId] = useState<string | null>(null)
const [dashboardSettings, setDashboardSettings] = useState<DashboardSettingsState>({
  showModuleStatus: true,
  showDownloadQueue: true,
  showSystemResources: true,
  showRecentActivity: true,
})
const [enabledModules, setEnabledModules] = useState<Record<string, boolean>>({ // New state for global module enable/disable
  sabnzbd: true,
  sonarr: true,
  radarr: true,
  prowlarr: true,
  readarr: true,
  'readarr-audiobooks': true,
})

const renderContent = () => {
  switch (currentView) {
    case 'dashboard':
      return <MainDashboard 
               settings={dashboardSettings} 
               setCurrentView={setCurrentView}
               setSelectedSettingModuleId={setSelectedSettingModuleId}
               enabledModules={enabledModules} // Pass enabledModules
             />
    case 'overview': // New case
      return <OverallStatistics setCurrentView={setCurrentView} enabledModules={enabledModules} />
    case 'sabnzbd':
      return <SABnzbdDashboard displayMode={moduleDisplayModes.sabnzbd} />
    case 'sonarr':
      return <SonarrDashboard displayMode={moduleDisplayModes.sonarr} />
    case 'radarr':
      return <RadarrDashboard displayMode={moduleDisplayModes.radarr} />
    case 'prowlarr':
      return <ProwlarrDashboard displayMode={moduleDisplayModes.prowlarr} />
    case 'readarr':
      return <ReadarrDashboard displayMode={moduleDisplayModes.readarr} />
    case 'readarr-audiobooks':
      return <ReadarrAudiobooksDashboard displayMode={moduleDisplayModes['readarr-audiobooks']} />
    case 'logs':
      return <LogViewer />
    case 'ui-settings':
      return <UISettings primaryHexColor={primaryHexColor} setPrimaryHexColor={setPrimaryHexColor} />
    case 'module-settings':
      return <ModuleSettings 
               moduleDisplayModes={moduleDisplayModes} 
               setModuleDisplayModes={setModuleDisplayModes} 
               selectedModuleId={selectedSettingModuleId}
             />
    case 'dashboard-settings':
      return <DashboardSettings 
               settings={dashboardSettings} 
               setSettings={setDashboardSettings} 
               enabledModules={enabledModules} // Pass enabledModules
               setEnabledModules={setEnabledModules} // Pass setEnabledModules
             />
    default:
      return <MainDashboard 
               settings={dashboardSettings} 
               setCurrentView={setCurrentView} 
               setSelectedSettingModuleId={setSelectedSettingModuleId} 
               enabledModules={enabledModules} // Pass enabledModules
             />
  }
}

return (
  <div className={`theme-custom`} style={{
    '--primary': hexToHsl(primaryHexColor) || '221.2 83.2% 53.3%', // Use hexToHsl
  } as React.CSSProperties}>
    <SidebarProvider>
      <AppSidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        selectedSettingModuleId={selectedSettingModuleId}
        setSelectedSettingModuleId={setSelectedSettingModuleId}
        enabledModules={enabledModules} // Pass enabledModules
      />
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-4">
          {renderContent()}
        </div>
      </SidebarInset>
    </SidebarProvider>
  </div>
)
}
