"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { MobileSidebarTrigger } from "./sidebar";

type Breadcrumb = {
  label: string;
  href?: string;
};

type Props = {
  title: string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
};

export function PageHeader({ title, description, breadcrumbs, actions }: Props) {
  return (
    <div className="shrink-0 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
      {/* Breadcrumb bar - always show for mobile trigger */}
      <div className="h-10 flex items-center gap-2 px-4 md:px-8 border-b border-neutral-100 dark:border-neutral-800/50">
        <MobileSidebarTrigger />
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1 text-sm text-neutral-500 dark:text-neutral-400">
            {breadcrumbs.map((crumb, idx) => (
              <span key={idx} className="flex items-center gap-1">
                {idx > 0 && <ChevronRight className="h-3 w-3" />}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="hover:text-neutral-900 dark:hover:text-white transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-neutral-900 dark:text-white">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
      </div>

      {/* Title bar */}
      <div className="px-4 md:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">
              {title}
            </h1>
            {description && (
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                {description}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </div>
    </div>
  );
}
