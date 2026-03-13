"use client";

import { useCallback } from "react";
import type { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  className?: string;
  appName: string;
}

export const Button = ({ children, className, appName }: ButtonProps) => {
  const handleClick = useCallback(() => {
    console.log(`Hello from your ${appName} app!`);
  }, [appName]);

  return (
    <button type="button" className={className} onClick={handleClick}>
      {children}
    </button>
  );
};
