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
  ReadarrBaseSystemStatus as ReadarrSystemStatus,
  ReadarrBaseSystemHealth as ReadarrSystemHealth,
  ReadarrBaseDiskSpace as ReadarrDiskSpace,
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
};

export class ReadarrAPI extends ReadarrBaseAPI {
  constructor(baseUrl: string, apiKey: string) {
    super(baseUrl, apiKey);
  }

  // Ebook-specific methods can be added here if needed
  // For now, all functionality is inherited from the base class

  // Override methods if needed for ebook-specific behavior
  async getBooks(options?: {
    page?: number;
    pageSize?: number;
    sortKey?: string;
    sortDirection?: string;
    authorId?: number;
    title?: string;
    monitored?: boolean;
    // Ebook-specific filters
    isEbook?: boolean;
  }): Promise<ReadarrBaseBook[]> {
    const params = new URLSearchParams();
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }

    // Add ebook-specific filter
    params.append('isEbook', 'true');

    const endpoint = `/book${params.toString() ? `?${params.toString()}` : ''}`;
    return this.request<ReadarrBaseBook[]>(endpoint);
  }

  async searchBooks(term: string, options?: {
    page?: number;
    pageSize?: number;
    // Ebook-specific search options
    isEbook?: boolean;
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

    // Add ebook-specific filter
    params.append('isEbook', 'true');

    return this.request<ReadarrBaseBook[]>(`/search?${params.toString()}`);
  }

  // Ebook-specific utility methods
  async getEbookFormats(bookId: number): Promise<string[]> {
    const book = await this.getBook(bookId);
    const formats = book.editions
      .filter(edition => edition.isEbook)
      .map(edition => edition.format);
    
    return [...new Set(formats)]; // Return unique formats
  }

  async hasEbookFormat(bookId: number): Promise<boolean> {
    const book = await this.getBook(bookId);
    return book.editions.some(edition => edition.isEbook);
  }

  async getEbookEditions(bookId: number): Promise<ReadarrBaseBook['editions']> {
    const book = await this.getBook(bookId);
    return book.editions.filter(edition => edition.isEbook);
  }

  async getPreferredEbookFormat(bookId: number): Promise<string | null> {
    const editions = await this.getEbookEditions(bookId);
    if (editions.length === 0) return null;
    
    // Common ebook formats in order of preference
    const formatPreference = ['EPUB', 'MOBI', 'PDF', 'AZW3', 'TXT'];
    
    for (const format of formatPreference) {
      if (editions.some(edition => edition.format === format)) {
        return format;
      }
    }
    
    return editions[0].format; // Return first available if no preferred format found
  }

  async downloadEbook(bookId: number, format?: string): Promise<void> {
    const book = await this.getBook(bookId);
    const ebookEditions = book.editions.filter(edition => edition.isEbook);
    
    if (ebookEditions.length === 0) {
      throw new Error(`No ebook editions found for book ID ${bookId}`);
    }
    
    let targetEdition = ebookEditions[0];
    
    if (format) {
      const formatEdition = ebookEditions.find(edition => edition.format === format);
      if (!formatEdition) {
        throw new Error(`Ebook format ${format} not found for book ID ${bookId}`);
      }
      targetEdition = formatEdition;
    }
    
    // This would typically trigger a download command
    await this.executeCommand('DownloadBook', {
      bookId,
      editionId: targetEdition.id
    });
  }

  // Ebook-specific commands
  async convertEbook(bookId: number, targetFormat: string): Promise<ReadarrBaseCommand> {
    return this.executeCommand('ConvertEbook', { 
      bookId, 
      targetFormat 
    });
  }

  async calibreSync(bookId?: number): Promise<ReadarrBaseCommand> {
    return this.executeCommand('CalibreSync', { 
      bookId 
    });
  }

  async metadataRefresh(bookId: number): Promise<ReadarrBaseCommand> {
    return this.executeCommand('EbookMetadataRefresh', { 
      bookId 
    });
  }

  async coverDownload(bookId: number): Promise<ReadarrBaseCommand> {
    return this.executeCommand('EbookCoverDownload', { 
      bookId 
    });
  }

  // Statistics specific to ebooks
  async getEbookStatistics(): Promise<{
    totalBooks: number;
    totalEbooks: number;
    totalSize: number;
    formats: Record<string, number>;
  }> {
    const books = await this.getBooks();
    const ebookEditions = books.flatMap(book => 
      book.editions.filter(edition => edition.isEbook)
    );
    
    const formats: Record<string, number> = {};
    let totalSize = 0;
    
    // Get book files to calculate size
    const bookFiles = await Promise.all(
      books.map(book => this.getBookFiles(book.id))
    );
    const allBookFiles = bookFiles.flat();
    
    ebookEditions.forEach(edition => {
      const bookFile = allBookFiles.find(file => file.editionId === edition.id);
      
      if (bookFile) {
        totalSize += bookFile.size || 0;
      }
      
      formats[edition.format] = (formats[edition.format] || 0) + 1;
    });
    
    return {
      totalBooks: books.length,
      totalEbooks: ebookEditions.length,
      totalSize,
      formats
    };
  }
}