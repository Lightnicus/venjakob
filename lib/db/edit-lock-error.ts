/**
 * Common error type for edit lock conflicts across all lockable resources
 */
export class EditLockError extends Error {
  constructor(
    message: string,
    public readonly resourceId: string,
    public readonly lockedBy: string | null = null,
    public readonly lockedAt: string | null = null
  ) {
    super(message);
    this.name = 'EditLockError';
  }
} 