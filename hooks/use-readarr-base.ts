import { useState, useEffect, useCallback } from 'react'
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

interface UseReadarrBaseProps {
  enabled?: boolean
  apiUrl?: string
  apiKey?: string
}

interface UseReadarrBaseReturn {
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
  }
  
  // State
  loading: boolean
  error: string | null
}

export abstract class ReadarrBaseAPI {
  protected baseUrl: string
  protected apiKey: string

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl
    this.apiKey = apiKey
  }

  // Abstract methods to be implemented by subclasses
  abstract getBooks(options?: any): Promise<ReadarrBaseBook[]>
  abstract getBook(id: number): Promise<ReadarrBaseBook>
  abstract addBook(book: Partial<ReadarrBaseBook>): Promise<ReadarrBaseBook>
  abstract updateBook(book: Partial<ReadarrBaseBook>): Promise<ReadarrBaseBook>
  abstract deleteBook(id: number, deleteFiles?: boolean): Promise<void>
  
  abstract getAuthors(options?: any): Promise<ReadarrBaseAuthor[]>
  abstract getAuthor(id: number): Promise<ReadarrBaseAuthor>
  abstract addAuthor(author: Partial<ReadarrBaseAuthor>): Promise<ReadarrBaseAuthor>
  abstract updateAuthor(author: Partial<ReadarrBaseAuthor>): Promise<ReadarrBaseAuthor>
  abstract deleteAuthor(id: number, deleteFiles?: boolean): Promise<void>
  
  abstract getBookFiles(bookId?: number): Promise<ReadarrBaseBookFile[]>
  abstract getQueue(options?: any): Promise<ReadarrBaseQueue>
  abstract grabQueueItem(id: number): Promise<void>
  abstract removeQueueItem(id: number, blacklist?: boolean): Promise<void>
  
  abstract getSystemStatus(): Promise<ReadarrBaseSystemStatus>
  abstract getSystemHealth(): Promise<ReadarrBaseSystemHealth[]>
  abstract getCommands(): Promise<ReadarrBaseCommand[]>
  abstract getCommand(id: number): Promise<ReadarrBaseCommand>
  abstract executeCommand(commandName: string, params?: Record<string, any>): Promise<ReadarrBaseCommand>
  
  abstract getHistory(options?: any): Promise<ReadarrBaseHistory>
  abstract getWantedMissing(options?: any): Promise<ReadarrBaseWantedMissing>
  
  abstract getQualityProfiles(): Promise<ReadarrBaseQualityProfile[]>
  abstract getMetadataProfiles(): Promise<ReadarrBaseMetadataProfile[]>
  abstract getRootFolders(): Promise<ReadarrBaseRootFolder[]>
  
  abstract getNotifications(): Promise<ReadarrBaseNotification[]>
  abstract testNotification(id: number): Promise<ReadarrBaseNotification>
  
  abstract getTags(): Promise<ReadarrBaseTag[]>
  abstract createTag(label: string): Promise<ReadarrBaseTag>
  abstract updateTag(id: number, label: string): Promise<ReadarrBaseTag>
  abstract deleteTag(id: number): Promise<void>
  
  abstract getLogs(options?: any): Promise<ReadarrBaseLog[]>
  abstract getDownloadClients(): Promise<ReadarrBaseDownloadClient[]>
  abstract testDownloadClient(id: number): Promise<ReadarrBaseDownloadClient>
  
  abstract searchBooks(term: string, options?: any): Promise<ReadarrBaseBook[]>
  abstract searchAuthors(term: string, options?: any): Promise<ReadarrBaseAuthor[]>
  
  abstract refreshAuthor(id: number): Promise<ReadarrBaseCommand>
  abstract refreshBook(id: number): Promise<ReadarrBaseCommand>
  abstract authorSearch(id: number): Promise<ReadarrBaseCommand>
  abstract bookSearch(id: number): Promise<ReadarrBaseCommand>
  abstract renameFiles(id: number): Promise<ReadarrBaseCommand>
  abstract rescanBook(id: number): Promise<ReadarrBaseCommand>
  abstract missingBookSearch(): Promise<ReadarrBaseCommand>
  abstract rssSync(): Promise<ReadarrBaseCommand>
}

export function useReadarrBase<T extends ReadarrBaseAPI>(
  apiClass: new (baseUrl: string, apiKey: string) => T,
  { enabled = true, apiUrl, apiKey }: UseReadarrBaseProps = {}
): UseReadarrBaseReturn {
  const [books, setBooks] = useState<ReadarrBaseBook[]>([])
  const [authors, setAuthors] = useState<ReadarrBaseAuthor[]>([])
  const [bookFiles, setBookFiles] = useState<ReadarrBaseBookFile[]>([])
  const [queue, setQueue] = useState<ReadarrBaseQueue>({
    page: 1,
    pageSize: 20,
    sortKey: 'timeleft',
    sortDirection: 'asc',
    totalRecords: 0,
    records: []
  })
  const [systemStatus, setSystemStatus] = useState<ReadarrBaseSystemStatus | null>(null)
  const [systemHealth, setSystemHealth] = useState<ReadarrBaseSystemHealth[]>([])
  const [systemTasks, setSystemTasks] = useState<ReadarrBaseCommand[]>([])
  const [history, setHistory] = useState<ReadarrBaseHistory>({
    page: 1,
    pageSize: 20,
    sortKey: 'date',
    sortDirection: 'desc',
    totalRecords: 0,
    records: []
  })
  const [wantedMissing, setWantedMissing] = useState<ReadarrBaseWantedMissing>({
    page: 1,
    pageSize: 20,
    sortKey: 'title',
    sortDirection: 'asc',
    totalRecords: 0,
    records: []
  })
  const [qualityProfiles, setQualityProfiles] = useState<ReadarrBaseQualityProfile[]>([])
  const [metadataProfiles, setMetadataProfiles] = useState<ReadarrBaseMetadataProfile[]>([])
  const [rootFolders, setRootFolders] = useState<ReadarrBaseRootFolder[]>([])
  const [notifications, setNotifications] = useState<ReadarrBaseNotification[]>([])
  const [tags, setTags] = useState<ReadarrBaseTag[]>([])
  const [logs, setLogs] = useState<ReadarrBaseLog[]>([])
  const [downloadClients, setDownloadClients] = useState<ReadarrBaseDownloadClient[]>([])
  const [searchResults, setSearchResults] = useState<{
    books: ReadarrBaseBook[]
    authors: ReadarrBaseAuthor[]
  }>({ books: [], authors: [] })
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize API client
  const api = new apiClass(apiUrl || '/api/readarr', apiKey || '')

  // Fetch methods
  const fetch = {
    books: useCallback(async () => {
      if (!enabled) return
      try {
        setLoading(true)
        const data = await api.getBooks()
        setBooks(data)
        setError(null)
      } catch (err) {
        setError(`Failed to fetch books: ${err instanceof Error ? err.message : 'Unknown error'}`)
      } finally {
        setLoading(false)
      }
    }, [api, enabled]),

    authors: useCallback(async () => {
      if (!enabled) return
      try {
        setLoading(true)
        const data = await api.getAuthors()
        setAuthors(data)
        setError(null)
      } catch (err) {
        setError(`Failed to fetch authors: ${err instanceof Error ? err.message : 'Unknown error'}`)
      } finally {
        setLoading(false)
      }
    }, [api, enabled]),

    bookFiles: useCallback(async (bookId?: number) => {
      if (!enabled) return
      try {
        setLoading(true)
        const data = await api.getBookFiles(bookId)
        setBookFiles(data)
        setError(null)
      } catch (err) {
        setError(`Failed to fetch book files: ${err instanceof Error ? err.message : 'Unknown error'}`)
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

    metadataProfiles: useCallback(async () => {
      if (!enabled) return
      try {
        setLoading(true)
        const data = await api.getMetadataProfiles()
        setMetadataProfiles(data)
        setError(null)
      } catch (err) {
        setError(`Failed to fetch metadata profiles: ${err instanceof Error ? err.message : 'Unknown error'}`)
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

    logs: useCallback(async () => {
      if (!enabled) return
      try {
        setLoading(true)
        const data = await api.getLogs()
        setLogs(data)
        setError(null)
      } catch (err) {
        setError(`Failed to fetch logs: ${err instanceof Error ? err.message : 'Unknown error'}`)
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
  }

  // Actions
  const actions = {
    books: {
      addBook: useCallback(async (book: Partial<ReadarrBaseBook>) => {
        if (!enabled) return
        try {
          setLoading(true)
          await api.addBook(book)
          await fetch.books()
          setError(null)
        } catch (err) {
          setError(`Failed to add book: ${err instanceof Error ? err.message : 'Unknown error'}`)
        } finally {
          setLoading(false)
        }
      }, [api, fetch.books, enabled]),

      updateBook: useCallback(async (book: Partial<ReadarrBaseBook>) => {
        if (!enabled) return
        try {
          setLoading(true)
          await api.updateBook(book)
          await fetch.books()
          setError(null)
        } catch (err) {
          setError(`Failed to update book: ${err instanceof Error ? err.message : 'Unknown error'}`)
        } finally {
          setLoading(false)
        }
      }, [api, fetch.books, enabled]),

      deleteBook: useCallback(async (id: number, deleteFiles: boolean = false) => {
        if (!enabled) return
        try {
          setLoading(true)
          await api.deleteBook(id, deleteFiles)
          await fetch.books()
          setError(null)
        } catch (err) {
          setError(`Failed to delete book: ${err instanceof Error ? err.message : 'Unknown error'}`)
        } finally {
          setLoading(false)
        }
      }, [api, fetch.books, enabled]),

      refreshBook: useCallback(async (id: number) => {
        if (!enabled) return
        try {
          setLoading(true)
          await api.refreshBook(id)
          await fetch.systemTasks()
          setError(null)
        } catch (err) {
          setError(`Failed to refresh book: ${err instanceof Error ? err.message : 'Unknown error'}`)
        } finally {
          setLoading(false)
        }
      }, [api, fetch.systemTasks, enabled]),

      searchBook: useCallback(async (id: number) => {
        if (!enabled) return
        try {
          setLoading(true)
          await api.bookSearch(id)
          await fetch.systemTasks()
          setError(null)
        } catch (err) {
          setError(`Failed to search for book: ${err instanceof Error ? err.message : 'Unknown error'}`)
        } finally {
          setLoading(false)
        }
      }, [api, fetch.systemTasks, enabled]),

      rescanBook: useCallback(async (id: number) => {
        if (!enabled) return
        try {
          setLoading(true)
          await api.rescanBook(id)
          await fetch.systemTasks()
          setError(null)
        } catch (err) {
          setError(`Failed to rescan book: ${err instanceof Error ? err.message : 'Unknown error'}`)
        } finally {
          setLoading(false)
        }
      }, [api, fetch.systemTasks, enabled]),

      renameFiles: useCallback(async (id: number) => {
        if (!enabled) return
        try {
          setLoading(true)
          await api.renameFiles(id)
          await fetch.systemTasks()
          setError(null)
        } catch (err) {
          setError(`Failed to rename files: ${err instanceof Error ? err.message : 'Unknown error'}`)
        } finally {
          setLoading(false)
        }
      }, [api, fetch.systemTasks, enabled]),
    },

    authors: {
      addAuthor: useCallback(async (author: Partial<ReadarrBaseAuthor>) => {
        if (!enabled) return
        try {
          setLoading(true)
          await api.addAuthor(author)
          await fetch.authors()
          setError(null)
        } catch (err) {
          setError(`Failed to add author: ${err instanceof Error ? err.message : 'Unknown error'}`)
        } finally {
          setLoading(false)
        }
      }, [api, fetch.authors, enabled]),

      updateAuthor: useCallback(async (author: Partial<ReadarrBaseAuthor>) => {
        if (!enabled) return
        try {
          setLoading(true)
          await api.updateAuthor(author)
          await fetch.authors()
          setError(null)
        } catch (err) {
          setError(`Failed to update author: ${err instanceof Error ? err.message : 'Unknown error'}`)
        } finally {
          setLoading(false)
        }
      }, [api, fetch.authors, enabled]),

      deleteAuthor: useCallback(async (id: number, deleteFiles: boolean = false) => {
        if (!enabled) return
        try {
          setLoading(true)
          await api.deleteAuthor(id, deleteFiles)
          await fetch.authors()
          setError(null)
        } catch (err) {
          setError(`Failed to delete author: ${err instanceof Error ? err.message : 'Unknown error'}`)
        } finally {
          setLoading(false)
        }
      }, [api, fetch.authors, enabled]),

      refreshAuthor: useCallback(async (id: number) => {
        if (!enabled) return
        try {
          setLoading(true)
          await api.refreshAuthor(id)
          await fetch.systemTasks()
          setError(null)
        } catch (err) {
          setError(`Failed to refresh author: ${err instanceof Error ? err.message : 'Unknown error'}`)
        } finally {
          setLoading(false)
        }
      }, [api, fetch.systemTasks, enabled]),

      searchAuthor: useCallback(async (id: number) => {
        if (!enabled) return
        try {
          setLoading(true)
          await api.authorSearch(id)
          await fetch.systemTasks()
          setError(null)
        } catch (err) {
          setError(`Failed to search for author: ${err instanceof Error ? err.message : 'Unknown error'}`)
        } finally {
          setLoading(false)
        }
      }, [api, fetch.systemTasks, enabled]),
    },

    queue: {
      grabItem: useCallback(async (id: number) => {
        if (!enabled) return
        try {
          setLoading(true)
          await api.grabQueueItem(id)
          await fetch.queue()
          setError(null)
        } catch (err) {
          setError(`Failed to grab queue item: ${err instanceof Error ? err.message : 'Unknown error'}`)
        } finally {
          setLoading(false)
        }
      }, [api, fetch.queue, enabled]),

      removeItem: useCallback(async (id: number, blacklist: boolean = false) => {
        if (!enabled) return
        try {
          setLoading(true)
          await api.removeQueueItem(id, blacklist)
          await fetch.queue()
          setError(null)
        } catch (err) {
          setError(`Failed to remove queue item: ${err instanceof Error ? err.message : 'Unknown error'}`)
        } finally {
          setLoading(false)
        }
      }, [api, fetch.queue, enabled]),
    },

    commands: {
      executeCommand: useCallback(async (name: string, params?: Record<string, any>) => {
        if (!enabled) return
        try {
          setLoading(true)
          await api.executeCommand(name, params)
          await fetch.systemTasks()
          setError(null)
        } catch (err) {
          setError(`Failed to execute command: ${err instanceof Error ? err.message : 'Unknown error'}`)
        } finally {
          setLoading(false)
        }
      }, [api, fetch.systemTasks, enabled]),

      missingBookSearch: useCallback(async () => {
        if (!enabled) return
        try {
          setLoading(true)
          await api.missingBookSearch()
          await fetch.systemTasks()
          setError(null)
        } catch (err) {
          setError(`Failed to search for missing books: ${err instanceof Error ? err.message : 'Unknown error'}`)
        } finally {
          setLoading(false)
        }
      }, [api, fetch.systemTasks, enabled]),

      rssSync: useCallback(async () => {
        if (!enabled) return
        try {
          setLoading(true)
          await api.rssSync()
          await fetch.systemTasks()
          setError(null)
        } catch (err) {
          setError(`Failed to perform RSS sync: ${err instanceof Error ? err.message : 'Unknown error'}`)
        } finally {
          setLoading(false)
        }
      }, [api, fetch.systemTasks, enabled]),
    },

    search: {
      searchBooks: useCallback(async (term: string) => {
        if (!enabled) return
        try {
          setLoading(true)
          const data = await api.searchBooks(term)
          setSearchResults(prev => ({ ...prev, books: data }))
          setError(null)
        } catch (err) {
          setError(`Failed to search books: ${err instanceof Error ? err.message : 'Unknown error'}`)
        } finally {
          setLoading(false)
        }
      }, [api, enabled]),

      searchAuthors: useCallback(async (term: string) => {
        if (!enabled) return
        try {
          setLoading(true)
          const data = await api.searchAuthors(term)
          setSearchResults(prev => ({ ...prev, authors: data }))
          setError(null)
        } catch (err) {
          setError(`Failed to search authors: ${err instanceof Error ? err.message : 'Unknown error'}`)
        } finally {
          setLoading(false)
        }
      }, [api, enabled]),
    },

    tags: {
      createTag: useCallback(async (label: string) => {
        if (!enabled) return
        try {
          setLoading(true)
          await api.createTag(label)
          await fetch.tags()
          setError(null)
        } catch (err) {
          setError(`Failed to create tag: ${err instanceof Error ? err.message : 'Unknown error'}`)
        } finally {
          setLoading(false)
        }
      }, [api, fetch.tags, enabled]),

      updateTag: useCallback(async (id: number, label: string) => {
        if (!enabled) return
        try {
          setLoading(true)
          await api.updateTag(id, label)
          await fetch.tags()
          setError(null)
        } catch (err) {
          setError(`Failed to update tag: ${err instanceof Error ? err.message : 'Unknown error'}`)
        } finally {
          setLoading(false)
        }
      }, [api, fetch.tags, enabled]),

      deleteTag: useCallback(async (id: number) => {
        if (!enabled) return
        try {
          setLoading(true)
          await api.deleteTag(id)
          await fetch.tags()
          setError(null)
        } catch (err) {
          setError(`Failed to delete tag: ${err instanceof Error ? err.message : 'Unknown error'}`)
        } finally {
          setLoading(false)
        }
      }, [api, fetch.tags, enabled]),
    },
  }

  // Initial data fetch
  useEffect(() => {
    if (enabled) {
      fetch.books()
      fetch.authors()
      fetch.systemStatus()
      fetch.systemHealth()
      fetch.systemTasks()
      fetch.qualityProfiles()
      fetch.metadataProfiles()
    }
  }, [enabled, fetch.books, fetch.authors, fetch.systemStatus, fetch.systemHealth, fetch.systemTasks, fetch.qualityProfiles, fetch.metadataProfiles])

  return {
    books,
    authors,
    bookFiles,
    queue,
    systemStatus,
    systemHealth,
    systemTasks,
    history,
    wantedMissing,
    qualityProfiles,
    metadataProfiles,
    rootFolders,
    notifications,
    tags,
    logs,
    downloadClients,
    searchResults,
    actions,
    fetch,
    loading,
    error,
  }
}