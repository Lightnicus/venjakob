# Dialog Manager System

The Dialog Manager is a comprehensive solution for complex dialog workflows in React applications, supporting both traditional dialog flows and advanced data-driven smart routing patterns.

## Main Features

- **Dialog History:** Tracks the path through different dialogs
- **Smart Back Functionality:** Automatically detects entry points and manages back button visibility
- **Data Transfer:** Supports passing data between dialogs
- **Data-Driven Routing:** Conditional dialog flows based on real-time data availability
- **Smart Entry Points:** Intelligent routing that skips irrelevant dialogs based on data state
- **Global Loading Integration:** Seamless integration with application-wide loading states
- **Context-Aware Dialogs:** Dialogs adapt their behavior based on user selections and available data

## Components

### DialogManagerProvider

Provides the context for dialog management and should wrap the entire application or the area where dialogs are used.

```tsx
<DialogManagerProvider>
  <YourApp />
</DialogManagerProvider>
```

### useDialogManager Hook

Provides access to dialog management functions.

```tsx
const { 
  openDialog,
  closeDialog,
  goBack,
  replaceDialog,
  currentDialog,
  dialogHistory 
} = useDialogManager();
```

#### Available Functions:

- `openDialog(id, props)`: Opens a new dialog and adds it to the history
- `closeDialog()`: Closes the current dialog
- `goBack()`: Navigates to the previous dialog in the history
- `replaceDialog(id, props)`: Replaces the current dialog with a new one

### DialogRenderer

Renders the current dialog based on the configuration.

```tsx
const dialogComponents = [
  {
    id: "dialog-id",
    component: YourDialogComponent
  }
];

<DialogRenderer dialogs={dialogComponents} />
```

### ManagedDialog

A wrapper component for dialogs that automatically implements back and close functionality with smart entry point detection.

```tsx
<ManagedDialog 
  title="Dialog Title" 
  showBackButton={true}  // Automatically hidden if entry point detected
  showCloseButton={true}
>
  Dialog Content
</ManagedDialog>
```

#### Smart Back Button Logic

The `ManagedDialog` automatically detects entry points and manages back button visibility:

- **Entry Point Detection**: Dialogs with `dialogHistory.length <= 1` are considered entry points
- **Auto-Hide Back Button**: Entry point dialogs never show back buttons, preventing "nowhere to go back to" UX
- **No Props Required**: The detection is automatic based on dialog history state

## Usage Example

```tsx
// Define dialog IDs
const DIALOGS = {
  FIRST_DIALOG: "first-dialog",
  SECOND_DIALOG: "second-dialog",
};

// Dialog component
const FirstDialog = () => {
  const { openDialog } = useDialogManager();
  
  return (
    <ManagedDialog title="First Dialog">
      <p>Dialog content</p>
      <Button onClick={() => openDialog(DIALOGS.SECOND_DIALOG, { data: "Example data" })}>
        Next
      </Button>
    </ManagedDialog>
  );
};

// Dialog component with received data
const SecondDialog = ({ data }) => {
  return (
    <ManagedDialog title="Second Dialog" showBackButton>
      <p>Received data: {data}</p>
    </ManagedDialog>
  );
};

// Dialog configuration
const dialogComponents = [
  { id: DIALOGS.FIRST_DIALOG, component: FirstDialog },
  { id: DIALOGS.SECOND_DIALOG, component: SecondDialog },
];

// Main component
const App = () => {
  const { openDialog } = useDialogManager();
  
  return (
    <div>
      <Button onClick={() => openDialog(DIALOGS.FIRST_DIALOG)}>
        Start Dialog Flow
      </Button>
      <DialogRenderer dialogs={dialogComponents} />
    </div>
  );
};

// Wrapper with provider
export const AppWithDialogs = () => (
  <DialogManagerProvider>
    <App />
  </DialogManagerProvider>
);
```

## Advanced Patterns: Data-Driven Dialog Flows

### Smart Entry Point Pattern

For complex workflows where the starting dialog depends on available data, implement a smart entry component:

```tsx
// Smart Entry Point Component
const SmartEntryDialogComponent: FC = () => {
  const { replaceDialog } = useDialogManager();
  const { setLoading } = useLoading();

  useEffect(() => {
    const checkDataAndRoute = async () => {
      try {
        setLoading('smart-routing', true);
        
        // Check data availability
        const [quotesData, salesOppsData] = await Promise.all([
          fetchQuotes().catch(() => []),
          fetchSalesOpportunities().catch(() => []),
        ]);

        const hasExistingQuotes = quotesData.length > 0;
        const hasSalesOpportunities = salesOppsData.length > 0;

        // Route based on data availability
        if (!hasSalesOpportunities) {
          toast.error('No sales opportunities available. Please create one first.');
          return;
        }

        if (!hasExistingQuotes) {
          replaceDialog(DIALOGS.CHOOSE_OPPORTUNITY); // Skip copy question
          return;
        }

        replaceDialog(DIALOGS.COPY_OR_NEW); // Show all options
      } catch (error) {
        toast.error('Error checking data availability');
      } finally {
        setLoading('smart-routing', false);
      }
    };

    checkDataAndRoute();
  }, []);

  return null; // This component just routes, doesn't render
};
```

### Context-Aware Dialogs

Dialogs that adapt their behavior based on user selections and available data:

```tsx
const ChooseOpportunityDialog: FC<{ dialogData?: any }> = ({ dialogData }) => {
  const { openDialog } = useDialogManager();

  const handleSelect = (selectedOpportunity: Opportunity) => {
    const hasExistingQuotes = selectedOpportunity.quotesCount > 0;
    
    if (!hasExistingQuotes) {
      // Skip variant question for opportunities with no quotes
      openDialog(DIALOGS.LANGUAGE_SELECTION, { 
        selectedOpportunity,
        skipVariantQuestion: true 
      });
    } else {
      // Show variant options for opportunities with existing quotes
      openDialog(DIALOGS.VARIANT_OR_VERSION, { 
        selectedOpportunity,
        hasExistingQuotes: true 
      });
    }
  };

  return (
    <ManagedDialog title="Choose Sales Opportunity" showBackButton={true}>
      <OpportunityList onSelect={handleSelect} />
    </ManagedDialog>
  );
};
```

### Data-Driven Dialog Configuration

Configure dialog flows that adapt to data availability:

```tsx
const QUOTE_DIALOGS = {
  SMART_ENTRY: 'smart-entry',
  COPY_OR_NEW: 'copy-or-new',
  CHOOSE_OPPORTUNITY: 'choose-opportunity',
  VARIANT_OR_VERSION: 'variant-or-version',
  LANGUAGE_SELECTION: 'language-selection',
};

const createDialogComponents = () => [
  { 
    id: QUOTE_DIALOGS.SMART_ENTRY, 
    component: SmartEntryDialogComponent 
  },
  { 
    id: QUOTE_DIALOGS.COPY_OR_NEW, 
    component: (props: any) => <CopyOrNewDialog dialogData={props} />
  },
  { 
    id: QUOTE_DIALOGS.CHOOSE_OPPORTUNITY, 
    component: (props: any) => <ChooseOpportunityDialog dialogData={props} />
  },
  // ... other dialogs
];
```

## Best Practices

### Basic Dialog Management

1. **Define Dialog IDs as Constants**: Use constants for dialog IDs to avoid typos.

2. **Pass Data Between Dialogs**: Use the `props` option when opening a dialog to pass data.

3. **Separate Dialog Components**: Create separate components for each dialog to keep code organized.

4. **Use TypeScript Types**: Define types for each dialog's properties to ensure type safety.

### Advanced Data-Driven Patterns

5. **Smart Entry Points**: Use smart entry components for complex workflows that depend on data availability.

6. **Context-Aware Routing**: Make dialogs adaptive by checking data related to user selections.

7. **Use `replaceDialog` for Routing**: When implementing smart entry points, use `replaceDialog` to avoid polluting dialog history.

8. **Global Loading Integration**: Use the application's loading system (`useLoading`) for data-checking operations.

9. **Fail Gracefully**: Always provide clear error messages and fallback paths when data is unavailable.

10. **Single Responsibility**: Keep smart entry components focused on routing logic - they should not render UI.

### Performance Considerations

11. **Empty Dependencies**: Use empty dependency arrays `[]` in `useEffect` for one-time routing operations.

12. **Parallel Data Fetching**: Use `Promise.all()` to fetch multiple data sources simultaneously.

13. **Error Boundaries**: Wrap complex dialog flows in error boundaries to prevent crashes.

### UX Guidelines

14. **Skip Irrelevant Steps**: Automatically skip dialogs that don't apply to the user's current context.

15. **Contextual Headers**: Adapt dialog titles and content based on user selections.

16. **Consistent Loading States**: Use the global loading system to maintain consistent UX across flows.

## Migration Guide

### Basic Dialog Migration

When migrating existing dialogs to the Dialog Manager system, follow these steps:

1. **Add DialogManagerProvider**: Wrap your component with the provider
2. **Create Dialog Components**: Create a separate component for each dialog
3. **Configure Dialog Renderer**: Set up the dialog IDs and components
4. **Remove State Variables**: Replace individual dialog state variables with the Dialog Manager
5. **Adjust Handlers**: Update event handlers to use the Dialog Manager methods

### Upgrading to Smart Data-Driven Flows

To enhance existing dialog flows with smart data-driven patterns:

1. **Identify Data Dependencies**: Analyze which dialogs depend on specific data availability
2. **Create Smart Entry Point**: Implement a smart entry component that checks data and routes accordingly
3. **Add Context Awareness**: Update dialog components to accept and use `dialogData` props
4. **Implement Conditional Routing**: Add logic to skip irrelevant dialogs based on user selections
5. **Integrate Global Loading**: Replace custom loading states with the application's loading system
6. **Test All Paths**: Ensure all possible data states and user paths work correctly

### Migration Example: Simple to Smart Flow

**Before (Static Flow):**
```tsx
const handleCreateQuote = () => {
  openDialog('copy-or-new-dialog');
};
```

**After (Smart Flow):**
```tsx
const handleCreateQuote = () => {
  openDialog('smart-entry'); // Routes based on available data
};
```

The smart entry component automatically:
- Checks for existing quotes and sales opportunities
- Skips irrelevant dialogs
- Routes to the most appropriate starting point
- Provides loading feedback and error handling 