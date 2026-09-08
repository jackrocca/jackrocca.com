"use client";

import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";
import { CustomButton } from "@/registry/new-york/custom-button/CustomButton";
import { socialLoginProviders } from "@/registry/new-york/social-login-button/social-login-providers";
import type * as ProviderTypes from "@/registry/new-york/social-login-button/social-login-providers";

export type SocialLoginProvider = ProviderTypes.SocialLoginProvider;

export interface SocialLoginButtonProps extends Omit<
  ComponentProps<"button">,
  "children"
> {
  provider: SocialLoginProvider;
  /** Defaults to “Continue with {provider}”. */
  label?: string;
  variant?: "outline" | "brand";
  size?: "sm" | "md" | "lg";
  iconOnly?: boolean;
  loading?: boolean;
}

const sizes = {
  lg: "h-12 px-5 text-base",
  md: "h-11 px-4 text-sm",
  sm: "h-9 px-3 text-sm",
};
const iconSizes = { lg: "w-12", md: "w-11", sm: "w-9" };

export const SocialLoginButton = ({
  provider,
  label,
  variant = "outline",
  size = "md",
  iconOnly = false,
  loading = false,
  disabled,
  className,
  ...props
}: SocialLoginButtonProps) => {
  const { icon: Icon, name, brandClassName } = socialLoginProviders[provider];
  const text = label ?? `Continue with ${name}`;

  return (
    <CustomButton
      type="button"
      {...props}
      variant="unstyled"
      size={size}
      loading={loading}
      icon={iconOnly ? Icon : undefined}
      leftIcon={iconOnly ? undefined : Icon}
      iconSize={20}
      aria-label={props["aria-label"] ?? (iconOnly ? text : undefined)}
      data-slot="social-login-button"
      data-provider={provider}
      aria-busy={loading || undefined}
      disabled={disabled}
      className={cn(
        "focus-visible:ring-ring focus-visible:ring-offset-background min-w-0 gap-3 rounded-lg border leading-none shadow-none transition-[background-color,color,border-color,transform] duration-150 focus-visible:ring-2 focus-visible:ring-offset-2 enabled:active:scale-[0.98] disabled:pointer-events-auto disabled:cursor-not-allowed motion-reduce:transform-none motion-reduce:transition-none [&_svg]:size-5 motion-reduce:[&_svg]:animate-none",
        sizes[size],
        variant === "outline"
          ? "border-input bg-background text-foreground enabled:hover:bg-accent"
          : brandClassName,
        iconOnly &&
          cn(
            iconSizes[size],
            "max-h-none min-h-0 max-w-none min-w-0 shrink-0 px-0"
          ),
        className
      )}
    >
      {iconOnly ? undefined : text}
    </CustomButton>
  );
};
