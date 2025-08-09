"use client"

import { useState, useEffect, useCallback } from 'react'
import { SABnzbdAPI, SABnzbdQueue, SABnzbdHistory } from '@/lib/api/sabnzbd'
import { SABnzbdServerStats } from '@/lib/api/sabnzbd-types'

export function useSABnzbd(baseUrl?: string, apiKey?: string) {
  // Prefer the internal proxy route to avoid CORS. Support legacy '/api/sab' by mapping to '/api/sabnzbd'.
  const resolvedBase =
    baseUrl?.startsWith('/api/sabnzbd')
      ? baseUrl
      : baseUrl?.startsWith('/api/sab')
        ? '/api/sabnzbd'
        : '/api/sabnzbd'
  const [api] = useState(() => new SABnzbdAPI(resolvedBase, apiKey || ''))
  const [queue, setQueue] = useState<SABnzbdQueue | null>(null)
  const [history, setHistory] = useState<SABnzbdHistory | null>(null)
  const [serverStats, setServerStats] = useState<SABnzbdServerStats | null>(null)
  const [categories, setCategories] = useState<string[]>([]) // New state for categories
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchQueue = useCallback(async () => {
    try {
      setLoading(true)
      const queueData = await api.getQueue()
      setQueue(queueData)
      setError(null)
    } catch (err) {
      setError('Failed to fetch queue')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [api])

  // Fetch history with full filter support (SAB 4.5)
  const fetchHistory = useCallback(async (start = 0, limit = 50, opts?: { cat?: string; search?: string; nzo_ids?: string[] | string; failed_only?: 0 | 1 | '0' | '1' | boolean }) => {
    try {
      setLoading(true)
      const res = await api.getHistory(start, limit, opts)
      // Normalize into SABnzbdHistory shape for backward compatibility
      setHistory({ slots: res.slots })
      setError(null)
    } catch (err) {
      setError('Failed to fetch history')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [api])

  const fetchServerStats = useCallback(async () => {
    try {
      setLoading(true)
      const stats = await api.getServerStats()
      setServerStats(stats)
      setError(null)
    } catch (err) {
      setError('Failed to fetch server stats')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [api])

  const fetchCategories = useCallback(async () => { // New fetch function for categories
    try {
      setLoading(true)
      const categoriesData = await api.getCategories()
      setCategories(categoriesData)
      setError(null)
    } catch (err) {
      setError('Failed to fetch categories')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [api])

  const queueActions = {
    pause: () => api.pauseQueue().then(fetchQueue),
    resume: () => api.resumeQueue().then(fetchQueue),
    deleteItem: (nzoId: string) => api.deleteItem(nzoId).then(fetchQueue),
    pauseItem: (nzoId: string) => api.pauseItem(nzoId).then(fetchQueue),
    resumeItem: (nzoId: string) => api.resumeItem(nzoId).then(fetchQueue),
    moveItem: (nzoId: string, position: number) => api.moveItem(nzoId, position).then(fetchQueue),
    setPriority: (nzoId: string, priority: string) =>
      api.setPriority(nzoId, priority as import('@/lib/api/sabnzbd').SabPriority).then(fetchQueue),
    setCategory: (nzoId: string, category: string) => api.setCategory(nzoId, category).then(fetchQueue),

    // New: add NZB by URL
    addUrl: async (url: string, name?: string, category?: string, priority?: string) => {
      await api.addUrl(url, name, category, priority)
      await fetchQueue()
    },

    // New: add NZB from file (reads file text in browser)
    addNzbFromFile: async (file: File, name?: string, category?: string, priority?: string) => {
      const nzbText = await file.text()
      const effectiveName = name || file.name || 'upload.nzb'
      await api.addNzb(nzbText, effectiveName, category, priority)
      await fetchQueue()
    },

    // Full-queue filtered fetch passthrough
    getQueueDetails: (start = 0, limit = 50, opts?: { cat?: string; priority?: string; search?: string; nzo_ids?: string[] | string }) =>
      api.getQueueDetails(start, limit, opts),
  }

  // Auto-refresh queue every 5 seconds
  useEffect(() => {
    fetchQueue()
    const interval = setInterval(fetchQueue, 5000)
    return () => clearInterval(interval)
  }, [fetchQueue])

  // Fetch categories once on mount
  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

 return {
   queue,
   history,
   serverStats,
   categories, // Expose categories
   loading,
   error,
   actions: queueActions,
   fetchQueue,
   // Expose history fetcher with filters
   fetchHistory: (start = 0, limit = 50, opts?: { cat?: string; search?: string; nzo_ids?: string[] | string; failed_only?: 0 | 1 | '0' | '1' | boolean }) =>
     fetchHistory(start, limit, opts),
   fetchServerStats,
   fetchCategories, // Expose fetchCategories
   // Surface queue details helper for UI filters (full queue output)
   getQueueDetails: (start = 0, limit = 50, opts?: { cat?: string; priority?: string; search?: string; nzo_ids?: string[] | string }) =>
     api.getQueueDetails(start, limit, opts),
   api
 }
}
