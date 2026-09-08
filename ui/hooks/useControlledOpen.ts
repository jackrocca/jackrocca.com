import { useState } from "react";

interface UseControlledOpenProps {
  open?: boolean | undefined;
  onOpenChange?: ((open: boolean) => void) | undefined;
}

interface UseControlledOpenResult {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  close: () => void;
}

export const useControlledOpen = ({
  open,
  onOpenChange,
}: UseControlledOpenProps): UseControlledOpenResult => {
  const [internalOpen, setInternalOpen] = useState(false);

  // Determine if the component is controlled or uncontrolled
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const setIsOpen = (newOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(newOpen);
    }
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
  };

  const close = () => setIsOpen(false);

  return { close, isOpen, setIsOpen };
};
