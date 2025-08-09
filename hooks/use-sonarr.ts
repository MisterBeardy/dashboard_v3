"use client"

import { useState, useEffect, useCallback } from 'react'
import { SonarrAPI, SonarrSeries, SonarrEpisode, SonarrCalendar, SonarrActivity } from '@/lib/api/sonarr'
import { SonarrSystemStatus, SonarrSystemHealth, SonarrDiskSpace, SonarrSystemTask, SonarrUpdateInfo } from '@/lib/api/sonarr-types'

export function useSonarr(baseUrl: string, apiKey: string) {
  // Use the API proxy route instead of direct API calls
  const [api] = useState(() => new SonarrAPI('/api/sonarr', ''))
  const [series, setSeries] = useState<SonarrSeries[]>([])
  const [episodes, setEpisodes] = useState<SonarrEpisode[]>([])
  const [calendar, setCalendar] = useState<SonarrCalendar[]>([])
  const [wanted, setWanted] = useState<SonarrEpisode[]>([])
  const [activity, setActivity] = useState<SonarrActivity | null>(null)
  const [systemStatus, setSystemStatus] = useState<SonarrSystemStatus | null>(null)
  const [systemHealth, setSystemHealth] = useState<SonarrSystemHealth[]>([])
  const [diskSpace, setDiskSpace] = useState<SonarrDiskSpace[]>([])
  const [systemTasks, setSystemTasks] = useState<SonarrSystemTask[]>([])
  const [updateInfo, setUpdateInfo] = useState<SonarrUpdateInfo | null>(null)
  const [qualityProfiles, setQualityProfiles] = useState<any[]>([])
  const [languageProfiles, setLanguageProfiles] = useState<any[]>([])
  const [rootFolders, setRootFolders] = useState<any[]>([])
  const [lookupResults, setLookupResults] = useState<SonarrSeries[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSeries = useCallback(async () => {
    try {
      setLoading(true)
      const seriesData = await api.getSeries()
      setSeries(seriesData)
      setError(null)
    } catch (err) {
      setError('Failed to fetch series')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [api])

  const fetchCalendar = useCallback(async () => {
    try {
      setLoading(true)
      const start = new Date().toISOString()
      const end = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      const calendarData = await api.getCalendar(start, end)
      setCalendar(calendarData)
      setError(null)
    } catch (err) {
      setError('Failed to fetch calendar')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [api])

  const fetchWanted = useCallback(async () => {
    try {
      setLoading(true)
      const wantedData = await api.getWanted()
      setWanted(wantedData.records)
      setError(null)
    } catch (err) {
      setError('Failed to fetch wanted episodes')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [api])

  const fetchActivity = useCallback(async () => {
    try {
      setLoading(true)
      const activityData = await api.getActivity()
      setActivity(activityData)
      setError(null)
    } catch (err) {
      setError('Failed to fetch activity')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [api])


  const seriesActions = {
    toggleMonitoring: async (seriesId: number) => {
      const seriesItem = series.find(s => s.id === seriesId)
      if (seriesItem) {
        const updated = { ...seriesItem, monitored: !seriesItem.monitored }
        await api.updateSeries(updated)
        await fetchSeries()
      }
    },
    searchSeries: async (seriesId: number) => {
      await api.searchSeason(seriesId, 0) // Search all seasons
      await fetchActivity()
    },
    deleteSeries: async (seriesId: number, deleteFiles = false) => {
      await api.deleteSeries(seriesId, deleteFiles)
      await fetchSeries()
    },
    addSeries: async (seriesData: Partial<SonarrSeries>) => {
      await api.addSeries(seriesData)
      await fetchSeries()
    },
    searchAllMissing: async () => {
      await api.searchAllMissing()
      await fetchActivity()
    }
  }

  const episodeActions = {
    toggleMonitoring: async (episodeId: number) => {
      const episode = episodes.find(e => e.id === episodeId)
      if (episode) {
        const updated = { ...episode, monitored: !episode.monitored }
        await api.updateEpisode(updated)
        await fetchWanted()
      }
    },
    searchEpisode: async (episodeId: number) => {
      await api.searchEpisode(episodeId)
      await fetchActivity()
    }
  }

  const fetchSystemStatus = useCallback(async () => {
    try {
      setLoading(true)
      const statusData = await api.getSystemStatus()
      setSystemStatus(statusData)
      setError(null)
    } catch (err) {
      setError('Failed to fetch system status')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [api])

  const fetchSystemHealth = useCallback(async () => {
    try {
      setLoading(true)
      const healthData = await api.getSystemHealth()
      setSystemHealth(healthData)
      setError(null)
    } catch (err) {
      setError('Failed to fetch system health')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [api])

  const fetchDiskSpace = useCallback(async () => {
    try {
      setLoading(true)
      const diskSpaceData = await api.getDiskSpace()
      setDiskSpace(diskSpaceData)
      setError(null)
    } catch (err) {
      setError('Failed to fetch disk space')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [api])

  const fetchSystemTasks = useCallback(async () => {
    try {
      setLoading(true)
      const tasksData = await api.getSystemTasks()
      setSystemTasks(tasksData)
      setError(null)
    } catch (err) {
      setError('Failed to fetch system tasks')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [api])

  const fetchUpdateInfo = useCallback(async () => {
    try {
      setLoading(true)
      const updateData = await api.getUpdateInfo()
      setUpdateInfo(updateData)
      setError(null)
    } finally {
      setLoading(false)
    }
  }, [api])

  // New: catalogs
  const fetchQualityProfiles = useCallback(async () => {
    try {
      setLoading(true)
      const data = await api.getQualityProfiles()
      setQualityProfiles(Array.isArray(data) ? data : [])
      setError(null)
    } catch (err) {
      setError('Failed to fetch quality profiles')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [api])

  const fetchLanguageProfiles = useCallback(async () => {
    try {
      setLoading(true)
      const data = await api.getLanguageProfiles()
      setLanguageProfiles(Array.isArray(data) ? data : [])
      setError(null)
    } catch (err) {
      setError('Failed to fetch language profiles')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [api])

  const fetchRootFolders = useCallback(async () => {
    try {
      setLoading(true)
      const data = await api.getRootFolders()
      setRootFolders(Array.isArray(data) ? data : [])
      setError(null)
    } catch (err) {
      setError('Failed to fetch root folders')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [api])

  // New: series lookup passthrough
  const lookupSeries = useCallback(async (term: string) => {
    try {
      setLoading(true)
      const results = await api.searchSeries(term)
      setLookupResults(Array.isArray(results) ? results : [])
      setError(null)
      return Array.isArray(results) ? results : []
    } catch (err) {
      setError('Failed to lookup series')
      console.error(err)
      return []
    } finally {
      setLoading(false)
    }
  }, [api])

  // Auto-refresh every 30 seconds for series list
  useEffect(() => {
    fetchSeries()
    const interval = setInterval(fetchSeries, 30000)
    return () => clearInterval(interval)
  }, [fetchSeries])

  return {
    series,
    episodes,
    calendar,
    wanted,
    activity,
    systemStatus,
    systemHealth,
    diskSpace,
    systemTasks,
    updateInfo,
    qualityProfiles,
    languageProfiles,
    rootFolders,
    lookupResults,
    loading,
    error,
    actions: {
      series: seriesActions,
      episodes: episodeActions,
      // convenience top-levels
      searchAllMissing: seriesActions.searchAllMissing,
      lookupSeries,
    },
    fetch: {
      series: fetchSeries,
      calendar: fetchCalendar,
      wanted: fetchWanted,
      activity: fetchActivity,
      systemStatus: fetchSystemStatus,
      systemHealth: fetchSystemHealth,
      diskSpace: fetchDiskSpace,
      systemTasks: fetchSystemTasks,
      updateInfo: fetchUpdateInfo,
      qualityProfiles: fetchQualityProfiles,
      languageProfiles: fetchLanguageProfiles,
      rootFolders: fetchRootFolders,
    },
    api
  }
}
