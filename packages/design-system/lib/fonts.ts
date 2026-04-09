import { Geist, Geist_Mono } from "next/font/google";

import { cn } from "./utils";

const sans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const fonts = cn(
  "touch-manipulation font-sans antialiased",
  sans.variable,
  mono.variable
);
