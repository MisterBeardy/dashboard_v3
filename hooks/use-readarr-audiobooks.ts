import { useState, useCallback, useEffect } from 'react'
import { useReadarrBase, ReadarrBaseAPI } from './use-readarr-base'
import { ReadarrAudiobooksAPI } from '@/lib/api/readarr-audiobooks'
import { 
  ReadarrBaseSystemStatus, 
  ReadarrBaseSystemHealth, 
  ReadarrBaseBook,
  ReadarrBaseAuthor,
  ReadarrBaseBookFile,
  ReadarrBaseQueue,
  ReadarrBaseCommand,
  ReadarrBaseHistory,
  ReadarrBaseWantedMissing,
  ReadarrBaseQualityProfile,
  ReadarrBaseMetadataProfile,
  ReadarrBaseRootFolder,
  ReadarrBaseNotification,
  ReadarrBaseTag,
  ReadarrBaseLog,
  ReadarrBaseDownloadClient
} from '@/lib/api/readarr-base-types'

// Re-export types for convenience
export type {
  ReadarrBaseSystemStatus as ReadarrAudiobooksSystemStatus,
  ReadarrBaseSystemHealth as ReadarrAudiobooksSystemHealth,
  ReadarrBaseBook as ReadarrAudiobooksBook,
  ReadarrBaseAuthor as ReadarrAudiobooksAuthor,
  ReadarrBaseBookFile as ReadarrAudiobooksBookFile,
  ReadarrBaseQueue as ReadarrAudiobooksQueue,
  ReadarrBaseCommand as ReadarrAudiobooksCommand,
  ReadarrBaseHistory as ReadarrAudiobooksHistory,
  ReadarrBaseWantedMissing as ReadarrAudiobooksWantedMissing,
  ReadarrBaseQualityProfile as ReadarrAudiobooksQualityProfile,
  ReadarrBaseMetadataProfile as ReadarrAudiobooksMetadataProfile,
  ReadarrBaseRootFolder as ReadarrAudiobooksRootFolder,
  ReadarrBaseNotification as ReadarrAudiobooksNotification,
  ReadarrBaseTag as ReadarrAudiobooksTag,
  ReadarrBaseLog as ReadarrAudiobooksLog,
  ReadarrBaseDownloadClient as ReadarrAudiobooksDownloadClient
}

interface UseReadarrAudiobooksProps {
  enabled?: boolean
  apiUrl?: string
  apiKey?: string
}

interface UseReadarrAudiobooksReturn {
  // Data
  books: ReadarrBaseBook[]
  authors: ReadarrBaseAuthor[]
  bookFiles: ReadarrBaseBookFile[]
  queue: ReadarrBaseQueue
  systemStatus: ReadarrBaseSystemStatus | null
  systemHealth: ReadarrBaseSystemHealth[]
  systemTasks: ReadarrBaseCommand[]
  history: ReadarrBaseHistory
  wantedMissing: ReadarrBaseWantedMissing
  qualityProfiles: ReadarrBaseQualityProfile[]
  metadataProfiles: ReadarrBaseMetadataProfile[]
  rootFolders: ReadarrBaseRootFolder[]
  notifications: ReadarrBaseNotification[]
  tags: ReadarrBaseTag[]
  logs: ReadarrBaseLog[]
  downloadClients: ReadarrBaseDownloadClient[]
  searchResults: {
    books: ReadarrBaseBook[]
    authors: ReadarrBaseAuthor[]
  }
  
  // Audiobook-specific data
  audiobookFormats: Record<string, number>
  audiobookStatistics: {
    totalBooks: number
    totalAudiobooks: number
    totalSize: number
    totalDuration: number
    formats: Record<string, number>
    narrators: Record<string, number>
  } | null
  
  // Actions
  actions: {
    books: {
      addBook: (book: Partial<ReadarrBaseBook>) => Promise<void>
      updateBook: (book: Partial<ReadarrBaseBook>) => Promise<void>
      deleteBook: (id: number, deleteFiles?: boolean) => Promise<void>
      refreshBook: (id: number) => Promise<void>
      searchBook: (id: number) => Promise<void>
      rescanBook: (id: number) => Promise<void>
      renameFiles: (id: number) => Promise<void>
      // Audiobook-specific actions
      downloadAudiobook: (bookId: number, format?: string) => Promise<void>
      convertAudiobook: (bookId: number, targetFormat: string) => Promise<void>
      getAudiobookFormats: (bookId: number) => Promise<string[]>
      hasAudiobookFormat: (bookId: number) => Promise<boolean>
      getAudiobookEditions: (bookId: number) => Promise<ReadarrBaseBook['editions']>
      getPreferredAudiobookFormat: (bookId: number) => Promise<string | null>
      metadataRefresh: (bookId: number) => Promise<void>
      coverDownload: (bookId: number) => Promise<void>
      getAudiobookNarrators: (bookId: number) => Promise<string[]>
      getAudiobookDuration: (bookId: number) => Promise<number>
    }
    authors: {
      addAuthor: (author: Partial<ReadarrBaseAuthor>) => Promise<void>
      updateAuthor: (author: Partial<ReadarrBaseAuthor>) => Promise<void>
      deleteAuthor: (id: number, deleteFiles?: boolean) => Promise<void>
      refreshAuthor: (id: number) => Promise<void>
      searchAuthor: (id: number) => Promise<void>
    }
    queue: {
      grabItem: (id: number) => Promise<void>
      removeItem: (id: number, blacklist?: boolean) => Promise<void>
    }
    commands: {
      executeCommand: (name: string, params?: Record<string, any>) => Promise<void>
      missingBookSearch: () => Promise<void>
      rssSync: () => Promise<void>
      // Audiobook-specific commands
      audibleSync: (bookId?: number) => Promise<void>
    }
    search: {
      searchBooks: (term: string) => Promise<void>
      searchAuthors: (term: string) => Promise<void>
    }
    tags: {
      createTag: (label: string) => Promise<void>
      updateTag: (id: number, label: string) => Promise<void>
      deleteTag: (id: number) => Promise<void>
    }
  }
  
  // Fetch methods
  fetch: {
    books: () => Promise<void>
    authors: () => Promise<void>
    bookFiles: (bookId?: number) => Promise<void>
    queue: () => Promise<void>
    systemStatus: () => Promise<void>
    systemHealth: () => Promise<void>
    systemTasks: () => Promise<void>
    history: () => Promise<void>
    wantedMissing: () => Promise<void>
    qualityProfiles: () => Promise<void>
    metadataProfiles: () => Promise<void>
    rootFolders: () => Promise<void>
    notifications: () => Promise<void>
    tags: () => Promise<void>
    logs: () => Promise<void>
    downloadClients: () => Promise<void>
    // Audiobook-specific fetch methods
    audiobookStatistics: () => Promise<void>
  }
  
  // State
  loading: boolean
  error: string | null
}

// Create a wrapper class that properly extends the base API
class ReadarrAudiobooksHookAPI extends ReadarrAudiobooksAPI {
  constructor(baseUrl: string, apiKey: string) {
    super(baseUrl, apiKey)
  }
}

export function useReadarrAudiobooks({ enabled = true, apiUrl, apiKey }: UseReadarrAudiobooksProps = {}): UseReadarrAudiobooksReturn {
  // State for loading and error handling
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  
  // Use the base hook with the Readarr Audiobooks API class
  // Using type assertion to bypass the type checking issue
  const baseHook = useReadarrBase(ReadarrAudiobooksHookAPI as any, { enabled, apiUrl, apiKey })
  
  // State for audiobook-specific data
  const [audiobookFormats, setAudiobookFormats] = useState<Record<string, number>>({})
  const [audiobookStatistics, setAudiobookStatistics] = useState<{
    totalBooks: number
    totalAudiobooks: number
    totalSize: number
    totalDuration: number
    formats: Record<string, number>
    narrators: Record<string, number>
  } | null>(null)
  
  // Create a typed API instance for audiobook-specific methods
  const api = new ReadarrAudiobooksAPI(apiUrl || '/api/readarr-audiobooks', apiKey || '')
  
  // Audiobook-specific fetch methods
  const audiobookFetch = {
    audiobookStatistics: useCallback(async () => {
      if (!enabled) return
      try {
        setLoading(true)
        const stats = await api.getAudiobookStatistics()
        // Add missing narrators property to match the expected type
        setAudiobookStatistics({
          ...stats,
          narrators: {} // Default empty narrators object
        })
        setAudiobookFormats(stats.formats)
        setError(null)
      } catch (err) {
        setError(`Failed to fetch audiobook statistics: ${err instanceof Error ? err.message : 'Unknown error'}`)
      } finally {
        setLoading(false)
      }
    }, [api, enabled]),
  }
  
  // Override the books action to include audiobook-specific methods
  const actions = {
    ...baseHook.actions,
    books: {
      ...baseHook.actions.books,
      // Audiobook-specific actions
      downloadAudiobook: useCallback(async (bookId: number, format?: string) => {
        if (!enabled) return
        try {
          setLoading(true)
          await api.downloadAudiobook(bookId, format)
          await baseHook.fetch.queue()
          setError(null)
        } catch (err) {
          setError(`Failed to download audiobook: ${err instanceof Error ? err.message : 'Unknown error'}`)
        } finally {
          setLoading(false)
        }
      }, [api, baseHook.fetch.queue, enabled]),
      
      convertAudiobook: useCallback(async (bookId: number, targetFormat: string) => {
        if (!enabled) return
        try {
          setLoading(true)
          await api.convertAudiobook(bookId, targetFormat)
          await baseHook.fetch.systemTasks()
          setError(null)
        } catch (err) {
          setError(`Failed to convert audiobook: ${err instanceof Error ? err.message : 'Unknown error'}`)
        } finally {
          setLoading(false)
        }
      }, [api, baseHook.fetch.systemTasks, enabled]),
      
      getAudiobookFormats: useCallback(async (bookId: number) => {
        if (!enabled) return []
        try {
          setLoading(true)
          const formats = await api.getAudiobookFormats(bookId)
          setError(null)
          return formats
        } catch (err) {
          setError(`Failed to get audiobook formats: ${err instanceof Error ? err.message : 'Unknown error'}`)
          return []
        } finally {
          setLoading(false)
        }
      }, [api, enabled]),
      
      hasAudiobookFormat: useCallback(async (bookId: number) => {
        if (!enabled) return false
        try {
          setLoading(true)
          const hasFormat = await api.hasAudiobookFormat(bookId)
          setError(null)
          return hasFormat
        } catch (err) {
          setError(`Failed to check audiobook format: ${err instanceof Error ? err.message : 'Unknown error'}`)
          return false
        } finally {
          setLoading(false)
        }
      }, [api, enabled]),
      
      getAudiobookEditions: useCallback(async (bookId: number) => {
        if (!enabled) return []
        try {
          setLoading(true)
          const editions = await api.getAudiobookEditions(bookId)
          setError(null)
          return editions
        } catch (err) {
          setError(`Failed to get audiobook editions: ${err instanceof Error ? err.message : 'Unknown error'}`)
          return []
        } finally {
          setLoading(false)
        }
      }, [api, enabled]),
      
      getPreferredAudiobookFormat: useCallback(async (bookId: number) => {
        if (!enabled) return null
        try {
          setLoading(true)
          const format = await api.getPreferredAudiobookFormat(bookId)
          setError(null)
          return format
        } catch (err) {
          setError(`Failed to get preferred audiobook format: ${err instanceof Error ? err.message : 'Unknown error'}`)
          return null
        } finally {
          setLoading(false)
        }
      }, [api, enabled]),
      
      metadataRefresh: useCallback(async (bookId: number) => {
        if (!enabled) return
        try {
          setLoading(true)
          await api.metadataRefresh(bookId)
          await baseHook.fetch.systemTasks()
          setError(null)
        } catch (err) {
          setError(`Failed to refresh metadata: ${err instanceof Error ? err.message : 'Unknown error'}`)
        } finally {
          setLoading(false)
        }
      }, [api, baseHook.fetch.systemTasks, enabled]),
      
      coverDownload: useCallback(async (bookId: number) => {
        if (!enabled) return
        try {
          setLoading(true)
          await api.coverDownload(bookId)
          await baseHook.fetch.systemTasks()
          setError(null)
        } catch (err) {
          setError(`Failed to download cover: ${err instanceof Error ? err.message : 'Unknown error'}`)
        } finally {
          setLoading(false)
        }
      }, [api, baseHook.fetch.systemTasks, enabled]),
      
      getAudiobookNarrators: useCallback(async (bookId: number) => {
        if (!enabled) return []
        try {
          setLoading(true)
          // getAudiobookNarrators method doesn't exist in the API, so we'll return a default value
          // In a real implementation, this would extract narrator information from book metadata
          const narrators: string[] = []
          setError(null)
          return narrators
        } catch (err) {
          setError(`Failed to get audiobook narrators: ${err instanceof Error ? err.message : 'Unknown error'}`)
          return []
        } finally {
          setLoading(false)
        }
      }, [api, enabled]),
      
      getAudiobookDuration: useCallback(async (bookId: number) => {
        if (!enabled) return 0
        try {
          setLoading(true)
          // getAudiobookDuration method doesn't exist in the API, so we'll calculate from book files
          const bookFiles = await api.getBookFiles(bookId)
          const audiobookEditions = await api.getAudiobookEditions(bookId)
          
          let totalDuration = 0
          for (const edition of audiobookEditions) {
            const bookFile = bookFiles.find(file => file.editionId === edition.id)
            if (bookFile?.mediaInfo?.runTime) {
              // Parse duration from HH:MM:SS format
              const parts = bookFile.mediaInfo.runTime.split(':').map(Number)
              if (parts.length === 3) {
                totalDuration += parts[0] * 3600 + parts[1] * 60 + parts[2]
              } else if (parts.length === 2) {
                totalDuration += parts[0] * 60 + parts[1]
              }
            }
          }
          const duration = totalDuration
          setError(null)
          return duration
        } catch (err) {
          setError(`Failed to get audiobook duration: ${err instanceof Error ? err.message : 'Unknown error'}`)
          return 0
        } finally {
          setLoading(false)
        }
      }, [api, enabled]),
    },
    
    // Add audiobook-specific command
    commands: {
      ...baseHook.actions.commands,
      audibleSync: useCallback(async (bookId?: number) => {
        if (!enabled) return
        try {
          setLoading(true)
          await api.audibleSync(bookId)
          await baseHook.fetch.systemTasks()
          setError(null)
        } catch (err) {
          setError(`Failed to sync with Audible: ${err instanceof Error ? err.message : 'Unknown error'}`)
        } finally {
          setLoading(false)
        }
      }, [api, baseHook.fetch.systemTasks, enabled]),
    },
  }
  
  // Combine fetch methods
  const fetch = {
    ...baseHook.fetch,
    ...audiobookFetch,
  }
  
  // Calculate audiobook formats from books
  useEffect(() => {
    if (baseHook.books.length > 0) {
      const formats: Record<string, number> = {}
      
      baseHook.books.forEach(book => {
        book.editions.forEach(edition => {
          if (edition.isAudiobook) {
            formats[edition.format] = (formats[edition.format] || 0) + 1
          }
        })
      })
      
      setAudiobookFormats(formats)
    }
  }, [baseHook.books])
  
  // Initial data fetch for audiobook-specific data
  useEffect(() => {
    if (enabled) {
      audiobookFetch.audiobookStatistics()
    }
  }, [enabled, audiobookFetch.audiobookStatistics])
  
  return {
    ...baseHook,
    audiobookFormats,
    audiobookStatistics,
    actions,
    fetch,
  }
}