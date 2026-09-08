import { cva } from "class-variance-authority";

export const advancedSelectVariants = cva("m-1", {
  defaultVariants: {
    variant: "default",
  },
  variants: {
    variant: {
      default: "border-foreground/10 text-foreground bg-card hover:bg-card/80",
      destructive:
        "bg-destructive text-destructive-foreground hover:bg-destructive/80 border-transparent",
      inverted: "inverted",
      secondary:
        "border-foreground/10 bg-secondary text-secondary-foreground hover:bg-secondary/80",
    },
  },
});

export const badgeAnimationVariants = {
  animate: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.15 } },
  initial: { opacity: 0, scale: 0.8 },
};

export const contentAnimationVariants = {
  hidden: { opacity: 0, y: -5 },
  visible: { opacity: 1, transition: { duration: 0.2 }, y: 0 },
};

export const optionAnimationVariants = {
  hidden: { opacity: 0 },
  visible: (custom: number) => ({
    opacity: 1,
    transition: { delay: custom * 0.03 },
  }),
};
