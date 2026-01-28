// Query parameter parsing utilities
import type { NextRequest } from "next/server";

export function getQueryParam(request: NextRequest, name: string): string | null {
  return request.nextUrl.searchParams.get(name);
}

export function getQueryArray(request: NextRequest, name: string): string[] {
  const value = request.nextUrl.searchParams.get(name);
  return value ? value.split(",").map((v) => v.trim()) : [];
}

export function getQueryBoolean(request: NextRequest, name: string, defaultValue = false): boolean {
  const value = request.nextUrl.searchParams.get(name);
  if (value === null) return defaultValue;
  return value === "true" || value === "1";
}

export function getQueryNumber(request: NextRequest, name: string, defaultValue?: number): number | undefined {
  const value = request.nextUrl.searchParams.get(name);
  if (value === null) return defaultValue;
  const num = parseInt(value, 10);
  return isNaN(num) ? defaultValue : num;
}

export function getPagination(request: NextRequest) {
  return {
    limit: getQueryNumber(request, "limit", 50),
    offset: getQueryNumber(request, "offset", 0),
  };
}
