import { HomeLayout as FumadocsHomeLayout } from "fumadocs-ui/layouts/home";

import { baseOptions } from "@/lib/layout.shared";

const HomeLayout = ({ children }: LayoutProps<"/">) => (
  <FumadocsHomeLayout {...baseOptions()}>{children}</FumadocsHomeLayout>
);

export default HomeLayout;
