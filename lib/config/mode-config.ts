/**
 * Configuration for handling mock vs live data mode
 */

export type DataMode = 'mock' | 'live';

/**
 * Get the current data mode from environment variables
 * Defaults to 'live' if not specified
 */
export function getDataMode(): DataMode {
  return (process.env.DATA_MODE || 'live') as DataMode;
}

/**
 * Check if the application is running in mock mode
 */
export function isMockMode(): boolean {
  return getDataMode() === 'mock';
}

/**
 * Check if the application is running in live mode
 */
export function isLiveMode(): boolean {
  return getDataMode() === 'live';
}

/**
 * Set the data mode (useful for testing)
 */
export function setDataMode(mode: DataMode): void {
  process.env.DATA_MODE = mode;
}