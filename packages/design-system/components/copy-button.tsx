"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { useCopyToClipboard } from "@repo/design-system/hooks/use-copy-to-clipboard";
import type { CopyState } from "@repo/design-system/hooks/use-copy-to-clipboard";
import { CheckIcon, CircleXIcon, CopyIcon } from "lucide-react";
import type { HTMLMotionProps, Variants } from "motion/react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback } from "react";
import type { MouseEvent, ComponentProps, ReactNode } from "react";

export const motionIconVariants: Variants = {
  animate: { filter: "blur(0px)", opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
  initial: { filter: "blur(2px)", opacity: 0, scale: 0.8 },
};

export const motionIconProps: HTMLMotionProps<"span"> = {
  animate: "animate",
  exit: "exit",
  initial: "initial",
  transition: { duration: 0.15, ease: "easeOut" },
  variants: motionIconVariants,
};

export interface CopyStateIconProps {
  state: CopyState;
  /**
   * Custom icon for idle state.
   * @default CopyIcon
   * */
  idleIcon?: ReactNode;
  /**
   * Custom icon for done state.
   * @default CheckIcon
   * */
  doneIcon?: ReactNode;
  /**
   * Custom icon for error state.
   * @default CircleXIcon
   * */
  errorIcon?: ReactNode;
}

export const CopyStateIcon = ({
  state,
  idleIcon,
  doneIcon,
  errorIcon,
}: CopyStateIconProps) => {
  let content: ReactNode = null;
  if (state === "idle") {
    content = (
      <motion.span key="idle" {...motionIconProps}>
        {idleIcon ?? <CopyIcon />}
      </motion.span>
    );
  } else if (state === "done") {
    content = (
      <motion.span key="done" {...motionIconProps}>
        {doneIcon ?? <CheckIcon strokeWidth={3} />}
      </motion.span>
    );
  } else if (state === "error") {
    content = (
      <motion.span key="error" {...motionIconProps}>
        {errorIcon ?? <CircleXIcon />}
      </motion.span>
    );
  }

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      {content}
    </AnimatePresence>
  );
};

export type CopyButtonProps = ComponentProps<typeof Button> & {
  /** The text to copy, or a function that returns the text. */
  text: string | (() => string);
  /** Called with the copied text on successful copy. */
  onCopySuccess?: (text: string) => void;
  /** Called with the error if the copy operation fails. */
  onCopyError?: (error: Error) => void;
} & Pick<CopyStateIconProps, "idleIcon" | "doneIcon" | "errorIcon">;

export const CopyButton = ({
  size = "icon",
  children,
  text,
  idleIcon,
  doneIcon,
  errorIcon,
  onClick,
  onCopySuccess,
  onCopyError,
  ...props
}: CopyButtonProps) => {
  const { state, copy } = useCopyToClipboard({
    onCopyError,
    onCopySuccess,
  });

  const handleCopy = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      copy(text);
      onClick?.(e);
    },
    [copy, text, onClick]
  );

  return (
    <Button
      size={size}
      onClick={handleCopy}
      aria-label="Copy"
      variant="ghost"
      {...props}
    >
      <CopyStateIcon
        state={state}
        idleIcon={idleIcon}
        doneIcon={doneIcon}
        errorIcon={errorIcon}
      />
      {children}
    </Button>
  );
};
