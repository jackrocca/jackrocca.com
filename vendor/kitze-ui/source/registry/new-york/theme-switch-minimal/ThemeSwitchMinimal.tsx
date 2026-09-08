"use client";

import { LucideSun, LucideMoon, LucideComputer } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import type { ReactFC } from "@/lib/types";
import { cn } from "@/lib/utils";
import type { CustomButtonProps } from "@/registry/new-york/custom-button/CustomButton";
import { CustomButton } from "@/registry/new-york/custom-button/CustomButton";

export interface ThemeSwitchMinimalClassNames {
  button?: string | undefined;
  icon?: string | undefined;
}
export interface ThemeSwitchMinimalProps extends Omit<
  CustomButtonProps,
  "classNames"
> {
  classNames?: ThemeSwitchMinimalClassNames | undefined;
  buttonProps?: Partial<CustomButtonProps> | undefined;
  theme: string;
  setTheme: (theme: string) => void;
}
export const ThemeSwitchMinimal: ReactFC<ThemeSwitchMinimalProps> = ({
  className,
  classNames,
  buttonProps,
  theme,
  setTheme,
  ...rest
}) => {
  const isDark = theme === "dark";
  const isSystem = theme === "system";
  const getIcon = () => {
    if (isDark) {
      return "dark";
    }
    if (isSystem) {
      return "system";
    }
    return "light";
  };
  return (
    <CustomButton
      className={cn("relative h-9 w-9 p-0", className, classNames?.button)}
      onClick={() => {
        if (isDark) {
          setTheme("light");
        } else {
          setTheme(isSystem ? "dark" : "system");
        }
      }}
      {...buttonProps}
      {...rest}
    >
      <AnimatePresence mode="wait">
        {(() => {
          switch (getIcon()) {
            case "dark": {
              return (
                <motion.div
                  key="moon"
                  initial={{
                    opacity: 0,
                    rotate: -30,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    rotate: 0,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    rotate: 30,
                    y: -10,
                  }}
                  transition={{
                    duration: 0.2,
                  }}
                >
                  <LucideMoon className={cn("size-4", classNames?.icon)} />
                </motion.div>
              );
            }
            case "system": {
              return (
                <motion.div
                  key="system"
                  initial={{
                    opacity: 0,
                    scale: 0.5,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 1.5,
                  }}
                  transition={{
                    duration: 0.2,
                  }}
                >
                  <LucideComputer className={cn("size-4", classNames?.icon)} />
                </motion.div>
              );
            }
            default: {
              return (
                <motion.div
                  key="sun"
                  initial={{
                    opacity: 0,
                    rotate: -30,
                    y: -10,
                  }}
                  animate={{
                    opacity: 1,
                    rotate: 0,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    rotate: 30,
                    y: 10,
                  }}
                  transition={{
                    duration: 0.2,
                  }}
                >
                  <LucideSun className={cn("size-4", classNames?.icon)} />
                </motion.div>
              );
            }
          }
        })()}
      </AnimatePresence>
    </CustomButton>
  );
};
