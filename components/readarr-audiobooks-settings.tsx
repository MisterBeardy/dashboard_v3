"use client"

import { Headphones } from 'lucide-react'
import { ReadarrBaseSettings } from './readarr-base-settings'

interface ReadarrAudiobooksSettingsProps {
  displayMode: 'table' | 'poster'
  setDisplayMode: (mode: 'table' | 'poster') => void
}

export function ReadarrAudiobooksSettings({ displayMode, setDisplayMode }: ReadarrAudiobooksSettingsProps) {
  return (
    <ReadarrBaseSettings
      displayMode={displayMode}
      setDisplayMode={setDisplayMode}
      serviceType="audiobook"
      serviceIcon={<Headphones className="h-6 w-6" />}
      serviceTitle="Readarr Audiobooks"
      serviceDescription="Configure your Readarr Audiobooks management preferences and display options"
    />
  )
}