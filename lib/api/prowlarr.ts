import { 
  ProwlarrSystemStatus, 
  ProwlarrSystemHealth, 
  ProwlarrDiskSpace, 
  ProwlarrSystemTask, 
  ProwlarrUpdateInfo,
  ProwlarrIndexer,
  ProwlarrDownloadClient,
  ProwlarrApplication,
  ProwlarrCommand,
  ProwlarrNotification,
  ProwlarrTag,
  ProwlarrLog,
  ProwlarrHistory,
  ProwlarrRelease
} from './prowlarr-types'

export class ProwlarrAPI {
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
      throw new Error(`Prowlarr API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // Indexer operations
  async getIndexers(): Promise<ProwlarrIndexer[]> {
    return this.request<ProwlarrIndexer[]>('indexer')
  }

  async getIndexerById(id: number): Promise<ProwlarrIndexer> {
    return this.request<ProwlarrIndexer>(`indexer/${id}`)
  }

  async addIndexer(indexer: Partial<ProwlarrIndexer>): Promise<ProwlarrIndexer> {
    return this.request<ProwlarrIndexer>('indexer', {
      method: 'POST',
      body: JSON.stringify(indexer),
    })
  }

  async updateIndexer(indexer: ProwlarrIndexer): Promise<ProwlarrIndexer> {
    return this.request<ProwlarrIndexer>(`indexer/${indexer.id}`, {
      method: 'PUT',
      body: JSON.stringify(indexer),
    })
  }

  async deleteIndexer(id: number): Promise<void> {
    await this.request(`indexer/${id}`, {
      method: 'DELETE',
    })
  }

  // Download client operations
  async getDownloadClients(): Promise<ProwlarrDownloadClient[]> {
    return this.request<ProwlarrDownloadClient[]>('downloadclient')
  }

  async getDownloadClientById(id: number): Promise<ProwlarrDownloadClient> {
    return this.request<ProwlarrDownloadClient>(`downloadclient/${id}`)
  }

  async addDownloadClient(client: Partial<ProwlarrDownloadClient>): Promise<ProwlarrDownloadClient> {
    return this.request<ProwlarrDownloadClient>('downloadclient', {
      method: 'POST',
      body: JSON.stringify(client),
    })
  }

  async updateDownloadClient(client: ProwlarrDownloadClient): Promise<ProwlarrDownloadClient> {
    return this.request<ProwlarrDownloadClient>(`downloadclient/${client.id}`, {
      method: 'PUT',
      body: JSON.stringify(client),
    })
  }

  async deleteDownloadClient(id: number): Promise<void> {
    await this.request(`downloadclient/${id}`, {
      method: 'DELETE',
    })
  }

  // Application operations
  async getApplications(): Promise<ProwlarrApplication[]> {
    return this.request<ProwlarrApplication[]>('application')
  }

  async getApplicationById(id: number): Promise<ProwlarrApplication> {
    return this.request<ProwlarrApplication>(`application/${id}`)
  }

  async addApplication(application: Partial<ProwlarrApplication>): Promise<ProwlarrApplication> {
    return this.request<ProwlarrApplication>('application', {
      method: 'POST',
      body: JSON.stringify(application),
    })
  }

  async updateApplication(application: ProwlarrApplication): Promise<ProwlarrApplication> {
    return this.request<ProwlarrApplication>(`application/${application.id}`, {
      method: 'PUT',
      body: JSON.stringify(application),
    })
  }

  async deleteApplication(id: number): Promise<void> {
    await this.request(`application/${id}`, {
      method: 'DELETE',
    })
  }

  // Notification operations
  async getNotifications(): Promise<ProwlarrNotification[]> {
    return this.request<ProwlarrNotification[]>('notification')
  }

  async getNotificationById(id: number): Promise<ProwlarrNotification> {
    return this.request<ProwlarrNotification>(`notification/${id}`)
  }

  async addNotification(notification: Partial<ProwlarrNotification>): Promise<ProwlarrNotification> {
    return this.request<ProwlarrNotification>('notification', {
      method: 'POST',
      body: JSON.stringify(notification),
    })
  }

  async updateNotification(notification: ProwlarrNotification): Promise<ProwlarrNotification> {
    return this.request<ProwlarrNotification>(`notification/${notification.id}`, {
      method: 'PUT',
      body: JSON.stringify(notification),
    })
  }

  async deleteNotification(id: number): Promise<void> {
    await this.request(`notification/${id}`, {
      method: 'DELETE',
    })
  }

  // Tag operations
  async getTags(): Promise<ProwlarrTag[]> {
    return this.request<ProwlarrTag[]>('tag')
  }

  async getTagById(id: number): Promise<ProwlarrTag> {
    return this.request<ProwlarrTag>(`tag/${id}`)
  }

  async addTag(tag: Partial<ProwlarrTag>): Promise<ProwlarrTag> {
    return this.request<ProwlarrTag>('tag', {
      method: 'POST',
      body: JSON.stringify(tag),
    })
  }

  async updateTag(tag: ProwlarrTag): Promise<ProwlarrTag> {
    return this.request<ProwlarrTag>(`tag/${tag.id}`, {
      method: 'PUT',
      body: JSON.stringify(tag),
    })
  }

  async deleteTag(id: number): Promise<void> {
    await this.request(`tag/${id}`, {
      method: 'DELETE',
    })
  }

  // Command operations
  async getCommands(): Promise<ProwlarrCommand[]> {
    return this.request<ProwlarrCommand[]>('command')
  }

  async executeCommand(name: string, params?: Record<string, any>): Promise<ProwlarrCommand> {
    const commandBody = { name, ...params }
    
    return this.request<ProwlarrCommand>('command', {
      method: 'POST',
      body: JSON.stringify(commandBody),
    })
  }

  async getCommandStatus(id: number): Promise<ProwlarrCommand> {
    return this.request<ProwlarrCommand>(`command/${id}`)
  }

  // System operations
  async getSystemStatus(): Promise<ProwlarrSystemStatus> {
    return this.request<ProwlarrSystemStatus>('system/status')
  }

  async getSystemHealth(): Promise<ProwlarrSystemHealth[]> {
    return this.request<ProwlarrSystemHealth[]>('health')
  }

  async getDiskSpace(): Promise<ProwlarrDiskSpace[]> {
    return this.request<ProwlarrDiskSpace[]>('diskspace')
  }

  async getSystemTasks(): Promise<ProwlarrSystemTask[]> {
    return this.request<ProwlarrSystemTask[]>('system/task')
  }

  async getUpdateInfo(): Promise<ProwlarrUpdateInfo> {
    return this.request<ProwlarrUpdateInfo>('update')
  }

  // History operations
  async getHistory(page = 1, pageSize = 20, sortKey = 'date', sortDirection = 'desc'): Promise<ProwlarrHistory> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      sortKey,
      sortDirection,
    })
    
    return this.request<ProwlarrHistory>(`history?${params}`)
  }

  // Log operations
  async getLogs(page = 1, pageSize = 50): Promise<ProwlarrLog[]> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    })
    
    return this.request<ProwlarrLog[]>(`log?${params}`)
  }

  // Indexer status operations
  async getIndexerStatus(): Promise<any[]> {
    return this.request('indexerstatus')
  }

  // Download client status operations
  async getDownloadClientStatus(): Promise<any[]> {
    return this.request('downloadclientstatus')
  }

  // Application status operations
  async getApplicationStatus(): Promise<any[]> {
    return this.request('applicationstatus')
  }

  // Release operations
  async getReleases(): Promise<ProwlarrRelease[]> {
    return this.request<ProwlarrRelease[]>('release')
  }

  async pushRelease(release: ProwlarrRelease): Promise<void> {
    await this.request('release/push', {
      method: 'POST',
      body: JSON.stringify(release),
    })
  }

  // Test all indexers
  async testAllIndexers(): Promise<void> {
    await this.request('command', {
      method: 'POST',
      body: JSON.stringify({
        name: 'TestAllIndexers',
      }),
    })
  }

  // Test specific indexer
  async testIndexer(indexerId: number): Promise<void> {
    await this.request('command', {
      method: 'POST',
      body: JSON.stringify({
        name: 'TestIndexer',
        indexerId,
      }),
    })
  }

  // Refresh indexers
  async refreshIndexers(): Promise<void> {
    await this.request('command', {
      method: 'POST',
      body: JSON.stringify({
        name: 'RefreshIndexers',
      }),
    })
  }

  // Lookup indexer
  async lookupIndexer(term: string): Promise<any[]> {
    const params = new URLSearchParams({
      term,
    })
    
    return this.request<any[]>(`indexer/lookup?${params}`)
  }
}