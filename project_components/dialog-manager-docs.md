# Dialog Manager System

The Dialog Manager is a solution for complex dialog workflows in React applications, where the user can navigate through a series of dialogs, including the ability to return to previous dialogs.

## Main Features

- **Dialog History:** Tracks the path through different dialogs
- **Back Functionality:** Allows users to return to previous dialogs
- **Data Transfer:** Supports passing data between dialogs
- **Flexible Dialog Flow:** Enables conditional branching in the dialog flow

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

A wrapper component for dialogs that automatically implements back and close functionality.

```tsx
<ManagedDialog 
  title="Dialog Title" 
  showBackButton 
  showCloseButton
>
  Dialog Content
</ManagedDialog>
```

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

## Best Practices

1. **Define Dialog IDs as Constants**: Use constants for dialog IDs to avoid typos.

2. **Pass Data Between Dialogs**: Use the `props` option when opening a dialog to pass data.

3. **Conditional Dialogs**: Implement conditional logic to open different dialogs based on user actions.

4. **Separate Dialog Components**: Create separate components for each dialog to keep code organized.

5. **Use TypeScript Types**: Define types for each dialog's properties to ensure type safety.

## Example for Dialog Migration

When migrating existing dialogs to the Dialog Manager system, follow these steps:

1. **Add DialogManagerProvider**: Wrap your component with the provider
2. **Create Dialog Components**: Create a separate component for each dialog
3. **Configure Dialog Renderer**: Set up the dialog IDs and components
4. **Remove State Variables**: Replace individual dialog state variables with the Dialog Manager
5. **Adjust Handlers**: Update event handlers to use the Dialog Manager methods 