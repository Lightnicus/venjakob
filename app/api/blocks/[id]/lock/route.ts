import { createLockRoutes, LOCK_ROUTE_CONFIGS } from '@/lib/api/create-lock-routes';
import { blocks } from '@/lib/db/schema';

// Create lock routes using the generic factory
const lockRoutes = createLockRoutes({
  table: blocks,
  columns: {
        id: blocks.id,
        blocked: blocks.blocked,
        blockedBy: blocks.blockedBy,
  },
  ...LOCK_ROUTE_CONFIGS.blocks,
    });

// Export the standardized routes
export const { GET, POST, DELETE } = lockRoutes; 