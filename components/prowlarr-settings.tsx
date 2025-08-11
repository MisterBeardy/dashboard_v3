"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Save, Download, Settings, Search, Zap, Database, Globe } from 'lucide-react'
import { useState, useEffect } from "react"
import { useProwlarr } from "@/hooks/use-prowlarr"

interface ProwlarrSettingsProps {
  displayMode: 'table' | 'poster'
  setDisplayMode: (mode: 'table' | 'poster') => void
}

export function ProwlarrSettings({ displayMode, setDisplayMode }: ProwlarrSettingsProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [settings, setSettings] = useState({
    // Display settings
    displayMode: displayMode,
    
    // Indexer display settings
    showEnabledOnly: false,
    showTestedOnly: false,
    sortBy: 'name',
    sortOrder: 'asc',
    
    // Search settings
    searchDelay: 0,
    retryDelay: 60,
    
    // Download client settings
    preferredProtocol: 'torrent',
    enableRss: true,
    enableAutomaticSearch: true,
    enableInteractiveSearch: true,
    
    // Interface settings
    showLastSearch: true,
    showNextSearch: true,
    showResponseTime: true,
    showSuccessRate: true,
  })

  const prowlarr = useProwlarr({ enabled: true })

  // Update local settings when displayMode prop changes
  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      displayMode
    }))
  }, [displayMode])

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const saveSettings = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Update display mode in parent component
      setDisplayMode(settings.displayMode)
      
      // Save other settings to localStorage or backend
      localStorage.setItem('prowlarr-settings', JSON.stringify(settings))
      
      console.log('Prowlarr settings saved:', settings)
    } catch (err) {
      setError(`Failed to save settings: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('prowlarr-settings')
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings)
        setSettings(prev => ({
          ...prev,
          ...parsed,
          displayMode: displayMode // Always use the prop value
        }))
      }
    } catch (err) {
      console.error('Failed to load Prowlarr settings:', err)
    }
  }, [displayMode])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Search className="h-6 w-6" />
          Prowlarr Settings
        </h2>
        <p className="text-muted-foreground">
          Configure your Prowlarr indexer management and search preferences
        </p>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-700">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Display Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Display Settings
          </CardTitle>
          <CardDescription>
            Configure how indexers are displayed in the Prowlarr dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="display-mode">Display Mode</Label>
            <Select
              value={settings.displayMode}
              onValueChange={(value: 'table' | 'poster') => handleSettingChange('displayMode', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select display mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="table">Table View</SelectItem>
                <SelectItem value="poster">Card View</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="show-enabled"
                checked={settings.showEnabledOnly}
                onCheckedChange={(checked) => handleSettingChange('showEnabledOnly', checked)}
              />
              <Label htmlFor="show-enabled">Show Enabled Indexers Only</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="show-tested"
                checked={settings.showTestedOnly}
                onCheckedChange={(checked) => handleSettingChange('showTestedOnly', checked)}
              />
              <Label htmlFor="show-tested">Show Tested Indexers Only</Label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sort-by">Sort By</Label>
              <Select
                value={settings.sortBy}
                onValueChange={(value) => handleSettingChange('sortBy', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sort field" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                  <SelectItem value="lastSearch">Last Search</SelectItem>
                  <SelectItem value="nextSearch">Next Search</SelectItem>
                  <SelectItem value="responseTime">Response Time</SelectItem>
                  <SelectItem value="successRate">Success Rate</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sort-order">Sort Order</Label>
              <Select
                value={settings.sortOrder}
                onValueChange={(value) => handleSettingChange('sortOrder', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sort order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Ascending</SelectItem>
                  <SelectItem value="desc">Descending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Search Settings
          </CardTitle>
          <CardDescription>
            Configure search behavior and timing for indexers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search-delay">Search Delay (seconds)</Label>
              <Input
                id="search-delay"
                type="number"
                min="0"
                value={settings.searchDelay}
                onChange={(e) => handleSettingChange('searchDelay', parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="retry-delay">Retry Delay (seconds)</Label>
              <Input
                id="retry-delay"
                type="number"
                min="0"
                value={settings.retryDelay}
                onChange={(e) => handleSettingChange('retryDelay', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="enable-rss"
                checked={settings.enableRss}
                onCheckedChange={(checked) => handleSettingChange('enableRss', checked)}
              />
              <Label htmlFor="enable-rss">Enable RSS</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="enable-auto-search"
                checked={settings.enableAutomaticSearch}
                onCheckedChange={(checked) => handleSettingChange('enableAutomaticSearch', checked)}
              />
              <Label htmlFor="enable-auto-search">Enable Automatic Search</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="enable-interactive-search"
                checked={settings.enableInteractiveSearch}
                onCheckedChange={(checked) => handleSettingChange('enableInteractiveSearch', checked)}
              />
              <Label htmlFor="enable-interactive-search">Enable Interactive Search</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Download Client Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Download Client Settings
          </CardTitle>
          <CardDescription>
            Configure download client preferences for search results
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="preferred-protocol">Preferred Protocol</Label>
            <Select
              value={settings.preferredProtocol}
              onValueChange={(value) => handleSettingChange('preferredProtocol', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select protocol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="torrent">Torrent</SelectItem>
                <SelectItem value="usenet">Usenet</SelectItem>
                <SelectItem value="any">Any</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Interface Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Interface Settings
          </CardTitle>
          <CardDescription>
            Configure which information is displayed in the indexer list
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="show-last-search"
                checked={settings.showLastSearch}
                onCheckedChange={(checked) => handleSettingChange('showLastSearch', checked)}
              />
              <Label htmlFor="show-last-search" className="flex items-center gap-1">
                <Database className="h-4 w-4" />
                Show Last Search
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="show-next-search"
                checked={settings.showNextSearch}
                onCheckedChange={(checked) => handleSettingChange('showNextSearch', checked)}
              />
              <Label htmlFor="show-next-search" className="flex items-center gap-1">
                <Database className="h-4 w-4" />
                Show Next Search
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="show-response-time"
                checked={settings.showResponseTime}
                onCheckedChange={(checked) => handleSettingChange('showResponseTime', checked)}
              />
              <Label htmlFor="show-response-time" className="flex items-center gap-1">
                <Zap className="h-4 w-4" />
                Show Response Time
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="show-success-rate"
                checked={settings.showSuccessRate}
                onCheckedChange={(checked) => handleSettingChange('showSuccessRate', checked)}
              />
              <Label htmlFor="show-success-rate" className="flex items-center gap-1">
                <Globe className="h-4 w-4" />
                Show Success Rate
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={saveSettings} disabled={loading} className="h-9">
          <Save className="h-4 w-4 mr-1" />
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  )
}