import {
  Geist_Mono as createMono,
  Geist as createSans,
} from "next/font/google";

import { cn } from "./utils";

export const sans = createSans({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-sans",
  weight: "variable",
});

export const mono = createMono({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-mono",
  weight: "variable",
});

export const fonts = cn(
  "touch-manipulation font-sans antialiased",
  sans.variable,
  mono.variable
);
