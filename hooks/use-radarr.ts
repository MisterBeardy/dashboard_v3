import { useState, useEffect, useCallback } from 'react'
import { RadarrAPI } from '@/lib/api/radarr'
import {
  RadarrMovie,
  RadarrQueue,
  RadarrHistory,
  RadarrSystemStatus,
  RadarrSystemHealth,
  RadarrCommand,
  RadarrWantedMissing,
  RadarrDiskSpace,
  RadarrQualityProfile,
  RadarrUpdateInfo,
  RadarrSystemTask,
  RadarrQueueRecord,
  RadarrHistoryRecord
} from '@/lib/api/radarr-types'

interface UseRadarrProps {
  enabled?: boolean
  apiUrl?: string
  apiKey?: string
}

interface UseRadarrReturn {
  // Data
  movies: RadarrMovie[]
  queue: RadarrQueue
  history: RadarrHistory
  systemStatus: RadarrSystemStatus | null
  systemHealth: RadarrSystemHealth[]
  systemTasks: RadarrCommand[]
  updateInfo: RadarrUpdateInfo | null
  wantedMissing: RadarrWantedMissing
  diskSpace: RadarrDiskSpace[]
  qualityProfiles: RadarrQualityProfile[]
  rootFolders: any[]
  tags: any[]
  
  // Actions
  actions: {
    refreshAll: () => Promise<void>
    movies: {
      toggleMonitor: (id: number) => Promise<void>
      searchMovie: (id: number) => Promise<void>
      deleteMovie: (id: number, deleteFiles?: boolean) => Promise<void>
      addMovie: (movie: any) => Promise<void>
      editMovie: (movie: any) => Promise<void>
    }
    queue: {
      removeQueueItem: (id: number, blacklist?: boolean) => Promise<void>
      grabQueueItem: (id: number) => Promise<void>
    }
    system: {
      refreshSystemStatus: () => Promise<void>
      refreshSystemHealth: () => Promise<void>
      refreshSystemTasks: () => Promise<void>
      refreshUpdateInfo: () => Promise<void>
      executeCommand: (commandName: string, params?: any) => Promise<void>
    }
    wanted: {
      refreshWantedMissing: () => Promise<void>
    }
    lookupMovie: (term: string) => Promise<any[]>
  }
  
  // Fetch methods
  fetch: {
    movies: () => Promise<void>
    queue: () => Promise<void>
    history: () => Promise<void>
    systemStatus: () => Promise<void>
    systemHealth: () => Promise<void>
    systemTasks: () => Promise<void>
    updateInfo: () => Promise<void>
    wantedMissing: () => Promise<void>
    diskSpace: () => Promise<void>
    qualityProfiles: () => Promise<void>
    rootFolders: () => Promise<void>
    tags: () => Promise<void>
  }
  
  // State
  loading: boolean
  error: string | null
}

export function useRadarr({ enabled = true, apiUrl, apiKey }: UseRadarrProps = {}): UseRadarrReturn {
  const [movies, setMovies] = useState<RadarrMovie[]>([])
  const [queue, setQueue] = useState<RadarrQueue>({ page: 0, pageSize: 0, sortKey: '', sortDirection: '', totalRecords: 0, records: [] })
  const [history, setHistory] = useState<RadarrHistory>({ page: 0, pageSize: 0, sortKey: '', sortDirection: '', totalRecords: 0, records: [] })
  const [systemStatus, setSystemStatus] = useState<RadarrSystemStatus | null>(null)
  const [systemHealth, setSystemHealth] = useState<RadarrSystemHealth[]>([])
  const [systemTasks, setSystemTasks] = useState<RadarrCommand[]>([])
  const [updateInfo, setUpdateInfo] = useState<RadarrUpdateInfo | null>(null)
  const [wantedMissing, setWantedMissing] = useState<RadarrWantedMissing>({ page: 0, pageSize: 0, sortKey: '', sortDirection: '', totalRecords: 0, records: [] })
  const [diskSpace, setDiskSpace] = useState<RadarrDiskSpace[]>([])
  const [qualityProfiles, setQualityProfiles] = useState<RadarrQualityProfile[]>([])
  const [rootFolders, setRootFolders] = useState<any[]>([])
  const [tags, setTags] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize API client
  const api = new RadarrAPI(apiUrl || '/api/radarr', apiKey || '')

  // Fetch methods
  const fetch = {
    movies: useCallback(async () => {
      if (!enabled) return
      try {
        setLoading(true)
        const data = await api.getMovies()
        setMovies(data)
        setError(null)
      } catch (err) {
        setError(`Failed to fetch movies: ${err instanceof Error ? err.message : 'Unknown error'}`)
      } finally {
        setLoading(false)
      }
    }, [api, enabled]),

    queue: useCallback(async () => {
      if (!enabled) return
      try {
        setLoading(true)
        const data = await api.getQueue()
        setQueue(data)
        setError(null)
      } catch (err) {
        setError(`Failed to fetch queue: ${err instanceof Error ? err.message : 'Unknown error'}`)
      } finally {
        setLoading(false)
      }
    }, [api, enabled]),

    history: useCallback(async () => {
      if (!enabled) return
      try {
        setLoading(true)
        const data = await api.getHistory()
        setHistory(data)
        setError(null)
      } catch (err) {
        setError(`Failed to fetch history: ${err instanceof Error ? err.message : 'Unknown error'}`)
      } finally {
        setLoading(false)
      }
    }, [api, enabled]),

    systemStatus: useCallback(async () => {
      if (!enabled) return
      try {
        setLoading(true)
        const data = await api.getSystemStatus()
        setSystemStatus(data)
        setError(null)
      } catch (err) {
        setError(`Failed to fetch system status: ${err instanceof Error ? err.message : 'Unknown error'}`)
      } finally {
        setLoading(false)
      }
    }, [api, enabled]),

    systemHealth: useCallback(async () => {
      if (!enabled) return
      try {
        setLoading(true)
        const data = await api.getSystemHealth()
        setSystemHealth(data)
        setError(null)
      } catch (err) {
        setError(`Failed to fetch system health: ${err instanceof Error ? err.message : 'Unknown error'}`)
      } finally {
        setLoading(false)
      }
    }, [api, enabled]),

    systemTasks: useCallback(async () => {
      if (!enabled) return
      try {
        setLoading(true)
        const data = await api.getCommands()
        setSystemTasks(data)
        setError(null)
      } catch (err) {
        setError(`Failed to fetch system tasks: ${err instanceof Error ? err.message : 'Unknown error'}`)
      } finally {
        setLoading(false)
      }
    }, [api, enabled]),

    updateInfo: useCallback(async () => {
      if (!enabled) return
      try {
        setLoading(true)
        const data = await api.getUpdateInfo()
        setUpdateInfo(data)
        setError(null)
      } catch (err) {
        setError(`Failed to fetch update info: ${err instanceof Error ? err.message : 'Unknown error'}`)
      } finally {
        setLoading(false)
      }
    }, [api, enabled]),

    wantedMissing: useCallback(async () => {
      if (!enabled) return
      try {
        setLoading(true)
        const data = await api.getWantedMissing()
        setWantedMissing(data)
        setError(null)
      } catch (err) {
        setError(`Failed to fetch wanted missing: ${err instanceof Error ? err.message : 'Unknown error'}`)
      } finally {
        setLoading(false)
      }
    }, [api, enabled]),

    diskSpace: useCallback(async () => {
      if (!enabled) return
      try {
        setLoading(true)
        const data = await api.getDiskSpace()
        setDiskSpace(data)
        setError(null)
      } catch (err) {
        setError(`Failed to fetch disk space: ${err instanceof Error ? err.message : 'Unknown error'}`)
      } finally {
        setLoading(false)
      }
    }, [api, enabled]),

    qualityProfiles: useCallback(async () => {
      if (!enabled) return
      try {
        setLoading(true)
        const data = await api.getQualityProfiles()
        setQualityProfiles(data)
        setError(null)
      } catch (err) {
        setError(`Failed to fetch quality profiles: ${err instanceof Error ? err.message : 'Unknown error'}`)
      } finally {
        setLoading(false)
      }
    }, [api, enabled]),

    rootFolders: useCallback(async () => {
      if (!enabled) return
      try {
        setLoading(true)
        const data = await api.getRootFolders()
        setRootFolders(data)
        setError(null)
      } catch (err) {
        setError(`Failed to fetch root folders: ${err instanceof Error ? err.message : 'Unknown error'}`)
      } finally {
        setLoading(false)
      }
    }, [api, enabled]),

    tags: useCallback(async () => {
      if (!enabled) return
      try {
        setLoading(true)
        const data = await api.getTags()
        setTags(data)
        setError(null)
      } catch (err) {
        setError(`Failed to fetch tags: ${err instanceof Error ? err.message : 'Unknown error'}`)
      } finally {
        setLoading(false)
      }
    }, [api, enabled]),
  }

  // Actions
  const actions = {
    refreshAll: useCallback(async () => {
      await Promise.all([
        fetch.movies(),
        fetch.queue(),
        fetch.history(),
        fetch.systemStatus(),
        fetch.systemHealth(),
        fetch.systemTasks(),
        fetch.updateInfo(),
        fetch.wantedMissing(),
        fetch.diskSpace(),
        fetch.qualityProfiles(),
        fetch.rootFolders(),
        fetch.tags(),
      ])
    }, [fetch]),

    movies: {
      toggleMonitor: useCallback(async (id: number) => {
        if (!enabled) return
        try {
          setLoading(true)
          // Toggle movie monitor by updating the movie
          const movie = movies.find(m => m.id === id)
          if (movie) {
            await api.updateMovie({ ...movie, monitored: !movie.monitored })
          }
          await fetch.movies()
          setError(null)
        } catch (err) {
          setError(`Failed to toggle movie monitor: ${err instanceof Error ? err.message : 'Unknown error'}`)
        } finally {
          setLoading(false)
        }
      }, [api, fetch.movies, enabled]),

      searchMovie: useCallback(async (id: number) => {
        if (!enabled) return
        try {
          setLoading(true)
          await api.searchMovieByIds([id])
          await fetch.queue()
          setError(null)
        } catch (err) {
          setError(`Failed to search movie: ${err instanceof Error ? err.message : 'Unknown error'}`)
        } finally {
          setLoading(false)
        }
      }, [api, fetch.queue, enabled]),

      deleteMovie: useCallback(async (id: number, deleteFiles = false) => {
        if (!enabled) return
        try {
          setLoading(true)
          await api.deleteMovie(id, deleteFiles)
          await fetch.movies()
          setError(null)
        } catch (err) {
          setError(`Failed to delete movie: ${err instanceof Error ? err.message : 'Unknown error'}`)
        } finally {
          setLoading(false)
        }
      }, [api, fetch.movies, enabled]),

      addMovie: useCallback(async (movie: any) => {
        if (!enabled) return
        try {
          setLoading(true)
          await api.addMovie(movie)
          await fetch.movies()
          setError(null)
        } catch (err) {
          setError(`Failed to add movie: ${err instanceof Error ? err.message : 'Unknown error'}`)
        } finally {
          setLoading(false)
        }
      }, [api, fetch.movies, enabled]),

      editMovie: useCallback(async (movie: any) => {
        if (!enabled) return
        try {
          setLoading(true)
          await api.updateMovie(movie)
          await fetch.movies()
          setError(null)
        } catch (err) {
          setError(`Failed to edit movie: ${err instanceof Error ? err.message : 'Unknown error'}`)
        } finally {
          setLoading(false)
        }
      }, [api, fetch.movies, enabled]),
    },

    queue: {
      removeQueueItem: useCallback(async (id: number, blacklist = false) => {
        if (!enabled) return
        try {
          setLoading(true)
          await api.deleteQueueItem(id, true, blacklist)
          await fetch.queue()
          setError(null)
        } catch (err) {
          setError(`Failed to remove queue item: ${err instanceof Error ? err.message : 'Unknown error'}`)
        } finally {
          setLoading(false)
        }
      }, [api, fetch.queue, enabled]),

      grabQueueItem: useCallback(async (id: number) => {
        if (!enabled) return
        try {
          setLoading(true)
          // Grab queue item is not directly available in the API
          // This would need to be implemented if needed
          console.log('Grab queue item not implemented')
          await fetch.queue()
          setError(null)
        } catch (err) {
          setError(`Failed to grab queue item: ${err instanceof Error ? err.message : 'Unknown error'}`)
        } finally {
          setLoading(false)
        }
      }, [api, fetch.queue, enabled]),
    },

    system: {
      refreshSystemStatus: fetch.systemStatus,
      refreshSystemHealth: fetch.systemHealth,
      refreshSystemTasks: fetch.systemTasks,
      refreshUpdateInfo: fetch.updateInfo,
      
      executeCommand: useCallback(async (commandName: string, params?: any) => {
        if (!enabled) return
        try {
          setLoading(true)
          await api.executeCommand(commandName, params)
          await fetch.systemTasks()
          setError(null)
        } catch (err) {
          setError(`Failed to execute command: ${err instanceof Error ? err.message : 'Unknown error'}`)
        } finally {
          setLoading(false)
        }
      }, [api, fetch.systemTasks, enabled]),
    },

    wanted: {
      refreshWantedMissing: fetch.wantedMissing,
    },

    lookupMovie: useCallback(async (term: string) => {
      if (!enabled) return []
      try {
        setLoading(true)
        const data = await api.searchMovie(term)
        setError(null)
        return data
      } catch (err) {
        setError(`Failed to lookup movie: ${err instanceof Error ? err.message : 'Unknown error'}`)
        return []
      } finally {
        setLoading(false)
      }
    }, [api, enabled]),
  }

  // Initial data fetch
  useEffect(() => {
    if (enabled) {
      actions.refreshAll()
    }
  }, [enabled, actions.refreshAll])

  return {
    movies,
    queue,
    history,
    systemStatus,
    systemHealth,
    systemTasks,
    updateInfo,
    wantedMissing,
    diskSpace,
    qualityProfiles,
    rootFolders,
    tags,
    actions,
    fetch,
    loading,
    error,
  }
}