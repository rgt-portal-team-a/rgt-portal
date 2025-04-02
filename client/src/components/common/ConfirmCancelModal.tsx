import { ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader } from "lucide-react";

export interface ModalProps {
isOpen: boolean;
onOpenChange: (open: boolean) => void;
title?: string;
children?: ReactNode;
onSubmit: () => void;
onCancel: () => void;
submitText?: string;
cancelText?: string;
submitVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
cancelVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
className?: string;
contentClassName?: string;
closeOnClickOutside?: boolean;
showOverlay?: boolean;
overlayClassName?: string;
isSubmitting?: boolean;
}

export const ConfirmCancelModal = ({
  isOpen,
  onOpenChange,
  title,
  children,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitText = "Proceed",
  cancelText = "Cancel",
  submitVariant = "default",
  cancelVariant = "outline",
  className = "",
  contentClassName = "",
  closeOnClickOutside = true,
  showOverlay = true,
  overlayClassName = "",
}: ModalProps) => {
  const handleCancel = () => {
    if (!isSubmitting) {
      onCancel();
      onOpenChange(false);
    }
  };

  const handleSubmit = () => {
    if (!isSubmitting) {
      onSubmit();
    }
  };

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!isSubmitting) {
          onOpenChange(open);
        }
      }}
    >
      <Dialog.Portal>
        {showOverlay && (
          <Dialog.Overlay
            className={cn(
              "fixed inset-0 backdrop-blur-sm bg-black/30 z-1999 transition-opacity duration-300 ease-in-out",
              overlayClassName,
              isOpen ? "opacity-100" : "opacity-0"
            )}
            onClick={() =>
              !isSubmitting && closeOnClickOutside && onOpenChange(false)
            }
          />
        )}

        <Dialog.Content
          className={cn(
            "fixed z-2000 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white max-h-[90vh] overflow-y-auto w-full max-w-md rounded-lg shadow-lg p-6",
            className
          )}
          onEscapeKeyDown={() => !isSubmitting && onOpenChange(false)}
          onInteractOutside={(_e) =>
            !isSubmitting && closeOnClickOutside && onOpenChange(false)
          }
        >
          {title && (
            <Dialog.Title className="text-lg font-semibold text-gray-900 mb-4">
              {title}
            </Dialog.Title>
          )}

          <div className={cn("py-2", contentClassName)}>{children}</div>

          <div className="flex justify-between mt-4 w-full space-x-4">
            <Button
              variant={cancelVariant}
              onClick={handleCancel}
              disabled={isSubmitting}
              className="w-1/2 text-red-500 border-gray-200 py-[10px] px-[18px]"
            >
              {cancelText}
            </Button>
            <Button
              variant={submitVariant}
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-1/2 bg-green-100 text-green-600 hover:bg-green-200 py-[10px] px-[18px]"
            >
              {isSubmitting ? <Loader className="animate-spin"/> :submitText}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};


export default ConfirmCancelModal;