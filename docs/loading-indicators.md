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

**Usage:** Added to the root layout (`app/layout.tsx`) to provide global loading feedback for operations like logout.

## Button Loading States

### Standard Button Loading Pattern

For buttons that perform async operations, use the `Loader2` icon from Lucide React with the `animate-spin` class. This is the preferred pattern throughout the codebase.

**Import:**
```tsx
import { Loader2 } from 'lucide-react';
```

**Standard Pattern:**
```tsx
<Button onClick={handleSave} disabled={isSaving}>
  {isSaving ? (
    <>
      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      Speichern...
    </>
  ) : (
    <>
      <Save className="h-4 w-4 mr-2" />
      Speichern
    </>
  )}
</Button>
```

**Key Points:**
- Use `Loader2` icon with `animate-spin` class
- Standard size: `h-4 w-4` (16px)
- Standard spacing: `mr-2` (8px margin-right)
- Disable button during loading: `disabled={isSaving}`
- Show loading text: "Speichern..." (or appropriate action)

**Examples from the codebase:**
- `QuoteDetail` - Variant creation button
- `EditLockButton` - Save button
- `ArticleDetail` - Loading states
- `BlockDetail` - Loading states
- `RoleDetail` - Save button

### ❌ Avoid Using LoadingIndicator in Buttons

Don't use the `LoadingIndicator` component inside buttons as it's designed for larger content areas:

```tsx
// ❌ Don't do this
<Button disabled={isSaving}>
  {isSaving ? (
    <>
      <LoadingIndicator className="h-4 w-4 mr-2" />
      Speichern...
    </>
  ) : (
    'Speichern'
  )}
</Button>
```

### ✅ Use Loader2 Icon Instead

```tsx
// ✅ Do this
<Button disabled={isSaving}>
  {isSaving ? (
    <>
      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      Speichern...
    </>
  ) : (
    <>
      <Save className="h-4 w-4 mr-2" />
      Speichern
    </>
  )}
</Button>
```

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
import { Loader2 } from 'lucide-react';

<Button disabled={loading}>
  {loading ? (
    <>
      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      Loading...
    </>
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

5. **Button loading states:**
   - Use `Loader2` icon with `animate-spin` class
   - Standard size: `h-4 w-4`
   - Standard spacing: `mr-2`
   - Always disable button during loading
   - Show descriptive loading text

## Components Using LoadingIndicator

- `ManagementWrapper` - Centered loading for management pages
- `GlobalLoadingIndicator` - Fullscreen loading overlay
- `TopNavigation` - Logout loading state with sitewide indicator
- `MobileNavigation` - Logout loading state with sitewide indicator

## Components Using Loader2 for Button Loading

- `QuoteDetail` - Variant creation button
- `EditLockButton` - Save button
- `ArticleDetail` - Loading states
- `BlockDetail` - Loading states
- `RoleDetail` - Save button
- `SalesOpportunityDetail` - Save button
- `PermissionDetail` - Save button
- `UserDetail` - Save button

## Logout Loading Implementation

The logout functionality in both `TopNavigation` and `MobileNavigation` components uses the sitewide loading indicator:

```tsx
const handleLogout = async () => {
  try {
    setLoading('logout', true);
    await signOut();
    // The signOut function will redirect to '/' automatically
  } catch (error) {
    console.error('Logout failed:', error);
    // Fallback to manual redirect if signOut fails
    router.push('/');
  } finally {
    setLoading('logout', false);
  }
};

const isLoggingOut = isLoading('logout');
```

The logout button shows "Abmelden..." when loading and is disabled during the logout process. The `GlobalLoadingIndicator` provides a fullscreen overlay during logout operations.

## Future Improvements

- Add support for custom spinner icons
- Add progress indicators for long-running operations
- Add skeleton loading states for content
- Add loading animations for better UX 