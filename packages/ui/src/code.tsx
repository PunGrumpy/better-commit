import type { ReactNode } from "react";

interface CodeProps {
  children: ReactNode;
  className?: string;
}

export const Code = ({ children, className }: CodeProps) => (
  <code className={className}>{children}</code>
);
