import type { PropsWithChildren } from "react";

import { Toaster } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";

export const DesignSystemProvider = ({ children }: PropsWithChildren) => (
  <>
    <TooltipProvider delay={0}>{children}</TooltipProvider>
    <Toaster />
  </>
);
