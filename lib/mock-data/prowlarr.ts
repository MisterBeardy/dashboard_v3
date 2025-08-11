/**
 * Mock data generators for Prowlarr
 */

import { BaseMockDataGenerator, mockUtils } from './index';

// Prowlarr Indexer interface
export interface ProwlarrIndexer {
  id: number;
  name: string;
  implementation: string;
  protocol: 'torrent' | 'usenet';
  enableRss: boolean;
  enableAutomaticSearch: boolean;
  enableInteractiveSearch: boolean;
  priority: number;
  downloadClientId?: number;
  tags: number[];
  fields: Array<{
    name: string;
    value: string;
  }>;
}

// Prowlarr Application interface
export interface ProwlarrApplication {
  id: number;
  name: string;
  implementationName: string;
  implementation: string;
  configContract: string;
  syncLevel: string;
  enableRss: boolean;
  enableAutomaticSearch: boolean;
  enableInteractiveSearch: boolean;
  priority: number;
  downloadClientId?: number;
  tags: number[];
}

// Prowlarr Download Client interface
export interface ProwlarrDownloadClient {
  id: number;
  name: string;
  implementation: string;
  enable: boolean;
  priority: number;
  configContract: string;
  protocol: 'torrent' | 'usenet';
  tags: number[];
}

// Prowlarr Health interface
export interface ProwlarrHealth {
  source: string;
  type: string;
  level: 'ok' | 'warning' | 'error';
  message: string;
  wikiUrl?: string;
}

// Prowlarr System Status interface
export interface ProwlarrSystemStatus {
  version: string;
  buildTime: string;
  isDebug: boolean;
  isProduction: boolean;
  isAdmin: boolean;
  isUser: boolean;
  isReadOnly: boolean;
  startTime: string;
  packageVersion: string;
  packageAuthor: string;
}

export class ProwlarrIndexerMockGenerator extends BaseMockDataGenerator<ProwlarrIndexer> {
  generate(): ProwlarrIndexer {
    const implementations = ['Torznab', 'Newznab', 'Cardigann', 'BroadcastheNet', 'Orpheus'];
    const protocols: ('torrent' | 'usenet')[] = ['torrent', 'usenet'];
    
    return {
      id: mockUtils.id(),
      name: `${mockUtils.randomChoice(['Public', 'Private', 'Semi-Private'])} ${mockUtils.randomString(8)} Indexer`,
      implementation: mockUtils.randomChoice(implementations),
      protocol: mockUtils.randomChoice(protocols),
      enableRss: mockUtils.randomBool(),
      enableAutomaticSearch: mockUtils.randomBool(),
      enableInteractiveSearch: mockUtils.randomBool(),
      priority: mockUtils.randomInt(1, 50),
      downloadClientId: mockUtils.randomBool() ? mockUtils.id() : undefined,
      tags: Array.from({ length: mockUtils.randomInt(0, 3) }, () => mockUtils.id()),
      fields: [
        {
          name: 'baseUrl',
          value: `https://${mockUtils.randomString(10)}.com`
        },
        {
          name: 'apiKey',
          value: mockUtils.randomString(32)
        }
      ]
    };
  }
}

export class ProwlarrApplicationMockGenerator extends BaseMockDataGenerator<ProwlarrApplication> {
  generate(): ProwlarrApplication {
    const implementations = ['Prowlarr', 'Lidarr', 'Radarr', 'Sonarr'];
    
    return {
      id: mockUtils.id(),
      name: `${mockUtils.randomString(8)} Application`,
      implementationName: mockUtils.randomChoice(implementations),
      implementation: mockUtils.randomChoice(implementations).toLowerCase(),
      configContract: mockUtils.randomString(10),
      syncLevel: mockUtils.randomChoice(['FullSync', 'Disabled']),
      enableRss: mockUtils.randomBool(),
      enableAutomaticSearch: mockUtils.randomBool(),
      enableInteractiveSearch: mockUtils.randomBool(),
      priority: mockUtils.randomInt(1, 50),
      downloadClientId: mockUtils.randomBool() ? mockUtils.id() : undefined,
      tags: Array.from({ length: mockUtils.randomInt(0, 3) }, () => mockUtils.id())
    };
  }
}

export class ProwlarrDownloadClientMockGenerator extends BaseMockDataGenerator<ProwlarrDownloadClient> {
  generate(): ProwlarrDownloadClient {
    const implementations = ['SabNZBd', 'NZBGet', 'Transmission', 'qBittorrent', 'Deluge'];
    const protocols: ('torrent' | 'usenet')[] = ['torrent', 'usenet'];
    
    return {
      id: mockUtils.id(),
      name: `${mockUtils.randomChoice(['Main', 'Backup', 'Alternate'])} ${mockUtils.randomChoice(implementations)}`,
      implementation: mockUtils.randomChoice(implementations),
      enable: mockUtils.randomBool(),
      priority: mockUtils.randomInt(1, 50),
      configContract: mockUtils.randomString(10),
      protocol: mockUtils.randomChoice(protocols),
      tags: Array.from({ length: mockUtils.randomInt(0, 3) }, () => mockUtils.id())
    };
  }
}

export class ProwlarrHealthMockGenerator extends BaseMockDataGenerator<ProwlarrHealth> {
  generate(): ProwlarrHealth {
    const sources = ['System', 'Database', 'Disk', 'Indexer', 'DownloadClient'];
    const types = ['Connection', 'Authentication', 'Configuration', 'Performance'];
    const levels: ('ok' | 'warning' | 'error')[] = ['ok', 'warning', 'error'];
    
    return {
      source: mockUtils.randomChoice(sources),
      type: mockUtils.randomChoice(types),
      level: mockUtils.randomChoice(levels),
      message: `${mockUtils.randomChoice(['Warning', 'Error', 'Info'])}: ${mockUtils.randomString(20)}`,
      wikiUrl: mockUtils.randomBool() ? `https://wiki.prowlarr.com/${mockUtils.randomString(10)}` : undefined
    };
  }
}

export class ProwlarrSystemStatusMockGenerator extends BaseMockDataGenerator<ProwlarrSystemStatus> {
  generate(): ProwlarrSystemStatus {
    return {
      version: `1.${mockUtils.randomInt(0, 20)}.${mockUtils.randomInt(0, 9999)}.${mockUtils.randomInt(0, 9999)}`,
      buildTime: mockUtils.date(mockUtils.randomInt(0, 365)),
      isDebug: false,
      isProduction: true,
      isAdmin: true,
      isUser: true,
      isReadOnly: false,
      startTime: mockUtils.date(mockUtils.randomInt(0, 30)),
      packageVersion: `1.${mockUtils.randomInt(0, 20)}.${mockUtils.randomInt(0, 9999)}`,
      packageAuthor: 'Prowlarr Team'
    };
  }
}

// Export instances for easy use
export const prowlarrMock = {
  indexer: new ProwlarrIndexerMockGenerator(),
  application: new ProwlarrApplicationMockGenerator(),
  downloadClient: new ProwlarrDownloadClientMockGenerator(),
  health: new ProwlarrHealthMockGenerator(),
  systemStatus: new ProwlarrSystemStatusMockGenerator()
};