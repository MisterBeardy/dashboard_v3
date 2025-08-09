export interface SonarrSystemStatus {
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

export interface SonarrSystemHealth {
  type: string;
  message: string;
  source: string;
}

export interface SonarrDiskSpace {
  path: string;
  label: string;
  freeSpace: number;
  totalSpace: number;
  type: string;
}

export interface SonarrSystemTask {
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

export interface SonarrUpdateInfo {
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
