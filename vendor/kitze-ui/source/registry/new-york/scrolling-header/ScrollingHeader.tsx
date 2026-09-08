"use client";

import { motion, AnimatePresence, useScroll } from "motion/react";
import type { ReactNode } from "react";
import { useState, useEffect } from "react";

import { cn } from "@/lib/utils";

export interface ScrollingHeaderProps {
  /** Logo element (image or icon) */
  logo: ReactNode;
  /** Product/app title */
  title: string;
  /** Scroll threshold in pixels before header appears */
  scrollThreshold?: number;
  /** Right side content (typically a buy button) */
  children?: ReactNode;
  /** Additional className for the container */
  className?: string;
  /** Additional className for the inner wrapper */
  innerClassName?: string;
  /** Hide title on mobile */
  hideTitleOnMobile?: boolean;
}

export const ScrollingHeader = ({
  logo,
  title,
  scrollThreshold = 500,
  children,
  className,
  innerClassName,
  hideTitleOnMobile = true,
}: ScrollingHeaderProps) => {
  const { scrollY } = useScroll();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(
    () =>
      scrollY.onChange((latest) => {
        setIsVisible(latest > scrollThreshold);
      }),
    [scrollY, scrollThreshold]
  );

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          transition={{ duration: 0.3 }}
          className={cn(
            "pointer-events-none fixed top-0 right-0 left-0 z-50 flex justify-center p-4",
            className
          )}
        >
          <div
            className={cn(
              "pointer-events-auto flex w-full max-w-lg items-center justify-between gap-4 rounded-full border border-white/10 bg-black/50 px-4 py-2 shadow-2xl backdrop-blur-xl md:max-w-2xl",
              innerClassName
            )}
          >
            <div className="flex items-center gap-3">
              {logo}
              <span
                className={cn(
                  "font-semibold text-white",
                  hideTitleOnMobile && "hidden sm:block"
                )}
              >
                {title}
              </span>
            </div>

            {children && (
              <div className="flex items-center gap-3">{children}</div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
