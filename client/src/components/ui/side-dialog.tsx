import { ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";

const sideModalVariants = cva(
  "fixed z-2000 bg-white shadow-lg overflow-auto transition-transform duration-300 ease-in-out",
  {
    variants: {
      position: {
        right: "top-0 right-0 bottom-0 h-full border-l",
        left: "top-0 left-0 bottom-0 h-full border-r",
        top: "top-0 left-0 right-0 w-full border-b",
        bottom: "bottom-0 left-0 right-0 w-full border-t",
      },
      size: {
        sm: "max-w-md",
        md: "max-w-xl",
        lg: "max-w-2xl",
        xl: "max-w-4xl",
        full: "max-w-full",
      },
    },
    defaultVariants: {
      position: "right",
      size: "md",
    },
  }
);

export interface SideModalProps extends VariantProps<typeof sideModalVariants> {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: ReactNode;
  showCloseButton?: boolean;
  closeOnClickOutside?: boolean;
  className?: string;
  contentClassName?: string;
  headerClassName?: string;
  footerClassName?: string;
  footerContent?: ReactNode;
  showOverlay?: boolean;
  overlayClassName?: string;
}

export const SideModal = ({
  isOpen,
  onOpenChange,
  title,
  description,
  children,
  position = "right",
  size = "md",
  showCloseButton = true,
  closeOnClickOutside = true,
  className = "",
  contentClassName = "",
  headerClassName = "",
  footerClassName = "",
  footerContent,
  showOverlay = true,
  overlayClassName = "",
}: SideModalProps) => {
  const getTransformStyle = () => {
    switch (position) {
      case "right":
        return { transform: isOpen ? "translateX(0)" : "translateX(100%)" };
      case "left":
        return { transform: isOpen ? "translateX(0)" : "translateX(-100%)" };
      case "top":
        return { transform: isOpen ? "translateY(0)" : "translateY(-100%)" };
      case "bottom":
        return { transform: isOpen ? "translateY(0)" : "translateY(100%)" };
      default:
        return { transform: isOpen ? "translateX(0)" : "translateX(100%)" };
    }
  };

  // Determine close button position based on modal position
  const getCloseButtonPosition = () => {
    switch (position) {
      case "right":
        return "fixed left-0 top-1/2 -translate-y-1/2 translate-x-220";
      case "left":
        return "fixed right-0 top-1/2 -translate-y-1/2 translate-x-6";
      case "top":
        return "fixed bottom-0 left-1/2 -translate-x-1/2 translate-y-6";
      case "bottom":
        return "fixed top-0 left-1/2 -translate-x-1/2 -translate-y-6";
      default:
        return "fixed left-0 top-1/2 -translate-y-1/2 -translate-x-220";
    }
  };

  // Determine rotation angle based on modal position
  const getCloseButtonRotation = () => {
    switch (position) {
      case "right":
        return "-rotate-90";
      case "left":
        return "rotate-90";
      case "top":
        return "rotate-180";
      case "bottom":
        return "rotate-0";
      default:
        return "-rotate-90";
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {showOverlay && (
          <Dialog.Overlay
            className={`fixed inset-0 backdrop-blur-xs bg-black/50 transition-opacity duration-300 ease-in-out ${overlayClassName} ${
              isOpen ? "opacity-100" : "opacity-0"
            }`}
            style={{
              zIndex: 1010,
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
            }}
            onClick={() => closeOnClickOutside && onOpenChange(false)}
          />
        )}

        <Dialog.Content
          className={`${sideModalVariants({ position, size })} ${className}`}
          style={getTransformStyle()}
          onEscapeKeyDown={() => onOpenChange(false)}
          onInteractOutside={() => closeOnClickOutside && onOpenChange(false)}
        >
          {showCloseButton && (
            <Dialog.Close asChild>
              <div className="flex w-full p-2 sm:hidden">
                <X
                  className="-rotate-90 bg-white rounded-full p-2 shadow-md top-10 border shadow-slate-600 hover:bg-slate-100 transition-all duration-300 ease-in cursor-pointer"
                  size={35}
                />
              </div>
            </Dialog.Close>
          )}

          {title && (
            <div
              className={`flex justify-between items-center p-4 ${headerClassName}`}
            >
              <div>
                {title && (
                  <Dialog.Title className="text-lg font-semibold">
                    {title}
                  </Dialog.Title>
                )}
                {description && (
                  <Dialog.Description className="text-sm text-gray-500">
                    {description}
                  </Dialog.Description>
                )}
              </div>
            </div>
          )}

          <div className={`${contentClassName}`}>{children}</div>

          {footerContent && (
            <div className={`p-4 border-t ${footerClassName}`}>
              {footerContent}
            </div>
          )}
        </Dialog.Content>

        {showCloseButton && (
          <Dialog.Close asChild>
            <div className={`z-1030 ${getCloseButtonPosition()}`}>
              <img
                src="/Down 2.svg"
                className={`${getCloseButtonRotation()} bg-white p-2 w-12 h-12 rounded-full shadow-gray shadow-sm border hover:bg-slate-100 transition-all duration-300 ease-in cursor-pointer`}
              />
            </div>
          </Dialog.Close>
        )}
      </Dialog.Portal>
    </Dialog.Root>
  );
};
