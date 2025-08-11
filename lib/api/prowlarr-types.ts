export interface ProwlarrSystemStatus {
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

export interface ProwlarrSystemHealth {
  type: string;
  message: string;
  source: string;
}

export interface ProwlarrDiskSpace {
  path: string;
  label: string;
  freeSpace: number;
  totalSpace: number;
  type: string;
}

export interface ProwlarrSystemTask {
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

export interface ProwlarrUpdateInfo {
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

export interface ProwlarrIndexer {
  id: number;
  name: string;
  implementation: string;
  implementationName: string;
  configContract: string;
  infoLink: string;
  tags: number[];
  enableRss: boolean;
  enableAutomaticSearch: boolean;
  enableInteractiveSearch: boolean;
  priority: number;
  downloadClientId: number;
  protocol: string;
  privacy: string;
  supportsRss: boolean;
  supportsSearch: boolean;
  supportsRedirect: boolean;
  supportsApi: boolean;
  fields: ProwlarrField[];
  lastSync: string;
  status: string;
}

export interface ProwlarrField {
  name: string;
  label: string;
  value: any;
  type: string;
  advanced: boolean;
  privacy: string;
}

export interface ProwlarrDownloadClient {
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
  fields: ProwlarrField[];
}

export interface ProwlarrApplication {
  id: number;
  name: string;
  implementation: string;
  implementationName: string;
  configContract: string;
  infoLink: string;
  tags: number[];
  enable: boolean;
  syncLevel: string;
  fields: ProwlarrField[];
}

export interface ProwlarrCommand {
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

export interface ProwlarrNotification {
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
  fields: ProwlarrField[];
}

export interface ProwlarrTag {
  id: number;
  label: string;
}

export interface ProwlarrLog {
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

export interface ProwlarrIndexerStatus {
  id: number;
  indexerId: number;
  indexerName: string;
  initialFailure: boolean;
  mostRecentFailure: string;
  lastSuccess: string;
  disabledTill: string;
  disabledTillReason: string;
  escalationLevel: number;
  rssSync: boolean;
  search: boolean;
  auth: boolean;
  error: string;
}

export interface ProwlarrDownloadClientStatus {
  id: number;
  downloadClientId: number;
  downloadClientName: string;
  initialFailure: boolean;
  mostRecentFailure: string;
  lastSuccess: string;
  disabledTill: string;
  disabledTillReason: string;
  escalationLevel: number;
  error: string;
}

export interface ProwlarrApplicationStatus {
  id: number;
  applicationId: number;
  applicationName: string;
  initialFailure: boolean;
  mostRecentFailure: string;
  lastSuccess: string;
  disabledTill: string;
  disabledTillReason: string;
  escalationLevel: number;
  error: string;
}

export interface ProwlarrHistory {
  page: number;
  pageSize: number;
  sortKey: string;
  sortDirection: string;
  totalRecords: number;
  records: ProwlarrHistoryRecord[];
}

export interface ProwlarrHistoryRecord {
  id: number;
  indexerId: number;
  indexer: string;
  protocol: string;
  downloadId: string;
  title: string;
  quality: string;
  qualityVersion: number;
  size: number;
  date: string;
  eventType: string;
  data: Record<string, any>;
  downloadClient: string;
  downloadUrl: string;
  guid: string;
  age: number;
  ageHours: number;
  ageMinutes: number;
  publishedDate: string;
  downloadTitle: string;
  infoUrl: string;
  downloadClientInfo: ProwlarrDownloadClientInfo;
  indexerFlags: string[];
  rejected: boolean;
  downloadStatus: string;
  errorMessage: string;
  sourceTitle: string;
}

export interface ProwlarrDownloadClientInfo {
  id: number;
  name: string;
  implementation: string;
  protocol: string;
}

export interface ProwlarrRelease {
  guid: string;
  title: string;
  size: number;
  downloadUrl: string;
  infoUrl: string;
  commentUrl: string;
  indexerId: number;
  indexer: string;
  protocol: string;
  downloadProtocol: string;
  publishDate: string;
  age: number;
  ageHours: number;
  ageMinutes: number;
  ageSeconds: number;
  publishedDate: string;
  tvReleaseId?: number;
  tvReleaseTitle?: string;
  tvReleaseSeason?: number;
  tvReleaseEpisode?: number;
  tvReleaseEpisodeTitle?: string;
  tvReleaseAbsolute?: number;
  tvReleaseDoubleEpisode?: boolean;
  tvReleaseDaily?: boolean;
  tvReleaseAnime?: boolean;
  movieReleaseId?: number;
  movieReleaseTitle?: string;
  movieReleaseYear?: number;
  movieReleaseImdbId?: string;
  movieReleaseTmdbId?: number;
  movieReleaseQuality?: string;
  movieReleaseResolution?: string;
  movieReleaseSource?: string;
  movieReleaseCodec?: string;
  movieReleaseContainer?: string;
  movieReleaseReleaseGroup?: string;
  movieReleaseEdition?: string;
  movieReleaseLanguages?: string[];
  movieReleaseSubtitles?: string[];
  movieReleaseHash?: string;
  movieReleaseRegion?: string;
  movieReleaseScene?: boolean;
  movieReleaseFreeleech?: boolean;
  movieReleaseDoubleUpload?: boolean;
  movieReleaseInternal?: boolean;
  movieReleaseNuked?: boolean;
  movieReleaseNukeReason?: string;
  movieReleaseRepack?: boolean;
  movieReleaseProper?: boolean;
  movieReleaseRerip?: boolean;
  movieReleaseFixup?: boolean;
  movieReleaseHybrid?: boolean;
  movieReleaseRemux?: boolean;
  movieReleaseEncode?: boolean;
  movieReleaseWebdl?: boolean;
  movieReleaseHdtv?: boolean;
  movieReleasePdtv?: boolean;
  movieReleaseSdtv?: boolean;
  movieReleaseBluRay?: boolean;
  movieReleaseDvd?: boolean;
  movieReleaseScr?: boolean;
  movieReleaseTelecine?: boolean;
  movieReleaseCam?: boolean;
  movieReleaseWorkprint?: boolean;
  movieReleaseTs?: boolean;
  movieReleaseScreenSize?: string;
  movieReleaseAudioFormat?: string;
  movieReleaseAudioChannels?: string;
  movieReleaseAudioBitrate?: string;
  movieReleaseVideoBitrate?: string;
  movieReleaseVideoFormat?: string;
  movieReleaseVideoResolution?: string;
  movieReleaseVideoSource?: string;
  movieReleaseVideoCodec?: string;
  movieReleaseVideoContainer?: string;
  movieReleaseVideoFrameRate?: string;
  movieReleaseVideoScanType?: string;
  seeders?: number;
  leechers?: number;
  grabs?: number;
  comments?: number;
  passkey?: string;
}