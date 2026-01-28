"use client";

import { useState, createContext, useContext } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { DarkModeToggle } from "./dark-mode-toggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Zap,
  Menu,
  LayoutDashboard,
  Users,
  Building2,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Candidates", href: "/candidates", icon: Users },
  { name: "Facilities", href: "/facilities", icon: Building2 },
  { name: "Requisitions", href: "/requisitions", icon: FileText },
];

const adminNavigation = [{ name: "Admin", href: "/admin", icon: Settings }];

type SidebarContextType = {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
};

const SidebarContext = createContext<SidebarContextType>({
  collapsed: false,
  setCollapsed: () => {},
  mobileOpen: false,
  setMobileOpen: () => {},
});

export function useSidebar() {
  return useContext(SidebarContext);
}

function NavLink({
  item,
  collapsed,
  onClick,
}: {
  item: (typeof navigation)[0];
  collapsed: boolean;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const isActive =
    pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
        isActive
          ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white"
          : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 hover:text-neutral-900 dark:hover:text-white"
      )}
    >
      <item.icon className="h-4 w-4 shrink-0" />
      {!collapsed && <span>{item.name}</span>}
    </Link>
  );
}

function SidebarContent({
  collapsed,
  onCollapse,
  onNavClick,
}: {
  collapsed: boolean;
  onCollapse?: () => void;
  onNavClick?: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      <div
        className={cn(
          "shrink-0 h-14 flex items-center border-b border-neutral-200 dark:border-neutral-800",
          collapsed ? "justify-center px-2" : "justify-between px-4"
        )}
      >
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-neutral-900 dark:bg-white flex items-center justify-center shrink-0">
            <Zap className="h-4 w-4 text-white dark:text-neutral-900" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-sm font-semibold leading-none">HWL Demo</h1>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Extraction tools
              </p>
            </div>
          )}
        </div>
        {!collapsed && onCollapse && (
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onCollapse}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {navigation.map((item) => (
            <NavLink key={item.href} item={item} collapsed={collapsed} onClick={onNavClick} />
          ))}
        </div>
        <Separator className="my-4" />
        <div className="space-y-1">
          {adminNavigation.map((item) => (
            <NavLink key={item.href} item={item} collapsed={collapsed} onClick={onNavClick} />
          ))}
        </div>
      </ScrollArea>

      <div
        className={cn(
          "shrink-0 border-t border-neutral-200 dark:border-neutral-800 p-3",
          collapsed && "flex justify-center"
        )}
      >
        <DarkModeToggle />
      </div>
    </div>
  );
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed, mobileOpen, setMobileOpen }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function MobileSidebarTrigger() {
  const { setMobileOpen } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="md:hidden h-8 w-8"
      onClick={() => setMobileOpen(true)}
    >
      <Menu className="h-4 w-4" />
    </Button>
  );
}

export function Sidebar() {
  const { collapsed, setCollapsed, mobileOpen, setMobileOpen } = useSidebar();

  return (
    <>
      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent collapsed={false} onNavClick={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col shrink-0 border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 transition-all duration-200 relative",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <SidebarContent collapsed={collapsed} onCollapse={() => setCollapsed(true)} />
        {collapsed && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 -right-3 h-6 w-6 rounded-full border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 z-10"
            onClick={() => setCollapsed(false)}
          >
            <ChevronRight className="h-3 w-3" />
          </Button>
        )}
      </aside>
    </>
  );
}
