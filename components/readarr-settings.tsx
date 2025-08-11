"use client"

import { BookOpen } from 'lucide-react'
import { ReadarrBaseSettings } from './readarr-base-settings'

interface ReadarrEbookSettingsProps {
  displayMode: 'table' | 'poster'
  setDisplayMode: (mode: 'table' | 'poster') => void
}

export function ReadarrSettings({ displayMode, setDisplayMode }: ReadarrEbookSettingsProps) {
  return (
    <ReadarrBaseSettings
      displayMode={displayMode}
      setDisplayMode={setDisplayMode}
      serviceType="ebook"
      serviceIcon={<BookOpen className="h-6 w-6" />}
      serviceTitle="Readarr Ebook"
      serviceDescription="Configure your Readarr Ebook management preferences and display options"
    />
  )
}