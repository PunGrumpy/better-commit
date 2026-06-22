"use client";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
} from "@repo/design-system/components/ui/input-group";
import { cn } from "@repo/design-system/lib/utils";
import { CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";

const COPY_TIMEOUT = 2000;

interface InstallerProps {
  className?: string;
  command: string;
}

export const Installer = ({ command, className = "w-48" }: InstallerProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    void navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), COPY_TIMEOUT);
  };

  return (
    <InputGroup
      className={cn(
        "h-10 cursor-pointer gap-1 bg-background font-mono",
        "shadow-[0_2px_2px_rgba(0,0,0,0.04)]",
        "has-[button:focus-visible]:border-ring has-[button:focus-visible]:ring-[3px] has-[button:focus-visible]:ring-ring/50",
        "dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
      )}
      onClick={handleCopy}
    >
      <InputGroupAddon>
        <span className="font-normal text-muted-foreground select-none">$</span>
      </InputGroupAddon>
      <InputGroupText
        className={cn("flex-1 truncate text-foreground", className)}
      >
        {command}
      </InputGroupText>
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          aria-label="Copy Command"
          className="relative transition-transform duration-150 active:scale-[0.96]"
          size="icon-sm"
          title="Copy Command"
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
      </InputGroupAddon>
    </InputGroup>
  );
};
