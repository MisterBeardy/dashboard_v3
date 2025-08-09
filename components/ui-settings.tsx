"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Palette, Monitor, Save } from 'lucide-react'
import { useState, useEffect } from "react"

interface UISettingsProps {
  primaryHexColor: string
  setPrimaryHexColor: (color: string) => void
}

const predefinedColors = [
  { id: 'blue', name: 'Blue', hex: '#3b82f6' },
  { id: 'green', name: 'Green', hex: '#22c55e' },
  { id: 'purple', name: 'Purple', hex: '#8b5cf6' },
  { id: 'orange', name: 'Orange', hex: '#f97316' },
  { id: 'red', name: 'Red', hex: '#ef4444' },
]

export function UISettings({ primaryHexColor, setPrimaryHexColor }: UISettingsProps) {
  const [selectedColorOption, setSelectedColorOption] = useState<string>('');
  const [customHexColor, setCustomHexColor] = useState(primaryHexColor);

  useEffect(() => {
    // Determine which option is currently selected based on the primaryHexColor prop
    const foundPredefined = predefinedColors.find(c => c.hex === primaryHexColor);
    if (foundPredefined) {
      setSelectedColorOption(foundPredefined.id);
    } else {
      setSelectedColorOption('custom');
      setCustomHexColor(primaryHexColor);
    }
  }, [primaryHexColor]);

  const handlePredefinedColorClick = (hex: string, id: string) => {
    setSelectedColorOption(id);
    setPrimaryHexColor(hex); // Update parent state immediately for predefined colors
  };

  const handleCustomOptionClick = () => {
    setSelectedColorOption('custom');
  };

  const handleSaveCustomColor = () => {
    setPrimaryHexColor(customHexColor);
    console.log("Custom UI settings saved:", customHexColor);
  };

  const handleReset = () => {
    const defaultHex = '#3b82f6'; // Default blue color
    setSelectedColorOption('blue');
    setCustomHexColor(defaultHex);
    setPrimaryHexColor(defaultHex);
    console.log("UI settings reset to default.");
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">UI Settings</h2>
        <p className="text-muted-foreground">Customize the appearance of your dashboard</p>
      </div>

      {/* Primary Color Selection */}
      <Card>
        <CardHeader className="pb-1 pt-3 px-3">
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Primary Color
          </CardTitle>
          <CardDescription>
            Choose your preferred primary color for the dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-3 px-3">
          <div className="grid gap-2 md:grid-cols-3 lg:grid-cols-6">
            {predefinedColors.map((colorTheme) => (
              <div
                key={colorTheme.id}
                className={`relative cursor-pointer rounded-lg border-2 p-2.5 transition-colors ${
                  selectedColorOption === colorTheme.id ? 'border-primary' : 'border-muted'
                }`}
                onClick={() => handlePredefinedColorClick(colorTheme.hex, colorTheme.id)}
              >
                <div className="flex items-center gap-2">
                  <div className={`h-5 w-5 rounded-full`} style={{ backgroundColor: colorTheme.hex }} />
                  <span className="font-medium text-sm">{colorTheme.name}</span>
                </div>
                {selectedColorOption === colorTheme.id && (
                  <div className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
                )}
              </div>
            ))}
            {/* Custom Color Option */}
            <div
              className={`relative cursor-pointer rounded-lg border-2 p-2.5 transition-colors ${
                selectedColorOption === 'custom' ? 'border-primary' : 'border-muted'
              }`}
              onClick={handleCustomOptionClick}
            >
              <div className="flex items-center gap-2">
                <div className={`h-5 w-5 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500`} />
                <span className="font-medium text-sm">Custom</span>
              </div>
              {selectedColorOption === 'custom' && (
                <div className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
              )}
            </div>
          </div>

          {selectedColorOption === 'custom' && (
            <div className="mt-4 space-y-1">
              <Label htmlFor="custom-color-picker" className="text-sm">Pick Custom Color</Label>
              <Input
                id="custom-color-picker"
                type="color"
                value={customHexColor}
                onChange={(e) => setCustomHexColor(e.target.value)}
                className="h-10 w-full cursor-pointer"
              />
              <div className="text-xs text-muted-foreground mt-1">
                Selected custom color: <span className="font-mono">{customHexColor}</span>
              </div>
              <Button className="h-9 mt-2" onClick={handleSaveCustomColor}>
                <Save className="h-4 w-4 mr-1" />
                Apply Custom Color
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Display Settings */}
      <Card>
        <CardHeader className="pb-1 pt-3 px-3">
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Display Settings
          </CardTitle>
          <CardDescription>
            Configure display preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pb-3 px-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm">Dark Mode</Label>
              <div className="text-xs text-muted-foreground">
                Switch between light and dark themes
              </div>
            </div>
            <Switch />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm">Compact Mode</Label>
              <div className="text-xs text-muted-foreground">
                Reduce spacing and padding for more content
              </div>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm">Auto-refresh</Label>
              <div className="text-xs text-muted-foreground">
                Automatically refresh data every 30 seconds
              </div>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm">Show Notifications</Label>
              <div className="text-xs text-muted-foreground">
                Display system notifications and alerts
              </div>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Layout Settings */}
      <Card>
        <CardHeader className="pb-1 pt-3 px-3">
          <CardTitle className="flex items-center gap-2">
            Layout Preferences
          </CardTitle>
          <CardDescription>
            Customize the dashboard layout
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pb-3 px-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm">Sidebar Auto-collapse</Label>
              <div className="text-xs text-muted-foreground">
                Automatically collapse sidebar on smaller screens
              </div>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm">Show Module Icons</Label>
              <div className="text-xs text-muted-foreground">
                Display icons next to module names
              </div>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm">Dense Information</Label>
              <div className="text-xs text-muted-foreground">
                Show more information in cards and tables
              </div>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Save Settings */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" className="h-9" onClick={handleReset}>Reset to Default</Button>
        {selectedColorOption !== 'custom' && ( // Only show Save Changes if not custom, as custom has its own apply button
          <Button className="h-9" onClick={handleSaveCustomColor}>
            <Save className="h-4 w-4 mr-1" />
            Save Changes
          </Button>
        )}
      </div>
    </div>
  )
}
