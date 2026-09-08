import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface FaviconImageProps {
  /**
   * The icon to display (should be a Lucide icon or similar)
   */
  icon: ReactNode;
  /**
   * Gradient classes for the background (e.g., "from-blue-500 to-cyan-500")
   */
  gradient: string;
  /**
   * Size in pixels (will be rendered as a square)
   * @default 512
   */
  size?: number;
  /**
   * Border radius as percentage of size
   * @default 20
   */
  borderRadiusPercent?: number;
  /**
   * Icon size as percentage of container
   * @default 60
   */
  iconSizePercent?: number;
  /**
   * Additional className for the container
   */
  className?: string;
}
export const FaviconImage = ({
  icon,
  gradient,
  size = 512,
  borderRadiusPercent = 20,
  iconSizePercent = 60,
  className,
}: FaviconImageProps) => {
  const borderRadius = (size * borderRadiusPercent) / 100;
  const iconSize = (size * iconSizePercent) / 100;
  return (
    <div
      className={cn(
        "flex items-center justify-center bg-gradient-to-br",
        gradient,
        className
      )}
      style={{
        borderRadius,
        height: size,
        width: size,
      }}
    >
      <div
        className="text-white"
        style={{
          height: iconSize,
          width: iconSize,
        }}
      >
        {icon}
      </div>
    </div>
  );
};
