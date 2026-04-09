import "./globals.css";
import { DesignSystemProvider } from "@repo/design-system";
import { fonts } from "@repo/design-system/lib/fonts";

export const Layout = ({ children }: LayoutProps<"/">) => (
  <html lang="en" className={fonts} suppressHydrationWarning>
    <body className="flex min-h-screen flex-col">
      <DesignSystemProvider
        theme={{
          defaultTheme: undefined,
          enableSystem: true,
        }}
      >
        {children}
      </DesignSystemProvider>
    </body>
  </html>
);

export default Layout;
