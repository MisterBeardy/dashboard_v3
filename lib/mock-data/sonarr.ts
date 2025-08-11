/**
 * Mock data generators for Sonarr
 */

import { BaseMockDataGenerator, mockUtils } from './index';

// Sonarr Series interface
export interface SonarrSeries {
  id: number;
  title: string;
  sortTitle: string;
  status: string;
  overview: string;
  network: string;
  airTime: string;
  images: Array<{
    coverType: string;
    url: string;
  }>;
  seasons: Array<{
    seasonNumber: number;
    monitored: boolean;
    statistics: {
      previousAiring?: string;
      episodeFileCount: number;
      episodeCount: number;
      totalEpisodeCount: number;
      sizeOnDisk: number;
      percentOfEpisodes: number;
    };
  }>;
  year: number;
  path: string;
  profileId: number;
  languageProfileId: number;
  seasonFolder: boolean;
  monitored: boolean;
  useSceneNumbering: boolean;
  runtime: number;
  tvdbId: number;
  tvRageId: number;
  tvMazeId: number;
  firstAired: string;
  seriesType: string;
  cleanTitle: string;
  imdbId: string;
  titleSlug: string;
  genres: string[];
  tags: number[];
  added: string;
  ratings: {
    votes: number;
    value: number;
  };
  qualityProfileId: number;
  rootFolderPath: string;
  addOptions: {
    ignoreEpisodesWithFiles: boolean;
    ignoreEpisodesWithoutFiles: boolean;
    searchForMissingEpisodes: boolean;
  };
}

// Sonarr Episode interface
export interface SonarrEpisode {
  id: number;
  seriesId: number;
  tvdbId: number;
  episodeFileId: number;
  seasonNumber: number;
  episodeNumber: number;
  title: string;
  airDate: string;
  airDateUtc: string;
  overview: string;
  hasFile: boolean;
  monitored: boolean;
  absoluteEpisodeNumber: number;
  unverifiedSceneNumbering: boolean;
  finaleType: string;
  runtime: number;
  images: Array<{
    coverType: string;
    url: string;
  }>;
  series: {
    title: string;
  };
}

// Sonarr Queue interface
export interface SonarrQueue {
  id: string;
  seriesId: number;
  episodeId: number;
  series: {
    title: string;
  };
  episode: {
    title: string;
    seasonNumber: number;
    episodeNumber: number;
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

// Sonarr History interface
export interface SonarrHistory {
  id: number;
  seriesId: number;
  episodeId: number;
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
  series: {
    title: string;
  };
  episode: {
    title: string;
    seasonNumber: number;
    episodeNumber: number;
  };
}

export class SonarrSeriesMockGenerator extends BaseMockDataGenerator<SonarrSeries> {
  generate(): SonarrSeries {
    const titles = [
      'Breaking Bad', 'Game of Thrones', 'The Sopranos', 'The Wire', 'Mad Men',
      'The Office', 'Parks and Recreation', 'Community', 'Stranger Things', 'The Crown'
    ];
    
    const networks = ['HBO', 'Netflix', 'AMC', 'Showtime', 'FX', 'NBC', 'ABC', 'CBS'];
    const genres = ['Drama', 'Comedy', 'Action', 'Adventure', 'Horror', 'Sci-Fi', 'Thriller'];
    
    const seasonCount = mockUtils.randomInt(1, 10);
    const seasons = Array.from({ length: seasonCount }, (_, i) => ({
      seasonNumber: i,
      monitored: mockUtils.randomBool(),
      statistics: {
        previousAiring: mockUtils.randomBool() ? mockUtils.date(mockUtils.randomInt(0, 30)) : undefined,
        episodeFileCount: mockUtils.randomInt(0, 24),
        episodeCount: mockUtils.randomInt(1, 24),
        totalEpisodeCount: mockUtils.randomInt(1, 24),
        sizeOnDisk: mockUtils.randomInt(100000000, 10000000000),
        percentOfEpisodes: mockUtils.randomInt(0, 100)
      }
    }));
    
    return {
      id: mockUtils.id(),
      title: mockUtils.randomChoice(titles),
      sortTitle: mockUtils.randomChoice(titles).toLowerCase(),
      status: mockUtils.randomChoice(['continuing', 'ended', 'upcoming']),
      overview: `This is a great TV show about ${mockUtils.randomString(20)}.`,
      network: mockUtils.randomChoice(networks),
      airTime: `${mockUtils.randomInt(1, 12)}:${mockUtils.randomInt(0, 59).toString().padStart(2, '0')} ${mockUtils.randomChoice(['AM', 'PM'])}`,
      images: [
        {
          coverType: 'poster',
          url: `https://image.tmdb.org/t/p/w500/${mockUtils.randomString(32)}.jpg`
        },
        {
          coverType: 'fanart',
          url: `https://image.tmdb.org/t/p/w1280/${mockUtils.randomString(32)}.jpg`
        }
      ],
      seasons: seasons,
      year: mockUtils.randomInt(1990, 2023),
      path: `/tv/${mockUtils.randomString(10)}`,
      profileId: mockUtils.randomInt(1, 5),
      languageProfileId: mockUtils.randomInt(1, 5),
      seasonFolder: true,
      monitored: mockUtils.randomBool(),
      useSceneNumbering: false,
      runtime: mockUtils.randomInt(20, 60),
      tvdbId: mockUtils.randomInt(1000, 999999),
      tvRageId: mockUtils.randomInt(1000, 999999),
      tvMazeId: mockUtils.randomInt(1000, 999999),
      firstAired: mockUtils.date(mockUtils.randomInt(365, 3650)),
      seriesType: mockUtils.randomChoice(['standard', 'daily', 'anime']),
      cleanTitle: mockUtils.randomChoice(titles).toLowerCase().replace(/\s+/g, ''),
      imdbId: `tt${mockUtils.randomInt(1000000, 9999999)}`,
      titleSlug: mockUtils.randomString(20),
      genres: Array.from({ length: mockUtils.randomInt(1, 3) }, () => mockUtils.randomChoice(genres)),
      tags: Array.from({ length: mockUtils.randomInt(0, 3) }, () => mockUtils.id()),
      added: mockUtils.date(mockUtils.randomInt(0, 365)),
      ratings: {
        votes: mockUtils.randomInt(1000, 1000000),
        value: mockUtils.randomFloat(5.0, 9.5)
      },
      qualityProfileId: mockUtils.randomInt(1, 5),
      rootFolderPath: `/tv/${mockUtils.randomString(10)}`,
      addOptions: {
        ignoreEpisodesWithFiles: false,
        ignoreEpisodesWithoutFiles: false,
        searchForMissingEpisodes: true
      }
    };
  }
}

export class SonarrEpisodeMockGenerator extends BaseMockDataGenerator<SonarrEpisode> {
  generate(): SonarrEpisode {
    const titles = [
      'Pilot', 'The One With', 'Episode 1', 'First Episode', 'Season Premiere',
      'Mid-Season Finale', 'Season Finale', 'Series Finale', 'Special Episode', 'Recap'
    ];
    
    return {
      id: mockUtils.id(),
      seriesId: mockUtils.id(),
      tvdbId: mockUtils.randomInt(1000000, 9999999),
      episodeFileId: mockUtils.randomBool() ? mockUtils.id() : 0,
      seasonNumber: mockUtils.randomInt(1, 10),
      episodeNumber: mockUtils.randomInt(1, 24),
      title: mockUtils.randomChoice(titles),
      airDate: mockUtils.date(mockUtils.randomInt(0, 30)),
      airDateUtc: mockUtils.date(mockUtils.randomInt(0, 30)),
      overview: `This is a great episode about ${mockUtils.randomString(20)}.`,
      hasFile: mockUtils.randomBool(),
      monitored: mockUtils.randomBool(),
      absoluteEpisodeNumber: mockUtils.randomInt(1, 240),
      unverifiedSceneNumbering: false,
      finaleType: mockUtils.randomChoice(['none', 'season', 'series']),
      runtime: mockUtils.randomInt(20, 60),
      images: [
        {
          coverType: 'thumbnail',
          url: `https://image.tmdb.org/t/p/w300/${mockUtils.randomString(32)}.jpg`
        }
      ],
      series: {
        title: mockUtils.randomChoice(['Breaking Bad', 'Game of Thrones', 'The Sopranos'])
      }
    };
  }
}

export class SonarrQueueMockGenerator extends BaseMockDataGenerator<SonarrQueue> {
  generate(): SonarrQueue {
    const protocols: ('torrent' | 'usenet')[] = ['torrent', 'usenet'];
    const statuses = ['queued', 'pending', 'downloading', 'completed', 'failed', 'paused'];
    
    return {
      id: mockUtils.randomString(32),
      seriesId: mockUtils.id(),
      episodeId: mockUtils.id(),
      series: {
        title: mockUtils.randomChoice(['Breaking Bad', 'Game of Thrones', 'The Sopranos'])
      },
      episode: {
        title: mockUtils.randomChoice(['Pilot', 'The One With', 'Episode 1']),
        seasonNumber: mockUtils.randomInt(1, 10),
        episodeNumber: mockUtils.randomInt(1, 24)
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
      size: mockUtils.randomInt(100000000, 2000000000), // 100MB to 2GB
      title: `${mockUtils.randomChoice(['Breaking.Bad', 'Game.of.Thrones', 'The.Sopranos'])}.S${mockUtils.randomInt(1, 10).toString().padStart(2, '0')}E${mockUtils.randomInt(1, 24).toString().padStart(2, '0')}.${mockUtils.randomQuality()}.${mockUtils.randomChoice(['HDTV', 'WEB-DL', 'BluRay'])}-${mockUtils.randomChoice(['RARBG', 'YIFY', 'SPARKS'])}`,
      sizeleft: mockUtils.randomInt(0, 2000000000),
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

export class SonarrHistoryMockGenerator extends BaseMockDataGenerator<SonarrHistory> {
  generate(): SonarrHistory {
    const eventTypes = ['grabbed', 'downloaded', 'imported', 'failed'];
    
    return {
      id: mockUtils.id(),
      seriesId: mockUtils.id(),
      episodeId: mockUtils.id(),
      sourceTitle: `${mockUtils.randomChoice(['Breaking.Bad', 'Game.of.Thrones', 'The.Sopranos'])}.S${mockUtils.randomInt(1, 10).toString().padStart(2, '0')}E${mockUtils.randomInt(1, 24).toString().padStart(2, '0')}.${mockUtils.randomQuality()}.${mockUtils.randomChoice(['HDTV', 'WEB-DL', 'BluRay'])}-${mockUtils.randomChoice(['RARBG', 'YIFY', 'SPARKS'])}`,
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
        size: mockUtils.randomInt(100000000, 2000000000),
        guid: mockUtils.randomString(32),
        tvdbId: mockUtils.randomInt(1000, 999999),
        tvRageId: mockUtils.randomInt(1000, 999999),
        imdbId: `tt${mockUtils.randomInt(1000000, 9999999)}`,
        customFormatScore: mockUtils.randomInt(0, 100),
        languages: []
      },
      series: {
        title: mockUtils.randomChoice(['Breaking Bad', 'Game of Thrones', 'The Sopranos'])
      },
      episode: {
        title: mockUtils.randomChoice(['Pilot', 'The One With', 'Episode 1']),
        seasonNumber: mockUtils.randomInt(1, 10),
        episodeNumber: mockUtils.randomInt(1, 24)
      }
    };
  }
}

// Export instances for easy use
export const sonarrMock = {
  series: new SonarrSeriesMockGenerator(),
  episode: new SonarrEpisodeMockGenerator(),
  queue: new SonarrQueueMockGenerator(),
  history: new SonarrHistoryMockGenerator()
};