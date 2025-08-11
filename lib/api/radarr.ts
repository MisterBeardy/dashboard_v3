import { 
  RadarrSystemStatus, 
  RadarrSystemHealth, 
  RadarrDiskSpace, 
  RadarrSystemTask, 
  RadarrUpdateInfo,
  RadarrMovie,
  RadarrQueue,
  RadarrHistory,
  RadarrCommand,
  RadarrQualityProfile,
  RadarrWantedMissing
} from './radarr-types'

export class RadarrAPI {
  private baseUrl: string

  constructor(baseUrl: string, apiKey: string = '') {
    this.baseUrl = baseUrl
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}/${endpoint}`
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`Radarr API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // Movie operations
  async getMovies(): Promise<RadarrMovie[]> {
    return this.request<RadarrMovie[]>('movie')
  }

  async getMovieById(id: number): Promise<RadarrMovie> {
    return this.request<RadarrMovie>(`movie/${id}`)
  }

  async addMovie(movie: Partial<RadarrMovie>): Promise<RadarrMovie> {
    return this.request<RadarrMovie>('movie', {
      method: 'POST',
      body: JSON.stringify(movie),
    })
  }

  async updateMovie(movie: RadarrMovie): Promise<RadarrMovie> {
    return this.request<RadarrMovie>(`movie/${movie.id}`, {
      method: 'PUT',
      body: JSON.stringify(movie),
    })
  }

  async deleteMovie(id: number, deleteFiles = false, addImportExclusion = false): Promise<void> {
    const params = new URLSearchParams()
    params.append('deleteFiles', deleteFiles.toString())
    params.append('addImportExclusion', addImportExclusion.toString())
    
    await this.request(`movie/${id}?${params}`, {
      method: 'DELETE',
    })
  }

  // Search operations
  async searchMovie(term: string): Promise<RadarrMovie[]> {
    const params = new URLSearchParams({ term })
    return this.request<RadarrMovie[]>(`movie/lookup?${params}`)
  }

  async searchMovieById(imdbId?: string, tmdbId?: number): Promise<RadarrMovie> {
    const params = new URLSearchParams()
    if (imdbId) params.append('imdbId', imdbId)
    if (tmdbId) params.append('tmdbId', tmdbId.toString())
    
    return this.request<RadarrMovie>(`movie/lookup?${params}`)
  }

  // Queue operations
  async getQueue(): Promise<RadarrQueue> {
    return this.request<RadarrQueue>('queue')
  }

  async deleteQueueItem(id: number, removeFromClient = true, blocklist = true): Promise<void> {
    const params = new URLSearchParams({
      removeFromClient: removeFromClient.toString(),
      blocklist: blocklist.toString(),
    })

    await this.request(`queue/${id}?${params}`, {
      method: 'DELETE',
    })
  }

  // Wanted/missing movies
  async getWantedMissing(page = 1, pageSize = 20, sortKey = 'title', sortDirection = 'asc'): Promise<RadarrWantedMissing> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      sortKey,
      sortDirection,
    })
    
    return this.request<RadarrWantedMissing>(`wanted/missing?${params}`)
  }

  // History operations
  async getHistory(page = 1, pageSize = 20, sortKey = 'date', sortDirection = 'desc'): Promise<RadarrHistory> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      sortKey,
      sortDirection,
    })
    
    return this.request<RadarrHistory>(`history?${params}`)
  }

  // Command operations
  async getCommands(): Promise<RadarrCommand[]> {
    return this.request<RadarrCommand[]>('command')
  }

  async executeCommand(name: string, params?: Record<string, any>): Promise<RadarrCommand> {
    const commandBody = { name, ...params }
    
    return this.request<RadarrCommand>('command', {
      method: 'POST',
      body: JSON.stringify(commandBody),
    })
  }

  async getCommandStatus(id: number): Promise<RadarrCommand> {
    return this.request<RadarrCommand>(`command/${id}`)
  }

  // System operations
  async getSystemStatus(): Promise<RadarrSystemStatus> {
    return this.request<RadarrSystemStatus>('system/status')
  }

  async getSystemHealth(): Promise<RadarrSystemHealth[]> {
    return this.request<RadarrSystemHealth[]>('health')
  }

  async getDiskSpace(): Promise<RadarrDiskSpace[]> {
    return this.request<RadarrDiskSpace[]>('diskspace')
  }

  async getSystemTasks(): Promise<RadarrSystemTask[]> {
    return this.request<RadarrSystemTask[]>('system/task')
  }

  async getUpdateInfo(): Promise<RadarrUpdateInfo> {
    return this.request<RadarrUpdateInfo>('update')
  }

  // Quality profiles
  async getQualityProfiles(): Promise<RadarrQualityProfile[]> {
    return this.request<RadarrQualityProfile[]>('qualityprofile')
  }

  async getQualityProfileById(id: number): Promise<RadarrQualityProfile> {
    return this.request<RadarrQualityProfile>(`qualityprofile/${id}`)
  }

  // Search for missing movies
  async searchMissingMovies(): Promise<void> {
    await this.request('command', {
      method: 'POST',
      body: JSON.stringify({
        name: 'MissingMoviesSearch',
      }),
    })
  }

  // Search for a specific movie
  async searchMovieByIds(movieIds: number[]): Promise<void> {
    await this.request('command', {
      method: 'POST',
      body: JSON.stringify({
        name: 'MoviesSearch',
        movieIds,
      }),
    })
  }

  // Refresh movie information
  async refreshMovie(movieId: number): Promise<void> {
    await this.request('command', {
      method: 'POST',
      body: JSON.stringify({
        name: 'RefreshMovie',
        movieId,
      }),
    })
  }

  // Rescan movie files
  async rescanMovie(movieId: number): Promise<void> {
    await this.request('command', {
      method: 'POST',
      body: JSON.stringify({
        name: 'RescanMovie',
        movieId,
      }),
    })
  }

  // Get root folders
  async getRootFolders(): Promise<any[]> {
    return this.request('rootfolder')
  }

  // Get list of available import lists
  async getImportLists(): Promise<any[]> {
    return this.request('importlist')
  }

  // Get download clients
  async getDownloadClients(): Promise<any[]> {
    return this.request('downloadclient')
  }

  // Get notifications
  async getNotifications(): Promise<any[]> {
    return this.request('notification')
  }

  // Get tags
  async getTags(): Promise<any[]> {
    return this.request('tag')
  }
}