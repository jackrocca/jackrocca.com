import { useCallback, useState } from "react";

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
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setIsOpen = useCallback(
    (newOpen: boolean) => {
      if (!isControlled) {
        setInternalOpen(newOpen);
      }
      onOpenChange?.(newOpen);
    },
    [isControlled, onOpenChange],
  );
  const close = useCallback(() => setIsOpen(false), [setIsOpen]);

  return { close, isOpen, setIsOpen };
};
