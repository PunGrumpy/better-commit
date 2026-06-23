import { Header } from "@/components/header";

const HomeLayout = ({ children }: LayoutProps<"/">) => (
  <div className="h-dvh grid grid-rows-[56px_1fr] overflow-hidden">
    <Header />
    <main className="min-h-0 overflow-y-auto py-8 w-full flex flex-col justify-center items-center">
      {children}
    </main>
  </div>
);

export default HomeLayout;
