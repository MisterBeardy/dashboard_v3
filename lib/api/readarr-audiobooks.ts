import { ReadarrBaseAPI } from './readarr-base';
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

// Re-export all base types for convenience
export type {
  ReadarrBaseSystemStatus as ReadarrAudiobooksSystemStatus,
  ReadarrBaseSystemHealth as ReadarrAudiobooksSystemHealth,
  ReadarrBaseDiskSpace as ReadarrAudiobooksDiskSpace,
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
};

export class ReadarrAudiobooksAPI extends ReadarrBaseAPI {
  constructor(baseUrl: string, apiKey: string) {
    super(baseUrl, apiKey);
  }

  // Audiobook-specific methods can be added here if needed
  // For now, all functionality is inherited from the base class

  // Override methods if needed for audiobook-specific behavior
  async getBooks(options?: {
    page?: number;
    pageSize?: number;
    sortKey?: string;
    sortDirection?: string;
    authorId?: number;
    title?: string;
    monitored?: boolean;
    // Audiobook-specific filters
    isAudiobook?: boolean;
  }): Promise<ReadarrBaseBook[]> {
    const params = new URLSearchParams();
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }

    // Add audiobook-specific filter
    params.append('isAudiobook', 'true');

    const endpoint = `/book${params.toString() ? `?${params.toString()}` : ''}`;
    return this.request<ReadarrBaseBook[]>(endpoint);
  }

  async searchBooks(term: string, options?: {
    page?: number;
    pageSize?: number;
    // Audiobook-specific search options
    isAudiobook?: boolean;
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

    // Add audiobook-specific filter
    params.append('isAudiobook', 'true');

    return this.request<ReadarrBaseBook[]>(`/search?${params.toString()}`);
  }

  // Audiobook-specific utility methods
  async getAudiobookFormats(bookId: number): Promise<string[]> {
    const book = await this.getBook(bookId);
    const formats = book.editions
      .filter(edition => edition.isAudiobook)
      .map(edition => edition.format);
    
    return [...new Set(formats)]; // Return unique formats
  }

  async hasAudiobookFormat(bookId: number): Promise<boolean> {
    const book = await this.getBook(bookId);
    return book.editions.some(edition => edition.isAudiobook);
  }

  async getAudiobookEditions(bookId: number): Promise<ReadarrBaseBook['editions']> {
    const book = await this.getBook(bookId);
    return book.editions.filter(edition => edition.isAudiobook);
  }

  async getPreferredAudiobookFormat(bookId: number): Promise<string | null> {
    const editions = await this.getAudiobookEditions(bookId);
    if (editions.length === 0) return null;
    
    // Common audiobook formats in order of preference
    const formatPreference = ['MP3', 'M4B', 'FLAC', 'AAC', 'OGG'];
    
    for (const format of formatPreference) {
      if (editions.some(edition => edition.format === format)) {
        return format;
      }
    }
    
    return editions[0].format; // Return first available if no preferred format found
  }

  async downloadAudiobook(bookId: number, format?: string): Promise<void> {
    const book = await this.getBook(bookId);
    const audiobookEditions = book.editions.filter(edition => edition.isAudiobook);
    
    if (audiobookEditions.length === 0) {
      throw new Error(`No audiobook editions found for book ID ${bookId}`);
    }
    
    let targetEdition = audiobookEditions[0];
    
    if (format) {
      const formatEdition = audiobookEditions.find(edition => edition.format === format);
      if (!formatEdition) {
        throw new Error(`Audiobook format ${format} not found for book ID ${bookId}`);
      }
      targetEdition = formatEdition;
    }
    
    // This would typically trigger a download command
    await this.executeCommand('DownloadBook', { 
      bookId, 
      editionId: targetEdition.id 
    });
  }

  // Audiobook-specific commands
  async convertAudiobook(bookId: number, targetFormat: string): Promise<ReadarrBaseCommand> {
    return this.executeCommand('ConvertAudiobook', { 
      bookId, 
      targetFormat 
    });
  }

  async audibleSync(bookId?: number): Promise<ReadarrBaseCommand> {
    return this.executeCommand('AudibleSync', { 
      bookId 
    });
  }

  async metadataRefresh(bookId: number): Promise<ReadarrBaseCommand> {
    return this.executeCommand('AudiobookMetadataRefresh', { 
      bookId 
    });
  }

  async coverDownload(bookId: number): Promise<ReadarrBaseCommand> {
    return this.executeCommand('AudiobookCoverDownload', { 
      bookId 
    });
  }

  async chapterDownload(bookId: number): Promise<ReadarrBaseCommand> {
    return this.executeCommand('AudiobookChapterDownload', { 
      bookId 
    });
  }

  // Statistics specific to audiobooks
  async getAudiobookStatistics(): Promise<{
    totalBooks: number;
    totalAudiobooks: number;
    totalSize: number;
    totalDuration: number;
    formats: Record<string, number>;
    averageBitrate: number;
  }> {
    const books = await this.getBooks();
    const audiobookEditions = books.flatMap(book => 
      book.editions.filter(edition => edition.isAudiobook)
    );
    
    const formats: Record<string, number> = {};
    let totalSize = 0;
    let totalDuration = 0;
    let totalBitrate = 0;
    let bitrateCount = 0;
    
    // Get book files to calculate size and media info
    const bookFiles = await Promise.all(
      books.map(book => this.getBookFiles(book.id))
    );
    const allBookFiles = bookFiles.flat();
    
    audiobookEditions.forEach(edition => {
      const bookFile = allBookFiles.find(file => file.editionId === edition.id);
      
      if (bookFile) {
        totalSize += bookFile.size || 0;
        
        // Extract duration and bitrate from media info if available
        if (bookFile.mediaInfo) {
          const mediaInfo = bookFile.mediaInfo;
          const duration = this.parseDuration(mediaInfo.runTime);
          if (duration) {
            totalDuration += duration;
          }
          
          if (mediaInfo.audioBitrate) {
            totalBitrate += mediaInfo.audioBitrate;
            bitrateCount++;
          }
        }
      }
      
      formats[edition.format] = (formats[edition.format] || 0) + 1;
    });
    
    const averageBitrate = bitrateCount > 0 ? totalBitrate / bitrateCount : 0;
    
    return {
      totalBooks: books.length,
      totalAudiobooks: audiobookEditions.length,
      totalSize,
      totalDuration,
      formats,
      averageBitrate
    };
  }

  // Helper method to parse duration string (e.g., "01:30:45") to seconds
  private parseDuration(durationStr?: string): number {
    if (!durationStr) return 0;
    
    const parts = durationStr.split(':').map(Number);
    if (parts.length === 3) {
      // HH:MM:SS
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      // MM:SS
      return parts[0] * 60 + parts[1];
    }
    
    return 0;
  }

  // Audiobook-specific search methods
  async searchByNarrator(narrator: string, options?: {
    page?: number;
    pageSize?: number;
  }): Promise<ReadarrBaseBook[]> {
    const params = new URLSearchParams();
    params.append('term', narrator);
    
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }

    // This would need to be implemented on the API side
    // For now, we'll use the regular search and filter results
    const books = await this.request<ReadarrBaseBook[]>(`/search?${params.toString()}`);
    return books.filter(book => 
      book.editions.some(edition => edition.isAudiobook)
    );
  }

  async searchByDuration(minDuration?: number, maxDuration?: number, options?: {
    page?: number;
    pageSize?: number;
  }): Promise<ReadarrBaseBook[]> {
    const books = await this.getBooks(options);
    
    // Get book files to check duration
    const bookFiles = await Promise.all(
      books.map(book => this.getBookFiles(book.id))
    );
    
    return books.filter(book => {
      const files = bookFiles.flat().filter(file => 
        book.editions.some(edition => 
          edition.id === file.editionId && edition.isAudiobook
        )
      );
      
      return files.some(file => {
        if (!file.mediaInfo?.runTime) return false;
        
        const duration = this.parseDuration(file.mediaInfo.runTime);
        
        if (minDuration && duration < minDuration) return false;
        if (maxDuration && duration > maxDuration) return false;
        
        return true;
      });
    });
  }

  // Audiobook organization methods
  async createAudiobookPlaylist(bookIds: number[], name: string): Promise<ReadarrBaseCommand> {
    return this.executeCommand('CreateAudiobookPlaylist', { 
      bookIds, 
      name 
    });
  }

  async organizeAudiobooksBySeries(): Promise<ReadarrBaseCommand> {
    return this.executeCommand('OrganizeAudiobooksBySeries');
  }

  async organizeAudiobooksByAuthor(): Promise<ReadarrBaseCommand> {
    return this.executeCommand('OrganizeAudiobooksByAuthor');
  }
}