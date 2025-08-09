import { SonarrSystemStatus, SonarrSystemHealth, SonarrDiskSpace, SonarrSystemTask, SonarrUpdateInfo } from './sonarr-types'
// Sonarr API integration layer
export interface SonarrSeries {
  id: number
  title: string
  year: number
  status: string
  monitored: boolean
  seasonCount: number
  episodeCount: number
  episodeFileCount: number
  sizeOnDisk: number
  qualityProfileId: number
  languageProfileId: number
  network: string
  airTime: string
  nextAiring?: string
  previousAiring?: string
  images: SonarrImage[]
  seasons: SonarrSeason[]
  path: string
  rootFolderPath: string
  overview: string
  tvdbId: number
  tvMazeId: number
  imdbId: string
  titleSlug: string
  certification: string
  genres: string[]
  tags: number[]
  added: string
  ratings: SonarrRating
  statistics: SonarrStatistics
}

export interface SonarrEpisode {
  id: number
  seriesId: number
  tvdbId: number
  episodeFileId: number
  seasonNumber: number
  episodeNumber: number
  title: string
  airDate: string
  airDateUtc: string
  overview: string
  hasFile: boolean
  monitored: boolean
  absoluteEpisodeNumber?: number
  unverifiedSceneNumbering: boolean
  series: SonarrSeries
  episodeFile?: SonarrEpisodeFile
}

export interface SonarrEpisodeFile {
  id: number
  seriesId: number
  seasonNumber: number
  relativePath: string
  path: string
  size: number
  dateAdded: string
  sceneName: string
  quality: SonarrQuality
  mediaInfo: SonarrMediaInfo
  originalFilePath: string
  qualityCutoffNotMet: boolean
  languageCutoffNotMet: boolean
}

export interface SonarrQuality {
  quality: {
    id: number
    name: string
    source: string
    resolution: number
  }
  revision: {
    version: number
    real: number
    isRepack: boolean
  }
}

export interface SonarrImage {
  coverType: string
  url: string
  remoteUrl: string
}

export interface SonarrSeason {
  seasonNumber: number
  monitored: boolean
  statistics: {
    episodeFileCount: number
    episodeCount: number
    totalEpisodeCount: number
    sizeOnDisk: number
    percentOfEpisodes: number
  }
}

export interface SonarrRating {
  votes: number
  value: number
}

export interface SonarrStatistics {
  seasonCount: number
  episodeFileCount: number
  episodeCount: number
  totalEpisodeCount: number
  sizeOnDisk: number
  percentOfEpisodes: number
}

export interface SonarrMediaInfo {
  audioChannels: number
  audioCodec: string
  videoCodec: string
}

export interface SonarrCalendar {
  id: number
  seriesId: number
  episodeFileId: number
  seasonNumber: number
  episodeNumber: number
  title: string
  airDate: string
  airDateUtc: string
  overview: string
  hasFile: boolean
  monitored: boolean
  series: SonarrSeries
}

export interface SonarrActivity {
  page: number
  pageSize: number
  sortKey: string
  sortDirection: string
  totalRecords: number
  records: SonarrActivityRecord[]
}

export interface SonarrActivityRecord {
  id: number
  episodeId: number
  seriesId: number
  sourceTitle: string
  quality: SonarrQuality
  date: string
  eventType: string
  data: Record<string, any>
  series: SonarrSeries
  episode: SonarrEpisode
}

export class SonarrAPI {
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
      throw new Error(`Sonarr API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // Series operations
  async getSeries(): Promise<SonarrSeries[]> {
    return this.request<SonarrSeries[]>('series')
  }

  async getSeriesById(id: number): Promise<SonarrSeries> {
    return this.request<SonarrSeries>(`series/${id}`)
  }

  async addSeries(series: Partial<SonarrSeries>): Promise<SonarrSeries> {
    return this.request<SonarrSeries>('series', {
      method: 'POST',
      body: JSON.stringify(series),
    })
  }

  async updateSeries(series: SonarrSeries): Promise<SonarrSeries> {
    return this.request<SonarrSeries>(`series/${series.id}`, {
      method: 'PUT',
      body: JSON.stringify(series),
    })
  }

  async deleteSeries(id: number, deleteFiles = false): Promise<void> {
    await this.request(`series/${id}?deleteFiles=${deleteFiles}`, {
      method: 'DELETE',
    })
  }

  // Episode operations
  async getEpisodes(seriesId?: number): Promise<SonarrEpisode[]> {
    const endpoint = seriesId ? `episode?seriesId=${seriesId}` : 'episode'
    return this.request<SonarrEpisode[]>(endpoint)
  }

  async getEpisodeById(id: number): Promise<SonarrEpisode> {
    return this.request<SonarrEpisode>(`episode/${id}`)
  }

  async updateEpisode(episode: SonarrEpisode): Promise<SonarrEpisode> {
    return this.request<SonarrEpisode>(`episode/${episode.id}`, {
      method: 'PUT',
      body: JSON.stringify(episode),
    })
  }

  // Calendar
  async getCalendar(start?: string, end?: string): Promise<SonarrCalendar[]> {
    const params = new URLSearchParams()
    if (start) params.append('start', start)
    if (end) params.append('end', end)
    
    const endpoint = `calendar${params.toString() ? `?${params}` : ''}`
    return this.request<SonarrCalendar[]>(endpoint)
  }

  // Wanted episodes
  async getWanted(page = 1, pageSize = 20, sortKey = 'airDateUtc', sortDirection = 'desc'): Promise<{
    page: number
    pageSize: number
    sortKey: string
    sortDirection: string
    totalRecords: number
    records: SonarrEpisode[]
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      sortKey,
      sortDirection,
    })
    
    return this.request(`wanted/missing?${params}`)
  }

  // Activity/History
  async getActivity(page = 1, pageSize = 20): Promise<SonarrActivity> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    })
    
    return this.request(`history?${params}`)
  }

  // Search operations
  async searchSeries(term: string): Promise<SonarrSeries[]> {
    const params = new URLSearchParams({ term })
    return this.request<SonarrSeries[]>(`series/lookup?${params}`)
  }

  async searchEpisode(episodeId: number): Promise<void> {
    await this.request(`command`, {
      method: 'POST',
      body: JSON.stringify({
        name: 'EpisodeSearch',
        episodeIds: [episodeId],
      }),
    })
  }

  async searchSeason(seriesId: number, seasonNumber: number): Promise<void> {
    await this.request(`command`, {
      method: 'POST',
      body: JSON.stringify({
        name: 'SeasonSearch',
        seriesId,
        seasonNumber,
      }),
    })
  }

  async searchAllMissing(): Promise<void> {
    await this.request(`command`, {
      method: 'POST',
      body: JSON.stringify({
        name: 'MissingEpisodeSearch',
      }),
    })
  }

  // System operations
  async getSystemStatus(): Promise<SonarrSystemStatus> {
    return this.request<SonarrSystemStatus>('system/status')
  }

  async getSystemHealth(): Promise<SonarrSystemHealth[]> {
    return this.request<SonarrSystemHealth[]>('health')
  }

  async getDiskSpace(): Promise<SonarrDiskSpace[]> {
    return this.request<SonarrDiskSpace[]>('diskspace')
  }

  async getSystemTasks(): Promise<SonarrSystemTask[]> {
    return this.request<SonarrSystemTask[]>('system/task')
  }

  async getUpdateInfo(): Promise<SonarrUpdateInfo> {
    return this.request<SonarrUpdateInfo>('update')
  }

  async getQualityProfiles(): Promise<any[]> {
    return this.request('qualityprofile')
  }

  async getLanguageProfiles(): Promise<any[]> {
    return this.request('languageprofile')
  }

  async getRootFolders(): Promise<any[]> {
    return this.request('rootfolder')
  }

  // Queue operations
  async getQueue(): Promise<any> {
    return this.request('queue')
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
}
