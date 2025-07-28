import { createLockRoutes, LOCK_ROUTE_CONFIGS } from '@/lib/api/create-lock-routes';
import { quoteVersions } from '@/lib/db/schema';

// Create lock routes using the generic factory
const lockRoutes = createLockRoutes({
  table: quoteVersions,
  columns: {
    id: quoteVersions.id,
    blocked: quoteVersions.blocked,
    blockedBy: quoteVersions.blockedBy,
  },
  ...LOCK_ROUTE_CONFIGS.quoteVersions,
});

// Export the standardized routes
export const { GET, POST, DELETE } = lockRoutes; 