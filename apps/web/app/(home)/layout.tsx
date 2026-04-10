import { Header } from "@/components/header";

const HomeLayout = ({ children }: LayoutProps<"/">) => (
  <div className="h-dvh grid grid-rows-[56px_1fr] overflow-hidden">
    <Header />
    {children}
  </div>
);

export default HomeLayout;
