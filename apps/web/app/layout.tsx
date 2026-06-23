import { DesignSystemProvider } from "@repo/design-system";

import "./globals.css";
import { fonts } from "@repo/design-system/lib/fonts";
import { RootProvider } from "fumadocs-ui/provider/next";
import type { Metadata } from "next";

import { url } from "@/lib/url";

const title = "Better Commit";
const description = "Every commit, vetted before it reaches your repository";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
  description,
  metadataBase: new URL(url),
  openGraph: {
    description,
    locale: "en_US",
    siteName: "Better Commit",
    title,
    type: "website",
    url: "/",
  },
  title,
  twitter: {
    card: "summary_large_image",
    description,
    title,
  },
};

export const Layout = ({ children }: LayoutProps<"/">) => (
  <html
    lang="en"
    className={fonts}
    suppressHydrationWarning
    data-scroll-behavior="smooth"
  >
    <body className="flex min-h-screen flex-col">
      <DesignSystemProvider>
        <RootProvider>{children}</RootProvider>
      </DesignSystemProvider>
    </body>
  </html>
);

export default Layout;
