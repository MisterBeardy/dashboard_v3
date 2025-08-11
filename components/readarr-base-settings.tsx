"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Save, Download, Settings, Book, User, Calendar, HardDrive, Star } from 'lucide-react'
import { useState, useEffect } from "react"

interface ReadarrBaseSettingsProps {
  displayMode: 'table' | 'poster'
  setDisplayMode: (mode: 'table' | 'poster') => void
  serviceType: 'ebook' | 'audiobook'
  serviceIcon: React.ReactNode
  serviceTitle: string
  serviceDescription: string
}

export function ReadarrBaseSettings({ 
  displayMode, 
  setDisplayMode, 
  serviceType,
  serviceIcon,
  serviceTitle,
  serviceDescription
}: ReadarrBaseSettingsProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [settings, setSettings] = useState({
    // Display settings
    displayMode: displayMode,
    
    // Book display settings
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
    showAuthor: true,
    showYear: true,
    showPages: serviceType === 'ebook',
    showSize: true,
    showRating: true,
    
    // Service-specific settings
    showFormat: true,
    showPublisher: true,
  })

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
      localStorage.setItem(`readarr-${serviceType}-settings`, JSON.stringify(settings))
      
      console.log(`${serviceTitle} settings saved:`, settings)
    } catch (err) {
      setError(`Failed to save settings: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(`readarr-${serviceType}-settings`)
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings)
        setSettings(prev => ({
          ...prev,
          ...parsed,
          displayMode: displayMode // Always use the prop value
        }))
      }
    } catch (err) {
      console.error(`Failed to load ${serviceTitle} settings:`, err)
    }
  }, [displayMode, serviceType, serviceTitle])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          {serviceIcon}
          {serviceTitle} Settings
        </h2>
        <p className="text-muted-foreground">
          {serviceDescription}
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
            Configure how books are displayed in the {serviceTitle} dashboard
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
                id="show-monitored"
                checked={settings.showMonitoredOnly}
                onCheckedChange={(checked) => handleSettingChange('showMonitoredOnly', checked)}
              />
              <Label htmlFor="show-monitored">Show Monitored Books Only</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="show-missing"
                checked={settings.showMissingOnly}
                onCheckedChange={(checked) => handleSettingChange('showMissingOnly', checked)}
              />
              <Label htmlFor="show-missing">Show Missing Books Only</Label>
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
                  <SelectItem value="author">Author</SelectItem>
                  <SelectItem value="year">Year</SelectItem>
                  <SelectItem value="pages">Pages</SelectItem>
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
            Configure quality preferences for book downloads
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="preferred-quality">Preferred Quality</Label>
            <Input
              id="preferred-quality"
              placeholder={serviceType === 'ebook' ? "e.g., EPUB, PDF" : "e.g., MP3, M4B"}
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
            Configure which information is displayed in the book list
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="show-author"
                checked={settings.showAuthor}
                onCheckedChange={(checked) => handleSettingChange('showAuthor', checked)}
              />
              <Label htmlFor="show-author" className="flex items-center gap-1">
                <User className="h-4 w-4" />
                Show Author
              </Label>
            </div>

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

            {serviceType === 'ebook' && (
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-pages"
                  checked={settings.showPages}
                  onCheckedChange={(checked) => handleSettingChange('showPages', checked)}
                />
                <Label htmlFor="show-pages" className="flex items-center gap-1">
                  <Book className="h-4 w-4" />
                  Show Pages
                </Label>
              </div>
            )}

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
              <Label htmlFor="show-rating" className="flex items-center gap-1">
                <Star className="h-4 w-4" />
                Show Rating
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="show-format"
                checked={settings.showFormat}
                onCheckedChange={(checked) => handleSettingChange('showFormat', checked)}
              />
              <Label htmlFor="show-format">Show Format</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="show-publisher"
                checked={settings.showPublisher}
                onCheckedChange={(checked) => handleSettingChange('showPublisher', checked)}
              />
              <Label htmlFor="show-publisher">Show Publisher</Label>
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