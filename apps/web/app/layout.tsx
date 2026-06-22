import "./globals.css";
import { DesignSystemProvider } from "@repo/design-system";
import { fonts } from "@repo/design-system/lib/fonts";
import { RootProvider } from "fumadocs-ui/provider/next";

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
