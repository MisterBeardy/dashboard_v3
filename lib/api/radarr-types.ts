export interface RadarrSystemStatus {
  version: string;
  buildTime: string;
  isDebug: boolean;
  isProduction: boolean;
  isAdmin: boolean;
  isUserInteractive: boolean;
  startupPath: string;
  appData: string;
  osName: string;
  osVersion: string;
  isNetCore: boolean;
  isMono: boolean;
  isLinux: boolean;
  isOsx: boolean;
  isWindows: boolean;
  branch: string;
  authentication: string;
  sqliteVersion: string;
  urlBase: string;
  runtimeVersion: string;
  startTime?: string;
  architecture?: string;
}

export interface RadarrSystemHealth {
  type: string;
  message: string;
  source: string;
}

export interface RadarrDiskSpace {
  path: string;
  label: string;
  freeSpace: number;
  totalSpace: number;
  type: string;
}

export interface RadarrSystemTask {
  id: number;
  name: string;
  interval: number;
  lastRun: string;
  lastStart: string;
  lastDuration: string;
  nextRun: string;
  isRunning: boolean;
  queued: boolean;
  startedOn: string;
  state: string;
}

export interface RadarrUpdateInfo {
  version: string;
  branch: string;
  updateAvailable: boolean;
  updateVersion: string;
  updatePackage: string;
  updateUrl: string;
  updateReleaseNotes: string;
  latestVersion?: string;
  changes?: any[];
}

export interface RadarrMovie {
  id: number;
  title: string;
  titleSlug: string;
  sortTitle: string;
  sizeOnDisk: number;
  status: string;
  overview: string;
  inCinemas?: string;
  physicalRelease?: string;
  digitalRelease?: string;
  images: RadarrImage[];
  website: string;
  youTubeTrailerId?: string;
  studio: string;
  runtime: number;
  certification: string;
  ratings: RadarrRating;
  genres: string[];
  tags: number[];
  added: string;
  monitored: boolean;
  hasFile: boolean;
  isAvailable: boolean;
  folderName: string;
  path: string;
  qualityProfileId: number;
  movieFile?: RadarrMovieFile;
  tmdbId: number;
  imdbId: string;
  year: number;
  statistics: RadarrStatistics;
}

export interface RadarrImage {
  coverType: string;
  url: string;
  remoteUrl: string;
}

export interface RadarrRating {
  votes: number;
  value: number;
}

export interface RadarrStatistics {
  movieFileCount: number;
  sizeOnDisk: number;
  releaseGroups: string[];
  percentOfEpisodes: number;
}

export interface RadarrMovieFile {
  id: number;
  movieId: number;
  relativePath: string;
  path: string;
  size: number;
  dateAdded: string;
  releaseGroup: string;
  quality: RadarrQuality;
  mediaInfo: RadarrMediaInfo;
  originalFilePath: string;
  qualityCutoffNotMet: boolean;
}

export interface RadarrQuality {
  quality: {
    id: number;
    name: string;
    source: string;
    resolution: number;
  };
  revision: {
    version: number;
    real: number;
    isRepack: boolean;
  };
}

export interface RadarrMediaInfo {
  audioChannels: number;
  audioCodec: string;
  videoCodec: string;
  width: number;
  height: number;
  videoBitrate: number;
  audioBitrate: number;
  runTime: string;
  scanType: string;
}

export interface RadarrQueue {
  page: number;
  pageSize: number;
  sortKey: string;
  sortDirection: string;
  totalRecords: number;
  records: RadarrQueueRecord[];
}

export interface RadarrQueueRecord {
  id: number;
  movieId: number;
  movie: RadarrMovie;
  quality: RadarrQuality;
  size: number;
  title: string;
  sizeleft: number;
  timeleft: string;
  estimatedCompletionTime: string;
  status: string;
  trackedDownloadStatus: string;
  trackedDownloadState: string;
  statusMessages: RadarrStatusMessage[];
  downloadId: string;
  protocol: string;
  downloadClient: string;
  indexer: string;
  outputPath: string;
}

export interface RadarrStatusMessage {
  title: string;
  messages: string[];
}

export interface RadarrHistory {
  page: number;
  pageSize: number;
  sortKey: string;
  sortDirection: string;
  totalRecords: number;
  records: RadarrHistoryRecord[];
}

export interface RadarrHistoryRecord {
  id: number;
  movieId: number;
  sourceTitle: string;
  quality: RadarrQuality;
  date: string;
  eventType: string;
  data: Record<string, any>;
  movie: RadarrMovie;
  downloadId?: string;
}

export interface RadarrCommand {
  id: number;
  name: string;
  commandName: string;
  message: string;
  body: Record<string, any>;
  priority: number;
  status: string;
  result: string;
  startedOn: string;
  endedOn?: string;
  trigger: string;
  stateChangeTime: string;
  sendUpdatesToClient: boolean;
  lastUpdateTime: string;
}

export interface RadarrQualityProfile {
  id: number;
  name: string;
  upgradeAllowed: boolean;
  cutoff: number;
  items: RadarrQualityProfileItem[];
  language: RadarrLanguage;
}

export interface RadarrQualityProfileItem {
  quality: RadarrQualityItem;
  items: RadarrQualityProfileItem[];
  allowed: boolean;
  name?: string;
}

export interface RadarrQualityItem {
  id: number;
  name: string;
  source: string;
  resolution: number;
}

export interface RadarrLanguage {
  id: number;
  name: string;
}

export interface RadarrWantedMissing {
  page: number;
  pageSize: number;
  sortKey: string;
  sortDirection: string;
  totalRecords: number;
  records: RadarrMovie[];
}