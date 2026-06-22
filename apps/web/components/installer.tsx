"use client";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
} from "@repo/design-system/components/ui/input-group";
import { cn } from "@repo/design-system/lib/utils";
import { useState } from "react";

import { COPY_TIMEOUT, CopyButton } from "@/components/copy-button";

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
        "has-[button:focus-visible]:border-ring has-[button:focus-visible]:ring-[3px] has-[button:focus-visible]:ring-ring/50"
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
        <CopyButton copied={copied} onCopy={handleCopy} />
      </InputGroupAddon>
    </InputGroup>
  );
};
