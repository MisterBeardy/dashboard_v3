"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Save, Download, Settings, Film, Calendar, Clock, HardDrive } from 'lucide-react'
import { useState, useEffect } from "react"
import { useRadarr } from "@/hooks/use-radarr"

interface RadarrSettingsProps {
  displayMode: 'table' | 'poster'
  setDisplayMode: (mode: 'table' | 'poster') => void
}

export function RadarrSettings({ displayMode, setDisplayMode }: RadarrSettingsProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [settings, setSettings] = useState({
    // Display settings
    displayMode: displayMode,
    
    // Movie display settings
    showMonitoredOnly: false,
    showMissingOnly: false,
    sortBy: 'title',
    sortOrder: 'asc',
    
    // Quality settings
    preferredQuality: '',
    upgradeAllowed: true,
    
    // Download settings
    downloadPropersAndRepacks: true,
    delayProfile: 0,
    
    // Interface settings
    showYear: true,
    showRuntime: true,
    showSize: true,
    showRating: true,
  })

  const radarr = useRadarr({ enabled: true })

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
      localStorage.setItem('radarr-settings', JSON.stringify(settings))
      
      console.log('Radarr settings saved:', settings)
    } catch (err) {
      setError(`Failed to save settings: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('radarr-settings')
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings)
        setSettings(prev => ({
          ...prev,
          ...parsed,
          displayMode: displayMode // Always use the prop value
        }))
      }
    } catch (err) {
      console.error('Failed to load Radarr settings:', err)
    }
  }, [displayMode])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Film className="h-6 w-6" />
          Radarr Settings
        </h2>
        <p className="text-muted-foreground">
          Configure your Radarr movie management preferences and display options
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
            Configure how movies are displayed in the Radarr dashboard
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
                <SelectItem value="poster">Poster View</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="show-monitored"
                checked={settings.showMonitoredOnly}
                onCheckedChange={(checked) => handleSettingChange('showMonitoredOnly', checked)}
              />
              <Label htmlFor="show-monitored">Show Monitored Movies Only</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="show-missing"
                checked={settings.showMissingOnly}
                onCheckedChange={(checked) => handleSettingChange('showMissingOnly', checked)}
              />
              <Label htmlFor="show-missing">Show Missing Movies Only</Label>
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
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="year">Year</SelectItem>
                  <SelectItem value="runtime">Runtime</SelectItem>
                  <SelectItem value="size">Size</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="added">Date Added</SelectItem>
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

      {/* Quality Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Quality Settings
          </CardTitle>
          <CardDescription>
            Configure quality preferences for movie downloads
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="preferred-quality">Preferred Quality</Label>
            <Input
              id="preferred-quality"
              placeholder="e.g., 1080p BluRay"
              value={settings.preferredQuality}
              onChange={(e) => handleSettingChange('preferredQuality', e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="upgrade-allowed"
              checked={settings.upgradeAllowed}
              onCheckedChange={(checked) => handleSettingChange('upgradeAllowed', checked)}
            />
            <Label htmlFor="upgrade-allowed">Allow Quality Upgrades</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="download-propers"
              checked={settings.downloadPropersAndRepacks}
              onCheckedChange={(checked) => handleSettingChange('downloadPropersAndRepacks', checked)}
            />
            <Label htmlFor="download-propers">Download Propers and Repacks</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="delay-profile">Download Delay (minutes)</Label>
            <Input
              id="delay-profile"
              type="number"
              min="0"
              value={settings.delayProfile}
              onChange={(e) => handleSettingChange('delayProfile', parseInt(e.target.value) || 0)}
            />
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
            Configure which information is displayed in the movie list
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="show-year"
                checked={settings.showYear}
                onCheckedChange={(checked) => handleSettingChange('showYear', checked)}
              />
              <Label htmlFor="show-year" className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Show Year
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="show-runtime"
                checked={settings.showRuntime}
                onCheckedChange={(checked) => handleSettingChange('showRuntime', checked)}
              />
              <Label htmlFor="show-runtime" className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Show Runtime
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="show-size"
                checked={settings.showSize}
                onCheckedChange={(checked) => handleSettingChange('showSize', checked)}
              />
              <Label htmlFor="show-size" className="flex items-center gap-1">
                <HardDrive className="h-4 w-4" />
                Show Size
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="show-rating"
                checked={settings.showRating}
                onCheckedChange={(checked) => handleSettingChange('showRating', checked)}
              />
              <Label htmlFor="show-rating">Show Rating</Label>
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