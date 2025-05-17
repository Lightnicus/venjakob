import { createContext, useContext, useState, ReactNode, FC } from "react";

type DialogId = string;

interface DialogState {
  id: DialogId;
  props?: Record<string, any>;
}

interface DialogContextType {
  currentDialog: DialogState | null;
  dialogHistory: DialogState[];
  openDialog: (id: DialogId, props?: Record<string, any>) => void;
  closeDialog: () => void;
  goBack: () => void;
  replaceDialog: (id: DialogId, props?: Record<string, any>) => void;
}

const DialogContext = createContext<DialogContextType | null>(null);

export const useDialogManager = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("useDialogManager muss innerhalb eines DialogManagerProvider verwendet werden");
  }
  return context;
};

interface DialogManagerProviderProps {
  children: ReactNode;
}

export const DialogManagerProvider: FC<DialogManagerProviderProps> = ({ children }) => {
  const [dialogHistory, setDialogHistory] = useState<DialogState[]>([]);

  const openDialog = (id: DialogId, props?: Record<string, any>) => {
    setDialogHistory((prev) => [...prev, { id, props }]);
  };

  const closeDialog = () => {
    setDialogHistory((prev) => prev.slice(0, -1));
  };

  const goBack = () => {
    if (dialogHistory.length > 1) {
      setDialogHistory((prev) => prev.slice(0, -1));
    }
  };

  const replaceDialog = (id: DialogId, props?: Record<string, any>) => {
    setDialogHistory((prev) => [...prev.slice(0, -1), { id, props }]);
  };

  const currentDialog = dialogHistory.length > 0 ? dialogHistory[dialogHistory.length - 1] : null;

  return (
    <DialogContext.Provider
      value={{
        currentDialog,
        dialogHistory,
        openDialog,
        closeDialog,
        goBack,
        replaceDialog,
      }}
    >
      {children}
    </DialogContext.Provider>
  );
};

interface DialogComponentProps {
  id: DialogId;
  component: FC<any>;
}

interface DialogRendererProps {
  dialogs: DialogComponentProps[];
}

export const DialogRenderer: FC<DialogRendererProps> = ({ dialogs }) => {
  const { currentDialog } = useDialogManager();

  if (!currentDialog) return null;

  const dialogConfig = dialogs.find((dialog) => dialog.id === currentDialog.id);
  if (!dialogConfig) return null;

  const DialogComponent = dialogConfig.component;
  return <DialogComponent {...currentDialog.props} />;
}; 