import { FC, ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDialogManager } from "./quote_dialogs/dialog-manager";

interface ManagedDialogProps {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  showBackButton?: boolean;
  onBack?: () => void;
  showCloseButton?: boolean;
  onCloseButtonClick?: () => void;
  className?: string;
}

export const ManagedDialog: FC<ManagedDialogProps> = ({
  title,
  children,
  footer,
  showBackButton = false,
  onBack,
  showCloseButton = true,
  onCloseButtonClick,
  className,
}) => {
  const { currentDialog, closeDialog, goBack, dialogHistory } = useDialogManager();
  
  const isOpen = !!currentDialog;
  
  // Auto-detect if this is an entry point (first dialog in history)
  const isEntryPoint = dialogHistory.length <= 1;
  const shouldShowBackButton = showBackButton && !isEntryPoint;

  const handleOpenChange = (open: boolean) => {
    if (!open) closeDialog();
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      goBack();
    }
  };

  const handleClose = () => {
    if (onCloseButtonClick) {
      onCloseButtonClick();
    } else {
      closeDialog();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className={className}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="py-4">{children}</div>
        {(footer || shouldShowBackButton || showCloseButton) && (
          <DialogFooter className="flex items-center justify-end gap-2">
            {shouldShowBackButton && (
              <Button variant="outline" onClick={handleBack}>
                Zurück
              </Button>
            )}
            {showCloseButton && (
              <Button variant="outline" onClick={handleClose}>
                Schließen
              </Button>
            )}
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}; 