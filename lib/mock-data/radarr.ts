/**
 * Mock data generators for Radarr
 */

import { BaseMockDataGenerator, mockUtils } from './index';

// Radarr Movie interface
export interface RadarrMovie {
  id: number;
  title: string;
  sortTitle: string;
  sizeOnDisk: number;
  status: string;
  overview: string;
  inCinemas: string;
  physicalRelease: string;
  digitalRelease: string;
  year: number;
  path: string;
  profileId: number;
  movieFileId: number;
  hasFile: boolean;
  monitored: boolean;
  minimumAvailability: string;
  isAvailable: boolean;
  folderName: string;
  runtime: number;
  cleanTitle: string;
  imdbId: string;
  tmdbId: number;
  titleSlug: string;
  genres: string[];
  tags: number[];
  added: string;
  ratings: {
    votes: number;
    value: number;
  };
  images: Array<{
    coverType: string;
    url: string;
  }>;
}

// Radarr Quality Profile interface
export interface RadarrQualityProfile {
  id: number;
  name: string;
  upgradeAllowed: boolean;
  cutoff: number;
  items: Array<{
    id: number;
    name: string;
    allowed: boolean;
  }>;
}

// Radarr Root Folder interface
export interface RadarrRootFolder {
  id: number;
  path: string;
  freeSpace: number;
  totalSpace: number;
  unmappedFolders: any[];
}

// Radarr Queue interface
export interface RadarrQueue {
  id: string;
  movieId: number;
  movie: {
    title: string;
    year: number;
  };
  quality: {
    quality: {
      id: number;
      name: string;
    };
    revision: {
      version: number;
      real: number;
    };
  };
  size: number;
  title: string;
  sizeleft: number;
  timeleft: string;
  estimatedCompletionTime: string;
  status: string;
  trackedDownloadStatus: string;
  trackedDownloadState: string;
  protocol: 'torrent' | 'usenet';
  downloadClient: string;
  indexer: string;
  outputPath: string;
}

// Radarr History interface
export interface RadarrHistory {
  id: number;
  movieId: number;
  sourceTitle: string;
  quality: {
    quality: {
      id: number;
      name: string;
    };
    revision: {
      version: number;
      real: number;
    };
  };
  qualityCutoffNotMet: boolean;
  date: string;
  downloadId: string;
  eventType: string;
  data: {
    downloadClient: string;
    downloadClientName: string;
    indexer: string;
    indexerFlags: string;
    nzbInfoUrl: string;
    downloadUrl: string;
    releaseGroup: string;
    age: number;
    ageHours: number;
    ageMinutes: number;
    publishedDate: string;
    size: number;
    guid: string;
    tvdbId: number;
    tvRageId: number;
    imdbId: string;
    customFormatScore: number;
    languages: any[];
  };
  movie: {
    title: string;
    year: number;
  };
}

export class RadarrMovieMockGenerator extends BaseMockDataGenerator<RadarrMovie> {
  generate(): RadarrMovie {
    const titles = [
      'The Matrix', 'Inception', 'Interstellar', 'The Dark Knight', 'Pulp Fiction',
      'Forrest Gump', 'The Shawshank Redemption', 'The Godfather', 'Fight Club', 'Goodfellas'
    ];
    
    const genres = ['Action', 'Adventure', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Thriller'];
    
    return {
      id: mockUtils.id(),
      title: mockUtils.randomChoice(titles),
      sortTitle: mockUtils.randomChoice(titles).toLowerCase(),
      sizeOnDisk: mockUtils.randomInt(1000000000, 10000000000), // 1GB to 10GB
      status: mockUtils.randomChoice(['released', 'announced', 'inCinemas']),
      overview: `This is a great movie about ${mockUtils.randomString(20)}.`,
      inCinemas: mockUtils.date(mockUtils.randomInt(30, 365)),
      physicalRelease: mockUtils.date(mockUtils.randomInt(0, 30)),
      digitalRelease: mockUtils.date(mockUtils.randomInt(0, 30)),
      year: mockUtils.randomInt(1990, 2023),
      path: `/movies/${mockUtils.randomString(10)}`,
      profileId: mockUtils.randomInt(1, 5),
      movieFileId: mockUtils.randomBool() ? mockUtils.id() : 0,
      hasFile: mockUtils.randomBool(),
      monitored: mockUtils.randomBool(),
      minimumAvailability: mockUtils.randomChoice(['released', 'preDB', 'announced']),
      isAvailable: mockUtils.randomBool(),
      folderName: mockUtils.randomString(10).replace(/\s+/g, '.'),
      runtime: mockUtils.randomInt(80, 180),
      cleanTitle: mockUtils.randomChoice(titles).toLowerCase().replace(/\s+/g, ''),
      imdbId: `tt${mockUtils.randomInt(1000000, 9999999)}`,
      tmdbId: mockUtils.randomInt(1000, 999999),
      titleSlug: mockUtils.randomString(20),
      genres: Array.from({ length: mockUtils.randomInt(1, 3) }, () => mockUtils.randomChoice(genres)),
      tags: Array.from({ length: mockUtils.randomInt(0, 3) }, () => mockUtils.id()),
      added: mockUtils.date(mockUtils.randomInt(0, 365)),
      ratings: {
        votes: mockUtils.randomInt(1000, 1000000),
        value: mockUtils.randomFloat(5.0, 9.5)
      },
      images: [
        {
          coverType: 'poster',
          url: `https://image.tmdb.org/t/p/w500/${mockUtils.randomString(32)}.jpg`
        },
        {
          coverType: 'fanart',
          url: `https://image.tmdb.org/t/p/w1280/${mockUtils.randomString(32)}.jpg`
        }
      ]
    };
  }
}

export class RadarrQualityProfileMockGenerator extends BaseMockDataGenerator<RadarrQualityProfile> {
  generate(): RadarrQualityProfile {
    const qualities = [
      { id: 1, name: 'SD' },
      { id: 2, name: 'HD-720p' },
      { id: 3, name: 'HD-1080p' },
      { id: 4, name: 'UHD-2160p' },
      { id: 5, name: 'Remux' }
    ];
    
    return {
      id: mockUtils.id(),
      name: `${mockUtils.randomChoice(['Movie', 'Film', 'Cinema'])} ${mockUtils.randomChoice(['HD', 'UHD', 'Quality'])}`,
      upgradeAllowed: mockUtils.randomBool(),
      cutoff: mockUtils.randomInt(1, 5),
      items: qualities.map(q => ({
        id: q.id,
        name: q.name,
        allowed: mockUtils.randomBool()
      }))
    };
  }
}

export class RadarrRootFolderMockGenerator extends BaseMockDataGenerator<RadarrRootFolder> {
  generate(): RadarrRootFolder {
    const totalSpace = mockUtils.randomInt(1000000000000, 10000000000000); // 1TB to 10TB
    const usedSpace = totalSpace * mockUtils.randomFloat(0.1, 0.9);
    
    return {
      id: mockUtils.id(),
      path: `/data/${mockUtils.randomChoice(['movies', 'films', 'cinema'])}`,
      freeSpace: totalSpace - usedSpace,
      totalSpace: totalSpace,
      unmappedFolders: []
    };
  }
}

export class RadarrQueueMockGenerator extends BaseMockDataGenerator<RadarrQueue> {
  generate(): RadarrQueue {
    const protocols: ('torrent' | 'usenet')[] = ['torrent', 'usenet'];
    const statuses = ['queued', 'pending', 'downloading', 'completed', 'failed', 'paused'];
    
    return {
      id: mockUtils.randomString(32),
      movieId: mockUtils.id(),
      movie: {
        title: mockUtils.randomChoice(['The Matrix', 'Inception', 'Interstellar']),
        year: mockUtils.randomInt(1990, 2023)
      },
      quality: {
        quality: {
          id: mockUtils.randomInt(1, 5),
          name: mockUtils.randomQuality()
        },
        revision: {
          version: 1,
          real: 1
        }
      },
      size: mockUtils.randomInt(1000000000, 10000000000), // 1GB to 10GB
      title: `${mockUtils.randomChoice(['The.Matrix', 'Inception', 'Interstellar'])}.${mockUtils.randomQuality()}.${mockUtils.randomChoice(['BluRay', 'WEB-DL', 'HDRip'])}-${mockUtils.randomChoice(['RARBG', 'YIFY', 'SPARKS'])}`,
      sizeleft: mockUtils.randomInt(0, 10000000000),
      timeleft: mockUtils.randomBool() ? `${mockUtils.randomInt(1, 60)}m` : '',
      estimatedCompletionTime: mockUtils.randomBool() ? mockUtils.date(mockUtils.randomInt(0, 1)) : '',
      status: mockUtils.randomChoice(statuses),
      trackedDownloadStatus: mockUtils.randomChoice(['ok', 'warning', 'error']),
      trackedDownloadState: mockUtils.randomChoice(['downloading', 'importing', 'failed']),
      protocol: mockUtils.randomChoice(protocols),
      downloadClient: mockUtils.randomDownloadClient(),
      indexer: mockUtils.randomIndexer(),
      outputPath: `/downloads/${mockUtils.randomString(20)}`
    };
  }
}

export class RadarrHistoryMockGenerator extends BaseMockDataGenerator<RadarrHistory> {
  generate(): RadarrHistory {
    const eventTypes = ['grabbed', 'downloaded', 'imported', 'failed'];
    
    return {
      id: mockUtils.id(),
      movieId: mockUtils.id(),
      sourceTitle: `${mockUtils.randomChoice(['The.Matrix', 'Inception', 'Interstellar'])}.${mockUtils.randomQuality()}.${mockUtils.randomChoice(['BluRay', 'WEB-DL', 'HDRip'])}-${mockUtils.randomChoice(['RARBG', 'YIFY', 'SPARKS'])}`,
      quality: {
        quality: {
          id: mockUtils.randomInt(1, 5),
          name: mockUtils.randomQuality()
        },
        revision: {
          version: 1,
          real: 1
        }
      },
      qualityCutoffNotMet: mockUtils.randomBool(),
      date: mockUtils.date(mockUtils.randomInt(0, 30)),
      downloadId: mockUtils.randomString(32),
      eventType: mockUtils.randomChoice(eventTypes),
      data: {
        downloadClient: mockUtils.randomDownloadClient(),
        downloadClientName: mockUtils.randomDownloadClient(),
        indexer: mockUtils.randomIndexer(),
        indexerFlags: '',
        nzbInfoUrl: '',
        downloadUrl: '',
        releaseGroup: mockUtils.randomChoice(['RARBG', 'YIFY', 'SPARKS']),
        age: mockUtils.randomInt(1, 1000),
        ageHours: mockUtils.randomInt(1, 24),
        ageMinutes: mockUtils.randomInt(1, 60),
        publishedDate: mockUtils.date(mockUtils.randomInt(0, 30)),
        size: mockUtils.randomInt(1000000000, 10000000000),
        guid: mockUtils.randomString(32),
        tvdbId: 0,
        tvRageId: 0,
        imdbId: `tt${mockUtils.randomInt(1000000, 9999999)}`,
        customFormatScore: mockUtils.randomInt(0, 100),
        languages: []
      },
      movie: {
        title: mockUtils.randomChoice(['The Matrix', 'Inception', 'Interstellar']),
        year: mockUtils.randomInt(1990, 2023)
      }
    };
  }
}

// Export instances for easy use
export const radarrMock = {
  movie: new RadarrMovieMockGenerator(),
  qualityProfile: new RadarrQualityProfileMockGenerator(),
  rootFolder: new RadarrRootFolderMockGenerator(),
  queue: new RadarrQueueMockGenerator(),
  history: new RadarrHistoryMockGenerator()
};