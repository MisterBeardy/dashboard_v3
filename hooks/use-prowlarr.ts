import { useState, useEffect, useCallback } from 'react'
import { ProwlarrAPI } from '@/lib/api/prowlarr'
import { 
  ProwlarrIndexer,
  ProwlarrSystemStatus,
  ProwlarrSystemHealth,
  ProwlarrCommand,
  ProwlarrDownloadClient,
  ProwlarrApplication,
  ProwlarrNotification,
  ProwlarrTag,
  ProwlarrUpdateInfo
} from '@/lib/api/prowlarr-types'

interface UseProwlarrProps {
  enabled?: boolean
  apiUrl?: string
  apiKey?: string
}

interface UseProwlarrReturn {
  // Data
  indexers: ProwlarrIndexer[]
  downloadClients: ProwlarrDownloadClient[]
  applications: ProwlarrApplication[]
  systemStatus: ProwlarrSystemStatus | null
  systemHealth: ProwlarrSystemHealth[]
  systemTasks: ProwlarrCommand[]
  updateInfo: ProwlarrUpdateInfo | null
  notifications: ProwlarrNotification[]
  tags: ProwlarrTag[]
  lookupResults: {
    indexers: any[]
  }
  
  // Actions
  actions: {
    testAllIndexers: () => Promise<void>
    indexers: {
      toggleEnable: (id: number) => Promise<void>
      testIndexer: (id: number) => Promise<void>
      deleteIndexer: (id: number) => Promise<void>
      addIndexer: (indexer: any) => Promise<void>
    }
    lookupIndexer: (term: string) => Promise<void>
  }
  
  // Fetch methods
  fetch: {
    indexers: () => Promise<void>
    downloadClients: () => Promise<void>
    applications: () => Promise<void>
    systemStatus: () => Promise<void>
    systemHealth: () => Promise<void>
    systemTasks: () => Promise<void>
    updateInfo: () => Promise<void>
    notifications: () => Promise<void>
    tags: () => Promise<void>
  }
  
  // State
  loading: boolean
  error: string | null
}

export function useProwlarr({ enabled = true, apiUrl, apiKey }: UseProwlarrProps = {}): UseProwlarrReturn {
  const [indexers, setIndexers] = useState<ProwlarrIndexer[]>([])
  const [downloadClients, setDownloadClients] = useState<ProwlarrDownloadClient[]>([])
  const [applications, setApplications] = useState<ProwlarrApplication[]>([])
  const [systemStatus, setSystemStatus] = useState<ProwlarrSystemStatus | null>(null)
  const [systemHealth, setSystemHealth] = useState<ProwlarrSystemHealth[]>([])
  const [systemTasks, setSystemTasks] = useState<ProwlarrCommand[]>([])
  const [updateInfo, setUpdateInfo] = useState<ProwlarrUpdateInfo | null>(null)
  const [notifications, setNotifications] = useState<ProwlarrNotification[]>([])
  const [tags, setTags] = useState<ProwlarrTag[]>([])
  const [lookupResults, setLookupResults] = useState<{
    indexers: any[]
  }>({ indexers: [] })
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize API client
  const api = new ProwlarrAPI(apiUrl || '/api/prowlarr', apiKey || '')

  // Fetch methods
  const fetch = {
    indexers: useCallback(async () => {
      if (!enabled) return
      try {
        setLoading(true)
        const data = await api.getIndexers()
        setIndexers(data)
        setError(null)
      } catch (err) {
        setError(`Failed to fetch indexers: ${err instanceof Error ? err.message : 'Unknown error'}`)
      } finally {
        setLoading(false)
      }
    }, [api, enabled]),

    downloadClients: useCallback(async () => {
      if (!enabled) return
      try {
        setLoading(true)
        const data = await api.getDownloadClients()
        setDownloadClients(data)
        setError(null)
      } catch (err) {
        setError(`Failed to fetch download clients: ${err instanceof Error ? err.message : 'Unknown error'}`)
      } finally {
        setLoading(false)
      }
    }, [api, enabled]),

    applications: useCallback(async () => {
      if (!enabled) return
      try {
        setLoading(true)
        const data = await api.getApplications()
        setApplications(data)
        setError(null)
      } catch (err) {
        setError(`Failed to fetch applications: ${err instanceof Error ? err.message : 'Unknown error'}`)
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

    notifications: useCallback(async () => {
      if (!enabled) return
      try {
        setLoading(true)
        const data = await api.getNotifications()
        setNotifications(data)
        setError(null)
      } catch (err) {
        setError(`Failed to fetch notifications: ${err instanceof Error ? err.message : 'Unknown error'}`)
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
    testAllIndexers: useCallback(async () => {
      if (!enabled) return
      try {
        setLoading(true)
        await api.testAllIndexers()
        await fetch.indexers()
        setError(null)
      } catch (err) {
        setError(`Failed to test all indexers: ${err instanceof Error ? err.message : 'Unknown error'}`)
      } finally {
        setLoading(false)
      }
    }, [api, fetch.indexers, enabled]),

    indexers: {
      toggleEnable: useCallback(async (id: number) => {
        if (!enabled) return
        try {
          setLoading(true)
          const indexer = indexers.find(i => i.id === id)
          if (indexer) {
            // ProwlarrIndexer doesn't have a single 'enable' property,
            // it has enableRss, enableAutomaticSearch, and enableInteractiveSearch
            await api.updateIndexer({
              ...indexer,
              enableRss: !indexer.enableRss,
              enableAutomaticSearch: !indexer.enableAutomaticSearch,
              enableInteractiveSearch: !indexer.enableInteractiveSearch
            })
          }
          await fetch.indexers()
          setError(null)
        } catch (err) {
          setError(`Failed to toggle indexer: ${err instanceof Error ? err.message : 'Unknown error'}`)
        } finally {
          setLoading(false)
        }
      }, [api, fetch.indexers, enabled, indexers]),

      testIndexer: useCallback(async (id: number) => {
        if (!enabled) return
        try {
          setLoading(true)
          await api.testIndexer(id)
          await fetch.indexers()
          setError(null)
        } catch (err) {
          setError(`Failed to test indexer: ${err instanceof Error ? err.message : 'Unknown error'}`)
        } finally {
          setLoading(false)
        }
      }, [api, fetch.indexers, enabled]),

      deleteIndexer: useCallback(async (id: number) => {
        if (!enabled) return
        try {
          setLoading(true)
          await api.deleteIndexer(id)
          await fetch.indexers()
          setError(null)
        } catch (err) {
          setError(`Failed to delete indexer: ${err instanceof Error ? err.message : 'Unknown error'}`)
        } finally {
          setLoading(false)
        }
      }, [api, fetch.indexers, enabled]),

      addIndexer: useCallback(async (indexer: any) => {
        if (!enabled) return
        try {
          setLoading(true)
          await api.addIndexer(indexer)
          await fetch.indexers()
          setError(null)
        } catch (err) {
          setError(`Failed to add indexer: ${err instanceof Error ? err.message : 'Unknown error'}`)
        } finally {
          setLoading(false)
        }
      }, [api, fetch.indexers, enabled]),
    },

    lookupIndexer: useCallback(async (term: string) => {
      if (!enabled) return
      try {
        setLoading(true)
        const data = await api.lookupIndexer(term)
        setLookupResults({ indexers: data })
        setError(null)
      } catch (err) {
        setError(`Failed to lookup indexer: ${err instanceof Error ? err.message : 'Unknown error'}`)
      } finally {
        setLoading(false)
      }
    }, [api, enabled]),
  }

  // Initial data fetch
  useEffect(() => {
    if (enabled) {
      fetch.indexers()
      fetch.systemStatus()
      fetch.systemHealth()
      fetch.systemTasks()
      fetch.updateInfo()
    }
  }, [enabled, fetch.indexers, fetch.systemStatus, fetch.systemHealth, fetch.systemTasks, fetch.updateInfo])

  return {
    indexers,
    downloadClients,
    applications,
    systemStatus,
    systemHealth,
    systemTasks,
    updateInfo,
    notifications,
    tags,
    lookupResults,
    actions,
    fetch,
    loading,
    error,
  }
}