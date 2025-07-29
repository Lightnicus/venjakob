# Loading Indicators

This document describes the loading indicator system used throughout the project.

## Overview

The project uses a centralized loading indicator system with a reusable `LoadingIndicator` component that provides consistent loading states across the application.

## Components

### LoadingIndicator

A reusable loading component that displays both a spinner and text.

**Location:** `project_components/loading-indicator.tsx`

**Props:**
- `text?: string` - Loading text (default: "Bitte warten...")
- `size?: 'sm' | 'md' | 'lg'` - Spinner size (default: "md")
- `variant?: 'inline' | 'centered' | 'fullscreen'` - Layout variant (default: "inline")
- `className?: string` - Additional CSS classes

**Variants:**
- `inline` - Horizontal layout with spinner and text side by side
- `centered` - Vertical layout centered in container
- `fullscreen` - Full screen overlay with backdrop blur

**Usage Examples:**

```tsx
// Basic usage
<LoadingIndicator />

// Custom text
<LoadingIndicator text="Daten werden geladen..." />

// Small inline loading
<LoadingIndicator text="" size="sm" variant="inline" />

// Centered loading for content areas
<LoadingIndicator text="Artikel wird geladen..." variant="centered" />

// Fullscreen loading overlay
<LoadingIndicator variant="fullscreen" />
```

### LoadingProvider

Global loading state management.

**Location:** `project_components/loading-provider.tsx`

**Usage:**
```tsx
const { setLoading, isLoading, isAnyLoading } = useLoading();

// Set loading state
setLoading('my-operation', true);

// Check if specific operation is loading
if (isLoading('my-operation')) {
  // Show loading state
}

// Check if any operation is loading
if (isAnyLoading()) {
  // Show global loading indicator
}
```

### GlobalLoadingIndicator

Global loading overlay that appears when any loading state is active.

**Location:** `project_components/global-loading-indicator.tsx`

Automatically shows when `isAnyLoading()` returns true.

## Migration Guide

### Before (Text-only loading)
```tsx
if (loading) {
  return <span>Daten werden geladen...</span>;
}
```

### After (With spinner)
```tsx
import { LoadingIndicator } from './loading-indicator';

if (loading) {
  return <LoadingIndicator text="Daten werden geladen..." variant="centered" />;
}
```

### Before (Inline loading in buttons)
```tsx
<Button disabled={loading}>
  {loading ? 'Loading...' : 'Submit'}
</Button>
```

### After (With spinner in buttons)
```tsx
<Button disabled={loading}>
  {loading ? (
    <div className="flex items-center gap-2">
      <LoadingIndicator text="" size="sm" variant="inline" />
      <span>Loading...</span>
    </div>
  ) : (
    'Submit'
  )}
</Button>
```

**Note:** This pattern is useful for buttons that perform async operations and need to show loading state inline.

## Best Practices

1. **Use appropriate variants:**
   - `inline` for buttons and small UI elements
   - `centered` for content areas and dialogs
   - `fullscreen` for global operations

2. **Provide meaningful text:**
   - Use German text for user-facing loading states
   - Be specific about what is being loaded
   - Keep text concise

3. **Consistent sizing:**
   - `sm` for buttons and small elements
   - `md` for standard content areas
   - `lg` for prominent loading states

4. **Accessibility:**
   - The component includes proper ARIA attributes
   - Screen readers will announce the loading text
   - Use semantic HTML structure

## Components Using LoadingIndicator

- `ManagementWrapper` - Centered loading for management pages
- `GlobalLoadingIndicator` - Fullscreen loading overlay

## Future Improvements

- Add support for custom spinner icons
- Add progress indicators for long-running operations
- Add skeleton loading states for content
- Add loading animations for better UX 