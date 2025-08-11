/**
 * Mock data generators for all services
 */

import { isMockMode } from '../config/mode-config';

// Generic interface for mock data generators
export interface MockDataGenerator<T> {
  generate(): T;
  generateList(count: number): T[];
}

// Base mock data generator class
export abstract class BaseMockDataGenerator<T> implements MockDataGenerator<T> {
  abstract generate(): T;
  
  generateList(count: number): T[] {
    return Array.from({ length: count }, () => this.generate());
  }
}

// Utility functions for generating mock data
export const mockUtils = {
  id: () => Math.floor(Math.random() * 1000000),
  date: (daysAgo = 0) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString();
  },
  randomInt: (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min,
  randomFloat: (min: number, max: number) => Math.random() * (max - min) + min,
  randomChoice: <T>(array: T[]) => array[Math.floor(Math.random() * array.length)],
  randomBool: () => Math.random() > 0.5,
  randomString: (length = 10) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },
  randomFileSize: () => mockUtils.randomInt(1000000, 5000000000), // 1MB to 5GB
  randomStatus: () => mockUtils.randomChoice(['completed', 'pending', 'failed', 'downloading', 'paused']),
  randomQuality: () => mockUtils.randomChoice(['SD', 'HD-720p', 'HD-1080p', 'UHD-2160p']),
  randomProtocol: () => mockUtils.randomChoice(['torrent', 'usenet']),
  randomIndexer: () => mockUtils.randomChoice(['Indexer1', 'Indexer2', 'Indexer3', 'Indexer4']),
  randomDownloadClient: () => mockUtils.randomChoice(['SabNZBd', 'NZBGet', 'Transmission', 'qBittorrent']),
};

// Check if we should use mock data
export function shouldUseMockData(): boolean {
  return isMockMode();
}