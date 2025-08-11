import { 
  ReadarrBaseSystemStatus, 
  ReadarrBaseSystemHealth, 
  ReadarrBaseDiskSpace,
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
} from './readarr-base-types';

export abstract class ReadarrBaseAPI {
  protected baseUrl: string;
  protected apiKey: string;
  protected apiVersion: string = 'v1';

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  protected async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}/api/${this.apiVersion}${endpoint}`;
    const headers = {
      'X-Api-Key': this.apiKey,
      'Content-Type': 'application/json',
      ...options?.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`Readarr API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // System Operations
  async getSystemStatus(): Promise<ReadarrBaseSystemStatus> {
    return this.request<ReadarrBaseSystemStatus>('/system/status');
  }

  async getSystemHealth(): Promise<ReadarrBaseSystemHealth[]> {
    return this.request<ReadarrBaseSystemHealth[]>('/health');
  }

  async getDiskSpace(): Promise<ReadarrBaseDiskSpace[]> {
    return this.request<ReadarrBaseDiskSpace[]>('/diskspace');
  }

  // Book Operations
  async getBooks(options?: {
    page?: number;
    pageSize?: number;
    sortKey?: string;
    sortDirection?: string;
    authorId?: number;
    title?: string;
    monitored?: boolean;
  }): Promise<ReadarrBaseBook[]> {
    const params = new URLSearchParams();
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }

    const endpoint = `/book${params.toString() ? `?${params.toString()}` : ''}`;
    return this.request<ReadarrBaseBook[]>(endpoint);
  }

  async getBook(id: number): Promise<ReadarrBaseBook> {
    return this.request<ReadarrBaseBook>(`/book/${id}`);
  }

  async addBook(book: Partial<ReadarrBaseBook>): Promise<ReadarrBaseBook> {
    return this.request<ReadarrBaseBook>('/book', {
      method: 'POST',
      body: JSON.stringify(book),
    });
  }

  async updateBook(book: Partial<ReadarrBaseBook>): Promise<ReadarrBaseBook> {
    return this.request<ReadarrBaseBook>(`/book/${book.id}`, {
      method: 'PUT',
      body: JSON.stringify(book),
    });
  }

  async deleteBook(id: number, deleteFiles: boolean = false): Promise<void> {
    await this.request<void>(`/book/${id}?deleteFiles=${deleteFiles}`, {
      method: 'DELETE',
    });
  }

  // Author Operations
  async getAuthors(options?: {
    page?: number;
    pageSize?: number;
    sortKey?: string;
    sortDirection?: string;
    name?: string;
    monitored?: boolean;
  }): Promise<ReadarrBaseAuthor[]> {
    const params = new URLSearchParams();
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }

    const endpoint = `/author${params.toString() ? `?${params.toString()}` : ''}`;
    return this.request<ReadarrBaseAuthor[]>(endpoint);
  }

  async getAuthor(id: number): Promise<ReadarrBaseAuthor> {
    return this.request<ReadarrBaseAuthor>(`/author/${id}`);
  }

  async addAuthor(author: Partial<ReadarrBaseAuthor>): Promise<ReadarrBaseAuthor> {
    return this.request<ReadarrBaseAuthor>('/author', {
      method: 'POST',
      body: JSON.stringify(author),
    });
  }

  async updateAuthor(author: Partial<ReadarrBaseAuthor>): Promise<ReadarrBaseAuthor> {
    return this.request<ReadarrBaseAuthor>(`/author/${author.id}`, {
      method: 'PUT',
      body: JSON.stringify(author),
    });
  }

  async deleteAuthor(id: number, deleteFiles: boolean = false): Promise<void> {
    await this.request<void>(`/author/${id}?deleteFiles=${deleteFiles}`, {
      method: 'DELETE',
    });
  }

  // Book File Operations
  async getBookFiles(bookId?: number): Promise<ReadarrBaseBookFile[]> {
    const endpoint = bookId ? `/bookfile?bookId=${bookId}` : '/bookfile';
    return this.request<ReadarrBaseBookFile[]>(endpoint);
  }

  async getBookFile(id: number): Promise<ReadarrBaseBookFile> {
    return this.request<ReadarrBaseBookFile>(`/bookfile/${id}`);
  }

  async deleteBookFile(id: number): Promise<void> {
    await this.request<void>(`/bookfile/${id}`, {
      method: 'DELETE',
    });
  }

  // Queue Operations
  async getQueue(options?: {
    page?: number;
    pageSize?: number;
    sortKey?: string;
    sortDirection?: string;
    includeUnknownAuthorItems?: boolean;
    includeAuthor?: boolean;
    includeBook?: boolean;
  }): Promise<ReadarrBaseQueue> {
    const params = new URLSearchParams();
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }

    const endpoint = `/queue${params.toString() ? `?${params.toString()}` : ''}`;
    return this.request<ReadarrBaseQueue>(endpoint);
  }

  async grabQueueItem(id: number): Promise<void> {
    await this.request<void>(`/queue/grab/${id}`, {
      method: 'POST',
    });
  }

  async removeQueueItem(id: number, blacklist: boolean = false): Promise<void> {
    await this.request<void>(`/queue/${id}?blacklist=${blacklist}`, {
      method: 'DELETE',
    });
  }

  // Command Operations
  async getCommands(): Promise<ReadarrBaseCommand[]> {
    return this.request<ReadarrBaseCommand[]>('/command');
  }

  async getCommand(id: number): Promise<ReadarrBaseCommand> {
    return this.request<ReadarrBaseCommand>(`/command/${id}`);
  }

  async executeCommand(commandName: string, params?: Record<string, any>): Promise<ReadarrBaseCommand> {
    return this.request<ReadarrBaseCommand>('/command', {
      method: 'POST',
      body: JSON.stringify({
        name: commandName,
        ...params,
      }),
    });
  }

  // History Operations
  async getHistory(options?: {
    page?: number;
    pageSize?: number;
    sortKey?: string;
    sortDirection?: string;
    authorId?: number;
    bookId?: number;
    eventType?: string;
  }): Promise<ReadarrBaseHistory> {
    const params = new URLSearchParams();
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }

    const endpoint = `/history${params.toString() ? `?${params.toString()}` : ''}`;
    return this.request<ReadarrBaseHistory>(endpoint);
  }

  // Wanted Operations
  async getWantedMissing(options?: {
    page?: number;
    pageSize?: number;
    sortKey?: string;
    sortDirection?: string;
    authorId?: number;
    monitored?: boolean;
  }): Promise<ReadarrBaseWantedMissing> {
    const params = new URLSearchParams();
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }

    const endpoint = `/wanted/missing${params.toString() ? `?${params.toString()}` : ''}`;
    return this.request<ReadarrBaseWantedMissing>(endpoint);
  }

  // Profile Operations
  async getQualityProfiles(): Promise<ReadarrBaseQualityProfile[]> {
    return this.request<ReadarrBaseQualityProfile[]>('/qualityprofile');
  }

  async getMetadataProfiles(): Promise<ReadarrBaseMetadataProfile[]> {
    return this.request<ReadarrBaseMetadataProfile[]>('/metadataprofile');
  }

  // Root Folder Operations
  async getRootFolders(): Promise<ReadarrBaseRootFolder[]> {
    return this.request<ReadarrBaseRootFolder[]>('/rootfolder');
  }

  // Notification Operations
  async getNotifications(): Promise<ReadarrBaseNotification[]> {
    return this.request<ReadarrBaseNotification[]>('/notification');
  }

  async testNotification(id: number): Promise<ReadarrBaseNotification> {
    return this.request<ReadarrBaseNotification>(`/notification/test/${id}`, {
      method: 'POST',
    });
  }

  // Tag Operations
  async getTags(): Promise<ReadarrBaseTag[]> {
    return this.request<ReadarrBaseTag[]>('/tag');
  }

  async createTag(label: string): Promise<ReadarrBaseTag> {
    return this.request<ReadarrBaseTag>('/tag', {
      method: 'POST',
      body: JSON.stringify({ label }),
    });
  }

  async updateTag(id: number, label: string): Promise<ReadarrBaseTag> {
    return this.request<ReadarrBaseTag>(`/tag/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ label }),
    });
  }

  async deleteTag(id: number): Promise<void> {
    await this.request<void>(`/tag/${id}`, {
      method: 'DELETE',
    });
  }

  // Log Operations
  async getLogs(options?: {
    page?: number;
    pageSize?: number;
    sortKey?: string;
    sortDirection?: string;
  }): Promise<ReadarrBaseLog[]> {
    const params = new URLSearchParams();
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }

    const endpoint = `/log${params.toString() ? `?${params.toString()}` : ''}`;
    return this.request<ReadarrBaseLog[]>(endpoint);
  }

  // Download Client Operations
  async getDownloadClients(): Promise<ReadarrBaseDownloadClient[]> {
    return this.request<ReadarrBaseDownloadClient[]>('/downloadclient');
  }

  async testDownloadClient(id: number): Promise<ReadarrBaseDownloadClient> {
    return this.request<ReadarrBaseDownloadClient>(`/downloadclient/test/${id}`, {
      method: 'POST',
    });
  }

  // Search Operations
  async searchBooks(term: string, options?: {
    page?: number;
    pageSize?: number;
  }): Promise<ReadarrBaseBook[]> {
    const params = new URLSearchParams();
    params.append('term', term);
    
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }

    return this.request<ReadarrBaseBook[]>(`/search?${params.toString()}`);
  }

  async searchAuthors(term: string, options?: {
    page?: number;
    pageSize?: number;
  }): Promise<ReadarrBaseAuthor[]> {
    const params = new URLSearchParams();
    params.append('term', term);
    
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }

    return this.request<ReadarrBaseAuthor[]>(`/author/lookup?${params.toString()}`);
  }

  // Utility Commands
  async refreshAuthor(id: number): Promise<ReadarrBaseCommand> {
    return this.executeCommand('RefreshAuthor', { authorId: id });
  }

  async refreshBook(id: number): Promise<ReadarrBaseCommand> {
    return this.executeCommand('RefreshBook', { bookId: id });
  }

  async authorSearch(id: number): Promise<ReadarrBaseCommand> {
    return this.executeCommand('AuthorSearch', { authorId: id });
  }

  async bookSearch(id: number): Promise<ReadarrBaseCommand> {
    return this.executeCommand('BookSearch', { bookId: id });
  }

  async renameFiles(id: number): Promise<ReadarrBaseCommand> {
    return this.executeCommand('RenameFiles', { bookId: id });
  }

  async rescanBook(id: number): Promise<ReadarrBaseCommand> {
    return this.executeCommand('RescanBook', { bookId: id });
  }

  async missingBookSearch(): Promise<ReadarrBaseCommand> {
    return this.executeCommand('MissingBookSearch');
  }

  async rssSync(): Promise<ReadarrBaseCommand> {
    return this.executeCommand('RssSync');
  }
}