import { createLockRoutes, LOCK_ROUTE_CONFIGS } from '@/lib/api/create-lock-routes';
import { articles } from '@/lib/db/schema';

// Create lock routes using the generic factory
const lockRoutes = createLockRoutes({
  table: articles,
  columns: {
        id: articles.id,
        blocked: articles.blocked,
        blockedBy: articles.blockedBy,
  },
  ...LOCK_ROUTE_CONFIGS.articles,
});

// Export the standardized routes
export const { GET, POST, DELETE } = lockRoutes;
