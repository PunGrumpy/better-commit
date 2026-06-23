import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { Logo, nav } from "@/lib/shared";

export const Header = () => (
  <div className="mx-auto flex w-full justify-between px-4 sm:px-8 lg:px-12">
    <div className="flex select-none flex-row items-center">
      <Logo />
    </div>
    <nav
      data-slot="navigation-menu"
      data-viewport="false"
      className="group/navigation-menu relative z-10 flex max-w-max flex-1 items-center justify-center"
    >
      <div className="relative flex select-none flex-row items-center">
        {nav.map((item) => {
          const isExternal = item.href.startsWith("http");

          return (
            <ul
              key={item.label}
              className="group flex flex-1 list-none items-center justify-center h-14 gap-4 pl-6"
              data-slot="navigation-menu-list"
            >
              <li className="relative" data-slot="navigation-menu-item">
                <Link
                  data-slot="navigation-menu-link"
                  href={item.href}
                  prefetch={!isExternal}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                  className="w-full outline-none flex gap-1 items-center text-muted-foreground text-sm transition-colors duration-100 hover:text-foreground data-active:text-foreground"
                >
                  {item.label}
                  {isExternal && <ArrowUpRight className="size-3" />}
                </Link>
              </li>
            </ul>
          );
        })}
      </div>
    </nav>
  </div>
);
