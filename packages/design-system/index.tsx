import type { RootProviderProps } from "fumadocs-ui/provider/next";
import { RootProvider } from "fumadocs-ui/provider/next";

import { Toaster } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";

type DesignSystemProviderProps = RootProviderProps;

export const DesignSystemProvider = ({
  children,
  ...props
}: DesignSystemProviderProps) => (
  <RootProvider {...props}>
    <TooltipProvider>{children}</TooltipProvider>
    <Toaster />
  </RootProvider>
);
