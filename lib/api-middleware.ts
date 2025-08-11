/**
 * API middleware for handling mock vs live data mode
 */

import { NextRequest, NextResponse } from 'next/server';
import { isMockMode } from './config/mode-config';
import { shouldUseMockData } from './mock-data';

/**
 * Interface for API route handlers
 */
export interface ApiRouteHandler {
  (req: NextRequest): Promise<NextResponse>;
}

/**
 * Interface for mock data generators
 */
export interface MockDataGenerator<T> {
  generate(): T;
  generateList(count: number): T[];
}

/**
 * Higher-order function that wraps API routes to use mock data when in mock mode
 * @param liveHandler The handler to use when in live mode
 * @param mockGenerator The mock data generator to use when in mock mode
 * @param count Optional count for generating lists (defaults to 10)
 * @returns A wrapped API route handler
 */
export function withMockData<T>(
  liveHandler: ApiRouteHandler,
  mockGenerator: MockDataGenerator<T>,
  count: number = 10
): ApiRouteHandler {
  return async (req: NextRequest): Promise<NextResponse> => {
    if (isMockMode()) {
      // Generate mock data based on the request method
      const data = mockGenerator.generateList(count);
      return NextResponse.json(data);
    }
    
    // Use live handler when not in mock mode
    return liveHandler(req);
  };
}

/**
 * Higher-order function that wraps API routes to use mock data when in mock mode
 * This version is for single item endpoints (like /api/service/[id])
 * @param liveHandler The handler to use when in live mode
 * @param mockGenerator The mock data generator to use when in mock mode
 * @returns A wrapped API route handler
 */
export function withMockSingleItem<T>(
  liveHandler: ApiRouteHandler,
  mockGenerator: MockDataGenerator<T>
): ApiRouteHandler {
  return async (req: NextRequest): Promise<NextResponse> => {
    if (isMockMode()) {
      // Generate single mock item
      const data = mockGenerator.generate();
      return NextResponse.json(data);
    }
    
    // Use live handler when not in mock mode
    return liveHandler(req);
  };
}

/**
 * Higher-order function that wraps API routes to use mock data when in mock mode
 * This version allows for custom mock data generation based on the request
 * @param liveHandler The handler to use when in live mode
 * @param mockHandler The handler to use when in mock mode
 * @returns A wrapped API route handler
 */
export function withMockHandler(
  liveHandler: ApiRouteHandler,
  mockHandler: ApiRouteHandler
): ApiRouteHandler {
  return async (req: NextRequest): Promise<NextResponse> => {
    if (isMockMode()) {
      // Use custom mock handler
      return mockHandler(req);
    }
    
    // Use live handler when not in mock mode
    return liveHandler(req);
  };
}

/**
 * Utility function to create a mock response handler
 * @param generator The mock data generator
 * @param count Optional count for generating lists (defaults to 10)
 * @returns A mock response handler
 */
export function createMockResponseHandler<T>(
  generator: MockDataGenerator<T>,
  count: number = 10
): ApiRouteHandler {
  return async (): Promise<NextResponse> => {
    const data = generator.generateList(count);
    return NextResponse.json(data);
  };
}

/**
 * Utility function to create a mock single item response handler
 * @param generator The mock data generator
 * @returns A mock single item response handler
 */
export function createMockSingleItemHandler<T>(
  generator: MockDataGenerator<T>
): ApiRouteHandler {
  return async (): Promise<NextResponse> => {
    const data = generator.generate();
    return NextResponse.json(data);
  };
}