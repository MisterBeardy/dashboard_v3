"use client"

import {
Sidebar,
SidebarContent,
SidebarFooter,
SidebarGroup,
SidebarGroupContent,
SidebarGroupLabel,
SidebarMenu,
SidebarMenuButton,
SidebarMenuItem,
SidebarSeparator,
SidebarHeader, // Ensure SidebarHeader is imported
} from "@/components/ui/sidebar"
import { LayoutDashboard, Tv, Film, Music, Search, Download, FileText, Settings, Palette, Server, BookOpen, ChevronDown, BarChart3, Radio, Headphones } from 'lucide-react' // FolderOpen removed, BarChart3 added
import { ViewType } from "./dashboard"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useState } from "react"

interface AppSidebarProps {
currentView: ViewType
setCurrentView: (view: ViewType) => void
selectedSettingModuleId: string | null
setSelectedSettingModuleId: (id: string | null) => void
enabledModules: Record<string, boolean> // New prop
}

const modules = [
  { id: 'sabnzbd' as ViewType, name: 'SABnzbd', icon: Download, description: 'Downloads' },
  { id: 'sonarr' as ViewType, name: 'Sonarr', icon: Tv, description: 'TV Shows' },
  { id: 'radarr' as ViewType, name: 'Radarr', icon: Film, description: 'Movies' },
  { id: 'prowlarr' as ViewType, name: 'Prowlarr', icon: Radio, description: 'Indexers' },
  { id: 'readarr' as ViewType, name: 'Readarr Ebook', icon: BookOpen, description: 'Ebooks' },
  { id: 'readarr-audiobooks' as ViewType, name: 'Readarr Audiobooks', icon: Headphones, description: 'Audiobooks' },
]

const settings = [
{ id: 'ui-settings' as ViewType, name: 'UI Settings', icon: Palette, description: 'Customize appearance' },
{ id: 'dashboard-settings' as ViewType, name: 'Dashboard Settings', icon: LayoutDashboard, description: 'Configure dashboard layout' },
]

export function AppSidebar({ currentView, setCurrentView, selectedSettingModuleId, setSelectedSettingModuleId, enabledModules }: AppSidebarProps) {
const [isModuleSettingsOpen, setIsModuleSettingsOpen] = useState(currentView === 'module-settings');

const handleModuleSettingsClick = () => {
setCurrentView('module-settings');
setIsModuleSettingsOpen(prev => !prev);
if (!isModuleSettingsOpen) {
  setSelectedSettingModuleId(null);
}
};

const handleIndividualModuleClick = (moduleId: string) => {
setCurrentView('module-settings');
setSelectedSettingModuleId(moduleId);
setIsModuleSettingsOpen(true);
};

return (
<Sidebar className="w-48">
  <SidebarHeader>
    <div className="flex items-center gap-2 px-2 py-1">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <LayoutDashboard className="h-4 w-4" />
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-semibold">Dumb Dashboard</span>
        <span className="text-xs text-muted-foreground">Media Management</span>
      </div>
    </div>
  </SidebarHeader>
  
  <SidebarContent>
    <SidebarGroup>
      <SidebarGroupLabel>Overview</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={() => {
                setCurrentView('dashboard');
                setSelectedSettingModuleId(null);
                setIsModuleSettingsOpen(false);
              }}
              isActive={currentView === 'dashboard'}
            >
              <LayoutDashboard />
              <span>Dashboard</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={() => {
                setCurrentView('overview'); // New menu item
                setSelectedSettingModuleId(null);
                setIsModuleSettingsOpen(false);
              }}
              isActive={currentView === 'overview'}
            >
              <BarChart3 />
              <span>Overall Statistics</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={() => {
                setCurrentView('logs');
                setSelectedSettingModuleId(null);
                setIsModuleSettingsOpen(false);
              }}
              isActive={currentView === 'logs'}
            >
              <FileText />
              <span>Logs</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>

    <SidebarSeparator />

    <SidebarGroup>
      <SidebarGroupLabel>Modules</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {modules.filter(module => enabledModules[module.id]).map((module) => (
            <SidebarMenuItem key={module.id}>
              <SidebarMenuButton 
                onClick={() => {
                  setCurrentView(module.id);
                  setSelectedSettingModuleId(null);
                  setIsModuleSettingsOpen(false);
                }}
                isActive={currentView === module.id}
              >
                <module.icon />
                <span>{module.name}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>

    <SidebarSeparator />

    <SidebarGroup>
      <SidebarGroupLabel>Settings</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {settings.map((setting) => (
            <SidebarMenuItem key={setting.id}>
              <SidebarMenuButton 
                onClick={() => {
                  setCurrentView(setting.id);
                  setSelectedSettingModuleId(null);
                  setIsModuleSettingsOpen(false);
                }}
                isActive={currentView === setting.id}
              >
                <setting.icon />
                <span>{setting.name}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          {/* Module Settings as a collapsible group */}
          <Collapsible open={isModuleSettingsOpen} onOpenChange={setIsModuleSettingsOpen} className="group/collapsible">
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton 
                  onClick={handleModuleSettingsClick}
                  isActive={currentView === 'module-settings'}
                >
                  <Server />
                  <span>Module Settings</span>
                  <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
            </SidebarMenuItem>
            <CollapsibleContent>
              <SidebarMenu>
                {modules.filter(module => enabledModules[module.id]).map((module) => (
                  <SidebarMenuItem key={`settings-${module.id}`}>
                    <SidebarMenuButton 
                      onClick={() => handleIndividualModuleClick(module.id)}
                      isActive={currentView === 'module-settings' && selectedSettingModuleId === module.id}
                      className="pl-8"
                    >
                      <module.icon className="h-4 w-4" />
                      <span>{module.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </CollapsibleContent>
          </Collapsible>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  </SidebarContent>

  <SidebarFooter>
    <div className="px-2 py-1 text-xs text-muted-foreground">
      v0.0.3 - Dumb Dashboard
    </div>
  </SidebarFooter>
</Sidebar>
)
}
