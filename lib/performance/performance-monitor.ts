import { performance } from 'perf_hooks';

export interface QueryMetric {
  queryName: string;
  duration: number;
  timestamp: number;
}

export interface ApiMetric {
  endpoint: string;
  method: string;
  totalDuration: number;
  queryCount: number;
  totalQueryDuration: number;
  queries: QueryMetric[];
  timestamp: number;
  statusCode: number;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private currentApiCall: {
    endpoint: string;
    method: string;
    startTime: number;
    queries: QueryMetric[];
  } | null = null;
  private enabled: boolean;

  private constructor() {
    // Check environment variable for performance monitoring
    this.enabled = process.env.PERFORMANCE_LOG === 'true';
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startApiCall(endpoint: string, method: string): void {
    if (!this.enabled) return;
    
    this.currentApiCall = {
      endpoint,
      method,
      startTime: performance.now(),
      queries: [],
    };
  }

  recordQuery(queryName: string, duration: number): void {
    if (!this.enabled || !this.currentApiCall) return;
    
    this.currentApiCall.queries.push({
      queryName,
      duration,
      timestamp: performance.now(),
    });
  }

  endApiCall(statusCode: number): void {
    if (!this.enabled) return;
    
    if (!this.currentApiCall) {
      console.warn('PerformanceMonitor: No active API call to end');
      return;
    }

    const totalDuration = performance.now() - this.currentApiCall.startTime;
    const totalQueryDuration = this.currentApiCall.queries.reduce(
      (sum, query) => sum + query.duration,
      0
    );

    const metric: ApiMetric = {
      endpoint: this.currentApiCall.endpoint,
      method: this.currentApiCall.method,
      totalDuration,
      queryCount: this.currentApiCall.queries.length,
      totalQueryDuration,
      queries: [...this.currentApiCall.queries],
      timestamp: performance.now(),
      statusCode,
    };

    this.logMetric(metric);
    this.currentApiCall = null;
  }

  private logMetric(metric: ApiMetric): void {
    const timestamp = new Date().toISOString();
    
    console.group(`🚀 API Performance - ${timestamp}`);
    console.log(`📍 Endpoint: ${metric.method} ${metric.endpoint}`);
    console.log(`⏱️  Total Duration: ${metric.totalDuration.toFixed(2)}ms`);
    console.log(`📊 Status Code: ${metric.statusCode}`);
    console.log(`🔢 Query Count: ${metric.queryCount}`);
    console.log(`⚡ Total Query Time: ${metric.totalQueryDuration.toFixed(2)}ms`);
    
    if (metric.queries.length > 0) {
      console.group('📋 Database Queries:');
      metric.queries.forEach((query, index) => {
        console.log(`${index + 1}. ${query.queryName}: ${query.duration.toFixed(2)}ms`);
      });
      console.groupEnd();
    }
    
    // Calculate overhead (time not spent in queries)
    const overhead = metric.totalDuration - metric.totalQueryDuration;
    console.log(`🔄 Overhead: ${overhead.toFixed(2)}ms`);
    
    console.groupEnd();
  }

  // Method to check if monitoring is enabled
  isEnabled(): boolean {
    return this.enabled;
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();

// Higher-order function to wrap API route handlers
export const withPerformanceMonitoring = <T extends any[], R>(
  handler: (...args: T) => Promise<R>,
  endpoint: string,
  method: string
) => {
  return async (...args: T): Promise<R> => {
    // If performance monitoring is disabled, just call the handler directly
    if (!performanceMonitor.isEnabled()) {
      return await handler(...args);
    }

    performanceMonitor.startApiCall(endpoint, method);
    
    try {
      const result = await handler(...args);
      performanceMonitor.endApiCall(200);
      return result;
    } catch (error: any) {
      const statusCode = error.status || 500;
      performanceMonitor.endApiCall(statusCode);
      throw error;
    }
  };
};

// Higher-order function to wrap database queries
export const withQueryMonitoring = <T>(
  queryFn: () => Promise<T>,
  queryName: string
) => {
  return async (): Promise<T> => {
    // If performance monitoring is disabled, just call the query function directly
    if (!performanceMonitor.isEnabled()) {
      return await queryFn();
    }

    const startTime = performance.now();
    
    try {
      const result = await queryFn();
      const duration = performance.now() - startTime;
      performanceMonitor.recordQuery(queryName, duration);
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      performanceMonitor.recordQuery(queryName, duration);
      throw error;
    }
  };
};
