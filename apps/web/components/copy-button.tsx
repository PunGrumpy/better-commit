"use client";

import { InputGroupButton } from "@repo/design-system/components/ui/input-group";
import { cn } from "@repo/design-system/lib/utils";
import { CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";
import type { ComponentProps } from "react";

export const COPY_TIMEOUT = 2000;

interface CopyButtonProps extends Omit<
  ComponentProps<typeof InputGroupButton>,
  "onClick"
> {
  copied?: boolean;
  onCopy: () => void | Promise<void>;
}

export const CopyButton = ({
  copied: copiedProp,
  onCopy,
  className,
  ...props
}: CopyButtonProps) => {
  const [internalCopied, setInternalCopied] = useState(false);
  const copied = copiedProp ?? internalCopied;

  const handleCopy = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    await onCopy();

    if (copiedProp !== undefined) {
      return;
    }

    setInternalCopied(true);
    setTimeout(() => setInternalCopied(false), COPY_TIMEOUT);
  };

  return (
    <InputGroupButton
      aria-label={copied ? "Copied" : "Copy"}
      className={cn(
        "relative transition-transform duration-150 active:scale-[0.96]",
        className
      )}
      onClick={handleCopy}
      size="icon-sm"
      title="Copy"
      type="button"
      {...props}
    >
      <div
        aria-hidden={!copied}
        className={cn(
          "absolute inset-0 flex items-center justify-center transition-[opacity,scale,filter] duration-150 ease-[cubic-bezier(0.175,0.885,0.32,1.1)]",
          copied
            ? "scale-100 opacity-100 blur-0"
            : "scale-[0.25] opacity-0 blur-xs"
        )}
      >
        <CheckIcon className="size-3.5" strokeWidth={3} />
      </div>
      <CopyIcon
        aria-hidden={copied}
        className={cn(
          "size-3.5 transition-[opacity,scale,filter] duration-150 ease-[cubic-bezier(0.175,0.885,0.32,1.1)]",
          copied
            ? "scale-[0.25] opacity-0 blur-xs"
            : "scale-100 opacity-100 blur-0"
        )}
      />
    </InputGroupButton>
  );
};
