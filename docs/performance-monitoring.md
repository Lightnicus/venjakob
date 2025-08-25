# API Performance Monitoring System

## Overview
The performance monitoring system provides real-time insights into API endpoint performance, database query execution times, and optimization opportunities. It uses a DRY (Don't Repeat Yourself) approach with Higher-Order Functions (HOFs) to wrap API routes and database functions with minimal code changes.

## Features

### Real-Time Monitoring
- **Console Logging**: Detailed performance metrics logged to console in real-time
- **Configurable**: Enable/disable via environment variable `PERFORMANCE_LOG`
- **Comprehensive Metrics**: API endpoint duration, query count, individual query times, and overhead analysis

### DRY Implementation
- **Higher-Order Functions**: Reusable wrappers for API routes and database functions
- **Minimal Code Changes**: Wrap existing functions without modifying core logic
- **Type-Safe**: Full TypeScript support with proper type inference

### Performance Metrics Tracked
1. **API Endpoint**: Method and path being monitored
2. **Total Duration**: Complete API endpoint execution time
3. **Status Code**: HTTP response status
4. **Query Count**: Number of database queries executed
5. **Total Query Time**: Sum of all database query execution times
6. **Individual Query Times**: Duration of each database query
7. **Overhead**: Difference between total duration and query time (negative indicates parallel execution)

## Configuration

### Environment Variable
```bash
# .env
PERFORMANCE_LOG=true  # Enable performance monitoring
PERFORMANCE_LOG=false # Disable performance monitoring
```

### Performance Monitor Singleton
The system uses a singleton pattern to ensure consistent monitoring across the application:

```typescript
// lib/performance/performance-monitor.ts
class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private enabled: boolean;
  private currentApiCall: ApiMetric | null = null;

  private constructor() {
    this.enabled = process.env.PERFORMANCE_LOG === 'true';
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }
}
```

## Implementation Guide

### 1. API Route Monitoring

Wrap API route handlers with `withPerformanceMonitoring`:

```typescript
// app/api/articles/route.ts
import { withPerformanceMonitoring } from '@/lib/performance/performance-monitor';

export const GET = withPerformanceMonitoring(
  async (request: NextRequest) => {
    // Your existing API logic here
    const articles = await getArticles();
    return NextResponse.json(articles);
  },
  '/api/articles',  // Endpoint path
  'GET'            // HTTP method
);
```

### 2. Database Function Monitoring

#### Option A: Using withQueryMonitoring HOF (for functions without arguments)
```typescript
// lib/db/articles-monitored.ts
import { withQueryMonitoring } from '@/lib/performance/performance-monitor';

export const getArticles = withQueryMonitoring(
  async (): Promise<Article[]> => {
    return await db.select().from(articles).where(eq(articles.deleted, false));
  },
  'getArticles'
);
```

#### Option B: Manual Monitoring (for functions with arguments)
```typescript
// lib/db/articles-monitored.ts
import { performanceMonitor } from '@/lib/performance/performance-monitor';

export const getArticleWithCalculations = async (articleId: string) => {
  const startTime = performance.now();
  try {
    const result = await originalGetArticleWithCalculations(articleId);
    const duration = performance.now() - startTime;
    performanceMonitor.recordQuery(`getArticleWithCalculations_${articleId}`, duration);
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    performanceMonitor.recordQuery(`getArticleWithCalculations_${articleId}`, duration);
    throw error;
  }
};
```

### 3. Complete Implementation Example

```typescript
// app/api/articles/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getArticleWithCalculations } from '@/lib/db/articles-monitored';
import { withPerformanceMonitoring } from '@/lib/performance/performance-monitor';

export const GET = withPerformanceMonitoring(
  async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params;
      const article = await getArticleWithCalculations(id);
      
      if (!article) {
        return NextResponse.json(
          { error: 'Article not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(article);
    } catch (error) {
      console.error('Error fetching article:', error);
      return NextResponse.json(
        { error: 'Failed to fetch article' },
        { status: 500 }
      );
    }
  },
  '/api/articles/[id]',
  'GET'
);
```

## Performance Optimization Strategies

### 1. Batch Queries (Solution 1)
Replace N+1 queries with batch operations:

```typescript
// Before: Individual queries per article
const articlesWithCounts = await Promise.all(
  allArticles.map(async (article) => {
    const [countResult] = await db
      .select({ count: count(articleCalculationItem.id) })
      .from(articleCalculationItem)
      .where(and(eq(articleCalculationItem.articleId, article.id), eq(articleCalculationItem.deleted, false)));
    return { ...article, calculationCount: Number(countResult?.count || 0) };
  })
);

// After: Single batch query
const calculationCounts = await db
  .select({
    articleId: articleCalculationItem.articleId,
    count: count(articleCalculationItem.id)
  })
  .from(articleCalculationItem)
  .where(eq(articleCalculationItem.deleted, false))
  .groupBy(articleCalculationItem.articleId);
```

### 2. Database Indexes (Solution 2)
Add performance indexes to frequently queried columns:

```typescript
// lib/db/schema.ts
export const articles = pgTable('articles', {
  // ... columns
}, table => ({
  deletedNumberIdx: index('idx_articles_deleted_number').on(table.deleted, table.number),
  numberIdx: index('idx_articles_number').on(table.number),
}));

export const articleCalculationItem = pgTable('article_calculation_item', {
  // ... columns
}, table => ({
  articleIdDeletedIdx: index('idx_article_calc_article_deleted').on(table.articleId, table.deleted),
  orderIdx: index('idx_article_calc_order').on(table.order),
}));
```

### 3. Parallel Execution (Solution 3)
Run independent queries simultaneously:

```typescript
// Before: Sequential execution
const allArticles = await db.select().from(articles);
const defaultLanguage = await db.select().from(languages).where(eq(languages.default, true));
const allLanguages = await db.select().from(languages);

// After: Parallel execution
const [allArticles, defaultLanguage, allLanguages] = await Promise.all([
  db.select().from(articles),
  db.select().from(languages).where(eq(languages.default, true)),
  db.select().from(languages)
]);
```

### 4. Query Structure Optimization (Solution 4)
Optimize query structure and reduce data transfer:

```typescript
// Before: Fetching all columns
const articleContent = await db.select().from(blockContent);

// After: Select only needed columns
const articleContent = await db.select({
  articleId: blockContent.articleId,
  title: blockContent.title,
  languageId: blockContent.languageId,
}).from(blockContent);
```

## Console Output Format

The system generates detailed console logs in this format:

```
🚀 API Performance - 2025-08-25T21:53:13.192Z
  📍 Endpoint: GET /api/articles/[id]
  ⏱️  Total Duration: 2766.78ms
  📊 Status Code: 200
  🔢 Query Count: 1
  ⚡ Total Query Time: 2764.70ms
  📋 Database Queries:
    1. getArticleWithCalculations_b312c2be-a4a2-4a00-81a2-5e5a09085d7e: 2764.70ms
  🔄 Overhead: 2.08ms
```

## Performance Analysis

### Interpreting Metrics

1. **Total Duration**: Complete API endpoint execution time
2. **Query Count**: Number of database queries (lower is better)
3. **Total Query Time**: Sum of all database query times
4. **Overhead**: 
   - **Positive**: Sequential execution or additional processing
   - **Negative**: Parallel execution (good)
   - **Large negative**: Potential timing issues or overlapping queries

### Performance Targets

| Metric | Target | Current (Example) | Status |
|--------|--------|------------------|---------|
| Articles List | <500ms | 4117ms | ❌ Needs optimization |
| Individual Article | <200ms | 2766ms | ❌ Needs optimization |
| Query Count | <5 queries | 12 queries | ❌ Needs optimization |
| Overhead | Small negative | -31012ms | ⚠️ Timing issues |

### Common Issues and Solutions

#### 1. Query Duplication
**Problem**: Same queries running multiple times
```
1. getAllLanguages: 452.81ms
2. getAllLanguages: 3820.52ms  ← DUPLICATE!
```

**Solution**: Check for React strict mode, multiple API calls, or caching issues

#### 2. Increasing Query Times
**Problem**: Queries getting slower over time
```
1. getAllLanguages: 452.81ms
2. getAllLanguages: 3820.52ms  ← Getting slower!
```

**Solution**: Check database connection pool, connection limits, and timeout settings

#### 3. High Individual Query Times
**Problem**: Single queries taking too long
```
getArticleWithCalculations_b312c2be-a4a2-4a00-81a2-5e5a09085d7e: 2764.70ms
```

**Solution**: Add missing indexes, optimize query structure, implement parallel execution

## Best Practices

### 1. Start Small
- Begin with one endpoint
- Fix issues before expanding
- Monitor performance improvements

### 2. Use Parallel Execution
- Run independent queries simultaneously
- Use `Promise.all()` for batch operations
- Avoid sequential database calls

### 3. Implement Batch Queries
- Replace N+1 queries with batch operations
- Use `GROUP BY` for aggregations
- Minimize database round trips

### 4. Add Strategic Indexes
- Index frequently queried columns
- Use composite indexes for common query patterns
- Monitor query execution plans

### 5. Optimize Query Structure
- Select only needed columns
- Use appropriate WHERE clauses
- Avoid unnecessary joins

## Migration Workflow

### 1. Enable Monitoring
```bash
# .env
PERFORMANCE_LOG=true
```

### 2. Wrap API Routes
```typescript
export const GET = withPerformanceMonitoring(
  yourHandler,
  '/api/your-endpoint',
  'GET'
);
```

### 3. Monitor Database Functions
```typescript
// Create monitored version
export const yourFunction = withQueryMonitoring(
  originalFunction,
  'functionName'
);
```

### 4. Analyze Performance
- Review console logs
- Identify bottlenecks
- Implement optimizations

### 5. Verify Improvements
- Compare before/after metrics
- Ensure performance targets are met
- Test with real data

## Troubleshooting

### Performance Monitor Not Working
1. Check `PERFORMANCE_LOG` environment variable
2. Verify imports are correct
3. Ensure development server is running

### Missing Query Metrics
1. Check if database functions are wrapped
2. Verify `withQueryMonitoring` usage
3. Check for TypeScript errors

### Inaccurate Timing
1. Check for overlapping API calls
2. Verify singleton pattern usage
3. Review parallel execution implementation

### High Overhead Values
1. Check for non-database operations
2. Review API route logic
3. Verify monitoring implementation

## Future Enhancements

### Planned Features
1. **Dashboard**: Web-based performance dashboard
2. **Alerting**: Automated alerts for performance issues
3. **Historical Data**: Performance trend analysis
4. **Query Analysis**: Detailed query execution plans
5. **Resource Monitoring**: Memory and CPU usage tracking

### Integration Opportunities
1. **APM Tools**: Integration with external monitoring tools
2. **Logging**: Structured logging for analysis
3. **Metrics**: Prometheus/Grafana integration
4. **Profiling**: Detailed performance profiling

## Related Documentation

- **[Database Setup](db.md)** - Database configuration and optimization
- **[Helper Functions](helper-functions.md)** - Utility functions and patterns
- **[DRY Improvements](dry-improvements.md)** - Code optimization patterns
- **[Edit Lock System](edit-lock-system.md)** - Multi-user editing prevention

## Implementation Status

### Completed API Endpoints
The following API endpoints have been successfully updated with performance monitoring:

#### Blocks API (`/api/blocks*`)
- ✅ `GET /api/blocks` - Fetch all blocks with content
- ✅ `POST /api/blocks` - Create new block
- ✅ `GET /api/blocks/list` - Fetch block list
- ✅ `POST /api/blocks/copy` - Copy existing block
- ✅ `GET /api/blocks/[id]` - Fetch individual block
- ✅ `PUT /api/blocks/[id]` - Update block properties or content
- ✅ `DELETE /api/blocks/[id]` - Delete block
- ✅ `GET /api/blocks/[id]/lock` - Check block lock status
- ✅ `POST /api/blocks/[id]/lock` - Lock block
- ✅ `DELETE /api/blocks/[id]/lock` - Unlock block

#### Language API (uses blocks functions)
- ✅ `GET /api/languages` - Fetch all languages
- ✅ `GET /api/languages/default` - Fetch default language

### Database Functions
- ✅ Created `lib/db/blocks-monitored.ts` with all monitored database functions
- ✅ Used `withQueryMonitoring` HOF for functions without arguments
- ✅ Implemented manual monitoring for functions with arguments
- ✅ All database operations now tracked with performance metrics

### Performance Monitoring Features
- ✅ Real-time console logging of API endpoint performance
- ✅ Database query execution time tracking
- ✅ Query count and total query time analysis
- ✅ Overhead calculation (time not spent in queries)
- ✅ Configurable via `PERFORMANCE_LOG` environment variable
- ✅ DRY implementation with minimal code changes
