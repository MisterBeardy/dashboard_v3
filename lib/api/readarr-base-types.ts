export interface ReadarrBaseSystemStatus {
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

export interface ReadarrBaseSystemHealth {
  type: string;
  message: string;
  source: string;
}

export interface ReadarrBaseDiskSpace {
  path: string;
  label: string;
  freeSpace: number;
  totalSpace: number;
  type: string;
}

export interface ReadarrBaseSystemTask {
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

export interface ReadarrBaseUpdateInfo {
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

export interface ReadarrBaseBook {
  id: number;
  title: string;
  titleSlug: string;
  foreignBookId: string;
  releaseDate: string;
  pageCount: number;
  anyEditionOk: boolean;
  monitored: boolean;
  statistics: ReadarrBaseBookStatistics;
  author: ReadarrBaseAuthor;
  authorTitle: string;
  disambiguation: string;
  overview: string;
  links: ReadarrBaseLink[];
  genres: string[];
  ratings: ReadarrBaseRating;
  images: ReadarrBaseImage[];
  cleanTitle: string;
  sortTitle: string;
  added: string;
  path: string;
  rootFolderPath: string;
  qualityProfileId: number;
  metadataProfileId: number;
  tags: number[];
  addedBy: number;
  editions: ReadarrBaseBookEdition[];
  authorMetadata: ReadarrBaseAuthorMetadata;
}

export interface ReadarrBaseBookStatistics {
  bookCount: number;
  bookFileCount: number;
  totalBookCount: number;
  sizeOnDisk: number;
  percentOfBooks: number;
}

export interface ReadarrBaseAuthor {
  id: number;
  authorName: string;
  authorNameSlug: string;
  foreignAuthorId: string;
  disambiguation: string;
  overview: string;
  links: ReadarrBaseLink[];
  images: ReadarrBaseImage[];
  genres: string[];
  ratings: ReadarrBaseRating;
  path: string;
  rootFolderPath: string;
  metadataProfileId: number;
  qualityProfileId: number;
  monitored: boolean;
  added: string;
  addOptions: ReadarrBaseAddOptions;
  statistics: ReadarrBaseAuthorStatistics;
  tags: number[];
  cleanName: string;
  sortName: string;
}

export interface ReadarrBaseAuthorStatistics {
  bookCount: number;
  bookFileCount: number;
  totalBookCount: number;
  sizeOnDisk: number;
  percentOfBooks: number;
}

export interface ReadarrBaseAddOptions {
  monitor: string;
  searchForNewBook: boolean;
}

export interface ReadarrBaseLink {
  url: string;
  name: string;
}

export interface ReadarrBaseRating {
  votes: number;
  value: number;
}

export interface ReadarrBaseImage {
  coverType: string;
  url: string;
  remoteUrl: string;
}

export interface ReadarrBaseBookEdition {
  id: number;
  bookId: number;
  foreignEditionId: string;
  titleSlug: string;
  isbn13: string;
  isbn: string;
  asin: string;
  title: string;
  language: string;
  overview: string;
  format: string;
  isEbook: boolean;
  isAudiobook: boolean;
  disambiguation: string;
  publisher: string;
  pageCount: number;
  releaseDate: string;
  images: ReadarrBaseImage[];
  links: ReadarrBaseLink[];
  ratings: ReadarrBaseRating;
  monitored: boolean;
  manualAdd: boolean;
  cleanTitle: string;
  sortTitle: string;
}

export interface ReadarrBaseAuthorMetadata {
  id: number;
  authorId: number;
  foreignAuthorId: string;
  titleSlug: string;
  overview: string;
  disambiguation: string;
  links: ReadarrBaseLink[];
  images: ReadarrBaseImage[];
  genres: string[];
  ratings: ReadarrBaseRating;
  aliases: string[];
  tags: number[];
  added: string;
  updated: string;
}

export interface ReadarrBaseBookFile {
  id: number;
  bookId: number;
  editionId: number;
  quality: ReadarrBaseQuality;
  size: number;
  dateAdded: string;
  releaseGroup: string;
  sceneName: string;
  mediaInfo: ReadarrBaseMediaInfo;
  qualityCutoffNotMet: boolean;
  path: string;
  relativePath: string;
  author: ReadarrBaseAuthor;
  book: ReadarrBaseBook;
  edition: ReadarrBaseBookEdition;
}

export interface ReadarrBaseQuality {
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

export interface ReadarrBaseMediaInfo {
  audioFormat: string;
  audioBitrate: number;
  audioChannels: number;
  audioBitsPerSample: number;
  audioSampleRate: number;
  codec: string;
  container: string;
  videoFormat: string;
  videoBitrate: number;
  videoCodec: string;
  videoFps: number;
  videoResolution: string;
  runTime: string;
  scanType: string;
}

export interface ReadarrBaseQueue {
  page: number;
  pageSize: number;
  sortKey: string;
  sortDirection: string;
  totalRecords: number;
  records: ReadarrBaseQueueRecord[];
}

export interface ReadarrBaseQueueRecord {
  id: number;
  bookId: number;
  editionId: number;
  authorId: number;
  author: ReadarrBaseAuthor;
  book: ReadarrBaseBook;
  edition: ReadarrBaseBookEdition;
  quality: ReadarrBaseQuality;
  size: number;
  title: string;
  sizeleft: number;
  timeleft: string;
  estimatedCompletionTime: string;
  status: string;
  trackedDownloadStatus: string;
  statusMessages: ReadarrBaseStatusMessage[];
  downloadId: string;
  protocol: string;
  downloadClient: string;
  downloadClientInfo: ReadarrBaseDownloadClientInfo;
  outputPath: string;
  downloadForced: boolean;
}

export interface ReadarrBaseStatusMessage {
  title: string;
  messages: string[];
}

export interface ReadarrBaseDownloadClientInfo {
  id: number;
  name: string;
  implementation: string;
  protocol: string;
  priority: number;
}

export interface ReadarrBaseCommand {
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

export interface ReadarrBaseHistory {
  page: number;
  pageSize: number;
  sortKey: string;
  sortDirection: string;
  totalRecords: number;
  records: ReadarrBaseHistoryRecord[];
}

export interface ReadarrBaseHistoryRecord {
  id: number;
  bookId: number;
  editionId: number;
  authorId: number;
  sourceTitle: string;
  quality: ReadarrBaseQuality;
  date: string;
  eventType: string;
  data: Record<string, any>;
  author: ReadarrBaseAuthor;
  book: ReadarrBaseBook;
  edition: ReadarrBaseBookEdition;
  downloadId: string;
  downloadClientInfo: ReadarrBaseDownloadClientInfo;
}

export interface ReadarrBaseWantedMissing {
  page: number;
  pageSize: number;
  sortKey: string;
  sortDirection: string;
  totalRecords: number;
  records: ReadarrBaseBook[];
}

export interface ReadarrBaseQualityProfile {
  id: number;
  name: string;
  upgradeAllowed: boolean;
  cutoff: number;
  items: ReadarrBaseQualityProfileItem[];
}

export interface ReadarrBaseQualityProfileItem {
  quality: number;
  allowed: boolean;
  name: string;
}

export interface ReadarrBaseMetadataProfile {
  id: number;
  name: string;
  minPopularity: number;
  skipMissingDate: boolean;
  skipPartsAndSets: boolean;
  skipIsbn: boolean;
  skipAsin: boolean;
  skipSeries: boolean;
  fields: ReadarrBaseMetadataProfileField[];
}

export interface ReadarrBaseMetadataProfileField {
  name: string;
  value: any;
}

export interface ReadarrBaseRootFolder {
  id: number;
  path: string;
  freeSpace: number;
  totalSpace: number;
  unmappedFolders: ReadarrBaseUnmappedFolder[];
}

export interface ReadarrBaseUnmappedFolder {
  name: string;
  path: string;
  relativePath: string;
}

export interface ReadarrBaseNotification {
  id: number;
  name: string;
  implementation: string;
  implementationName: string;
  configContract: string;
  infoLink: string;
  tags: number[];
  enable: boolean;
  onGrab: boolean;
  onDownload: boolean;
  onUpgrade: boolean;
  onRename: boolean;
  onHealthIssue: boolean;
  onHealthRestored: boolean;
  onApplicationUpdate: boolean;
  onManualInteractionRequired: boolean;
  supportsOnGrab: boolean;
  supportsOnDownload: boolean;
  supportsOnUpgrade: boolean;
  supportsOnRename: boolean;
  supportsOnHealthIssue: boolean;
  supportsOnHealthRestored: boolean;
  supportsOnApplicationUpdate: boolean;
  supportsOnManualInteractionRequired: boolean;
  fields: ReadarrBaseField[];
}

export interface ReadarrBaseField {
  name: string;
  label: string;
  value: any;
  type: string;
  advanced: boolean;
  privacy: string;
}

export interface ReadarrBaseTag {
  id: number;
  label: string;
}

export interface ReadarrBaseLog {
  id: number;
  time: string;
  level: string;
  logger: string;
  exception: string;
  message: string;
  exceptionType: string;
  exceptionInfo: string;
  properties: Record<string, any>;
}

export interface ReadarrBaseDownloadClient {
  id: number;
  name: string;
  implementation: string;
  implementationName: string;
  configContract: string;
  infoLink: string;
  tags: number[];
  enable: boolean;
  protocol: string;
  priority: number;
  fields: ReadarrBaseField[];
}