/**
 * Mock data generators for SABnzbd
 */

import { BaseMockDataGenerator, mockUtils } from './index';

// SABnzbd History interface
export interface SabnzbdHistory {
  name: string;
  status: string;
  category: string;
  size: string;
  script: string;
  nzb_name: string;
  downloaded: number;
  download_time: number;
  postproc_time: number;
  stage: string;
  storage: string;
  path: string;
  md5sum: string;
  fail_message: string;
  url: string;
  url_info: string;
  nzo_id: string;
  loaded: boolean;
  retry_count: number;
  direct_unpack: boolean;
  completed: number;
}

// SABnzbd Queue interface
export interface SabnzbdQueue {
  nzo_id: string;
  filename: string;
  priority: string;
  category: string;
  pp: string;
  script: string;
  size: string;
  sizeleft: string;
  percentage: number;
  mbleft: number;
  mb: number;
  number: number;
  timeleft: string;
  eta: string;
  avg_age: string;
  status: string;
  direct_unpack: boolean;
  password: string;
  progress: string;
  stage: string;
}

// SABnzbd Categories interface
export interface SabnzbdCategory {
  name: string;
  description: string;
  dir: string;
  priority: string;
  pp: string;
  script: string;
}

// SABnzbd Config interface
export interface SabnzbdConfig {
  misc: {
    temp_dir: string;
    download_dir: string;
    complete_dir: string;
    admin_dir: string;
    cache_dir: string;
    api_key: string;
    nzb_backup_dir: string;
    log_dir: string;
  };
  server: {
    host: string;
    port: number;
    username: string;
    password: string;
  };
  categories: SabnzbdCategory[];
}

// SABnzbd Server Stats interface
export interface SabnzbdServerStats {
  servers: Array<{
    host: string;
    port: number;
    connections: number;
    articles: number;
    interval: number;
    threads: number;
    optime: number;
    errors: number;
    rate: number;
  }>;
  total: {
    articles: number;
    rate: number;
  };
}

export class SabnzbdHistoryMockGenerator extends BaseMockDataGenerator<SabnzbdHistory> {
  generate(): SabnzbdHistory {
    const statuses = ['Completed', 'Failed', 'Running', 'Paused'];
    const categories = ['movies', 'tv', 'music', 'software', 'other'];
    const stages = ['Download', 'Unpack', 'Repair', 'Complete'];
    
    return {
      name: `${mockUtils.randomString(10)}.nzb`,
      status: mockUtils.randomChoice(statuses),
      category: mockUtils.randomChoice(categories),
      size: `${mockUtils.randomFloat(0.1, 50).toFixed(2)} GB`,
      script: '',
      nzb_name: `${mockUtils.randomString(10)}.nzb`,
      downloaded: mockUtils.randomInt(0, 100),
      download_time: mockUtils.randomInt(60, 3600),
      postproc_time: mockUtils.randomInt(0, 1800),
      stage: mockUtils.randomChoice(stages),
      storage: `/downloads/${mockUtils.randomString(10)}`,
      path: `/downloads/${mockUtils.randomString(10)}/${mockUtils.randomString(10)}`,
      md5sum: mockUtils.randomString(32),
      fail_message: mockUtils.randomBool() ? 'Download failed' : '',
      url: `https://indexer.com/download/${mockUtils.randomString(32)}`,
      url_info: `https://indexer.com/details/${mockUtils.randomString(32)}`,
      nzo_id: mockUtils.randomString(32),
      loaded: true,
      retry_count: mockUtils.randomInt(0, 5),
      direct_unpack: mockUtils.randomBool(),
      completed: mockUtils.randomInt(0, 100)
    };
  }
}

export class SabnzbdQueueMockGenerator extends BaseMockDataGenerator<SabnzbdQueue> {
  generate(): SabnzbdQueue {
    const priorities = ['Default', 'High', 'Low', 'Force'];
    const categories = ['movies', 'tv', 'music', 'software', 'other'];
    const statuses = ['Downloading', 'Paused', 'Queued'];
    const stages = ['Download', 'Unpack', 'Repair', 'Complete'];
    
    const size = mockUtils.randomFloat(0.1, 50);
    const percentage = mockUtils.randomInt(0, 100);
    const sizeleft = size * (100 - percentage) / 100;
    
    return {
      nzo_id: mockUtils.randomString(32),
      filename: `${mockUtils.randomString(10)}.nzb`,
      priority: mockUtils.randomChoice(priorities),
      category: mockUtils.randomChoice(categories),
      pp: mockUtils.randomChoice(['+delete', '+unpack', '']),
      script: '',
      size: `${size.toFixed(2)} GB`,
      sizeleft: `${sizeleft.toFixed(2)} GB`,
      percentage: percentage,
      mbleft: sizeleft * 1024,
      mb: size * 1024,
      number: mockUtils.randomInt(1, 100),
      timeleft: mockUtils.randomBool() ? `${mockUtils.randomInt(1, 60)}m` : '',
      eta: mockUtils.randomBool() ? mockUtils.date(mockUtils.randomInt(0, 1)) : '',
      avg_age: `${mockUtils.randomInt(1, 1000)}d`,
      status: mockUtils.randomChoice(statuses),
      direct_unpack: mockUtils.randomBool(),
      password: mockUtils.randomBool() ? 'password' : '',
      progress: `${percentage}%`,
      stage: mockUtils.randomChoice(stages)
    };
  }
}

export class SabnzbdCategoryMockGenerator extends BaseMockDataGenerator<SabnzbdCategory> {
  generate(): SabnzbdCategory {
    const categories = [
      { name: 'movies', description: 'Movie downloads', dir: '/downloads/movies' },
      { name: 'tv', description: 'TV show downloads', dir: '/downloads/tv' },
      { name: 'music', description: 'Music downloads', dir: '/downloads/music' },
      { name: 'software', description: 'Software downloads', dir: '/downloads/software' },
      { name: 'other', description: 'Other downloads', dir: '/downloads/other' }
    ];
    
    const category = mockUtils.randomChoice(categories);
    
    return {
      name: category.name,
      description: category.description,
      dir: category.dir,
      priority: mockUtils.randomChoice(['Default', 'High', 'Low']),
      pp: mockUtils.randomChoice(['+delete', '+unpack', '']),
      script: ''
    };
  }
}

export class SabnzbdConfigMockGenerator extends BaseMockDataGenerator<SabnzbdConfig> {
  generate(): SabnzbdConfig {
    const categories = new SabnzbdCategoryMockGenerator().generateList(5);
    
    return {
      misc: {
        temp_dir: '/tmp/sabnzbd',
        download_dir: '/downloads',
        complete_dir: '/downloads/complete',
        admin_dir: '/admin',
        cache_dir: '/cache',
        api_key: mockUtils.randomString(32),
        nzb_backup_dir: '/backups/nzb',
        log_dir: '/logs'
      },
      server: {
        host: 'localhost',
        port: 8080,
        username: 'admin',
        password: 'password'
      },
      categories: categories
    };
  }
}

export class SabnzbdServerStatsMockGenerator extends BaseMockDataGenerator<SabnzbdServerStats> {
  generate(): SabnzbdServerStats {
    const serverCount = mockUtils.randomInt(1, 5);
    const servers = Array.from({ length: serverCount }, () => ({
      host: `news.${mockUtils.randomString(10)}.com`,
      port: mockUtils.randomInt(119, 563),
      connections: mockUtils.randomInt(1, 30),
      articles: mockUtils.randomInt(1000, 100000),
      interval: mockUtils.randomInt(1, 60),
      threads: mockUtils.randomInt(1, 10),
      optime: mockUtils.randomInt(1, 3600),
      errors: mockUtils.randomInt(0, 100),
      rate: mockUtils.randomFloat(0.1, 100)
    }));
    
    const totalArticles = servers.reduce((sum, server) => sum + server.articles, 0);
    const totalRate = servers.reduce((sum, server) => sum + server.rate, 0);
    
    return {
      servers: servers,
      total: {
        articles: totalArticles,
        rate: totalRate
      }
    };
  }
}

// Export instances for easy use
export const sabnzbdMock = {
  history: new SabnzbdHistoryMockGenerator(),
  queue: new SabnzbdQueueMockGenerator(),
  category: new SabnzbdCategoryMockGenerator(),
  config: new SabnzbdConfigMockGenerator(),
  serverStats: new SabnzbdServerStatsMockGenerator()
};