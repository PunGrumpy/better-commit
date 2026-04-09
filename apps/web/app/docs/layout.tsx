import { DocsLayout as FumadocsDocsLayout } from "fumadocs-ui/layouts/docs";

import { baseOptions } from "@/lib/layout.shared";
import { source } from "@/lib/source";

const DocsLayout = ({ children }: LayoutProps<"/docs">) => (
  <FumadocsDocsLayout
    tree={source.getPageTree()}
    {...baseOptions()}
    sidebar={{
      collapsible: false,
      tabs: false,
    }}
  >
    {children}
  </FumadocsDocsLayout>
);

export default DocsLayout;
