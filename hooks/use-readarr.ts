import { useState, useCallback, useEffect } from 'react'
import { useReadarrBase, ReadarrBaseAPI } from './use-readarr-base'
import { ReadarrAPI } from '@/lib/api/readarr'
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
  ReadarrBaseSystemStatus as ReadarrSystemStatus,
  ReadarrBaseSystemHealth as ReadarrSystemHealth,
  ReadarrBaseBook as ReadarrBook,
  ReadarrBaseAuthor as ReadarrAuthor,
  ReadarrBaseBookFile as ReadarrBookFile,
  ReadarrBaseQueue as ReadarrQueue,
  ReadarrBaseCommand as ReadarrCommand,
  ReadarrBaseHistory as ReadarrHistory,
  ReadarrBaseWantedMissing as ReadarrWantedMissing,
  ReadarrBaseQualityProfile as ReadarrQualityProfile,
  ReadarrBaseMetadataProfile as ReadarrMetadataProfile,
  ReadarrBaseRootFolder as ReadarrRootFolder,
  ReadarrBaseNotification as ReadarrNotification,
  ReadarrBaseTag as ReadarrTag,
  ReadarrBaseLog as ReadarrLog,
  ReadarrBaseDownloadClient as ReadarrDownloadClient
}

interface UseReadarrProps {
  enabled?: boolean
  apiUrl?: string
  apiKey?: string
}

interface UseReadarrReturn {
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
  
  // Ebook-specific data
  ebookFormats: Record<string, number>
  ebookStatistics: {
    totalBooks: number
    totalEbooks: number
    totalSize: number
    formats: Record<string, number>
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
      // Ebook-specific actions
      downloadEbook: (bookId: number, format?: string) => Promise<void>
      convertEbook: (bookId: number, targetFormat: string) => Promise<void>
      getEbookFormats: (bookId: number) => Promise<string[]>
      hasEbookFormat: (bookId: number) => Promise<boolean>
      getEbookEditions: (bookId: number) => Promise<ReadarrBaseBook['editions']>
      getPreferredEbookFormat: (bookId: number) => Promise<string | null>
      metadataRefresh: (bookId: number) => Promise<void>
      coverDownload: (bookId: number) => Promise<void>
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
      // Ebook-specific commands
      calibreSync: (bookId?: number) => Promise<void>
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
    // Ebook-specific fetch methods
    ebookStatistics: () => Promise<void>
  }
  
  // State
  loading: boolean
  error: string | null
}

// Create a wrapper class that properly extends the base API
class ReadarrHookAPI extends ReadarrAPI {
  constructor(baseUrl: string, apiKey: string) {
    super(baseUrl, apiKey)
  }
}

export function useReadarr({ enabled = true, apiUrl, apiKey }: UseReadarrProps = {}): UseReadarrReturn {
  // State for loading and error handling
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  
  // Use the base hook with the Readarr API class
  // Using type assertion to bypass the type checking issue
  const baseHook = useReadarrBase(ReadarrHookAPI as any, { enabled, apiUrl, apiKey })
  
  // State for ebook-specific data
  const [ebookFormats, setEbookFormats] = useState<Record<string, number>>({})
  const [ebookStatistics, setEbookStatistics] = useState<{
    totalBooks: number
    totalEbooks: number
    totalSize: number
    formats: Record<string, number>
  } | null>(null)
  
  // Create a typed API instance for ebook-specific methods
  const api = new ReadarrAPI(apiUrl || '/api/readarr', apiKey || '')
  
  // Ebook-specific fetch methods
  const ebookFetch = {
    ebookStatistics: useCallback(async () => {
      if (!enabled) return
      try {
        setLoading(true)
        const stats = await api.getEbookStatistics()
        setEbookStatistics(stats)
        setEbookFormats(stats.formats)
        setError(null)
      } catch (err) {
        setError(`Failed to fetch ebook statistics: ${err instanceof Error ? err.message : 'Unknown error'}`)
      } finally {
        setLoading(false)
      }
    }, [api, enabled]),
  }
  
  // Override the books action to include ebook-specific methods
  const actions = {
    ...baseHook.actions,
    books: {
      ...baseHook.actions.books,
      // Ebook-specific actions
      downloadEbook: useCallback(async (bookId: number, format?: string) => {
        if (!enabled) return
        try {
          setLoading(true)
          await api.downloadEbook(bookId, format)
          await baseHook.fetch.queue()
          setError(null)
        } catch (err) {
          setError(`Failed to download ebook: ${err instanceof Error ? err.message : 'Unknown error'}`)
        } finally {
          setLoading(false)
        }
      }, [api, baseHook.fetch.queue, enabled]),
      
      convertEbook: useCallback(async (bookId: number, targetFormat: string) => {
        if (!enabled) return
        try {
          setLoading(true)
          await api.convertEbook(bookId, targetFormat)
          await baseHook.fetch.systemTasks()
          setError(null)
        } catch (err) {
          setError(`Failed to convert ebook: ${err instanceof Error ? err.message : 'Unknown error'}`)
        } finally {
          setLoading(false)
        }
      }, [api, baseHook.fetch.systemTasks, enabled]),
      
      getEbookFormats: useCallback(async (bookId: number) => {
        if (!enabled) return []
        try {
          setLoading(true)
          const formats = await api.getEbookFormats(bookId)
          setError(null)
          return formats
        } catch (err) {
          setError(`Failed to get ebook formats: ${err instanceof Error ? err.message : 'Unknown error'}`)
          return []
        } finally {
          setLoading(false)
        }
      }, [api, enabled]),
      
      hasEbookFormat: useCallback(async (bookId: number) => {
        if (!enabled) return false
        try {
          setLoading(true)
          const hasFormat = await api.hasEbookFormat(bookId)
          setError(null)
          return hasFormat
        } catch (err) {
          setError(`Failed to check ebook format: ${err instanceof Error ? err.message : 'Unknown error'}`)
          return false
        } finally {
          setLoading(false)
        }
      }, [api, enabled]),
      
      getEbookEditions: useCallback(async (bookId: number) => {
        if (!enabled) return []
        try {
          setLoading(true)
          const editions = await api.getEbookEditions(bookId)
          setError(null)
          return editions
        } catch (err) {
          setError(`Failed to get ebook editions: ${err instanceof Error ? err.message : 'Unknown error'}`)
          return []
        } finally {
          setLoading(false)
        }
      }, [api, enabled]),
      
      getPreferredEbookFormat: useCallback(async (bookId: number) => {
        if (!enabled) return null
        try {
          setLoading(true)
          const format = await api.getPreferredEbookFormat(bookId)
          setError(null)
          return format
        } catch (err) {
          setError(`Failed to get preferred ebook format: ${err instanceof Error ? err.message : 'Unknown error'}`)
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
    },
    
    // Add ebook-specific command
    commands: {
      ...baseHook.actions.commands,
      calibreSync: useCallback(async (bookId?: number) => {
        if (!enabled) return
        try {
          setLoading(true)
          await api.calibreSync(bookId)
          await baseHook.fetch.systemTasks()
          setError(null)
        } catch (err) {
          setError(`Failed to sync with Calibre: ${err instanceof Error ? err.message : 'Unknown error'}`)
        } finally {
          setLoading(false)
        }
      }, [api, baseHook.fetch.systemTasks, enabled]),
    },
  }
  
  // Combine fetch methods
  const fetch = {
    ...baseHook.fetch,
    ...ebookFetch,
  }
  
  // Calculate ebook formats from books
  useEffect(() => {
    if (baseHook.books.length > 0) {
      const formats: Record<string, number> = {}
      
      baseHook.books.forEach(book => {
        book.editions.forEach(edition => {
          if (edition.isEbook) {
            formats[edition.format] = (formats[edition.format] || 0) + 1
          }
        })
      })
      
      setEbookFormats(formats)
    }
  }, [baseHook.books])
  
  // Initial data fetch for ebook-specific data
  useEffect(() => {
    if (enabled) {
      ebookFetch.ebookStatistics()
    }
  }, [enabled, ebookFetch.ebookStatistics])
  
  return {
    ...baseHook,
    ebookFormats,
    ebookStatistics,
    actions,
    fetch,
  }
}