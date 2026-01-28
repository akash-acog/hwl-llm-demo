// API response utilities
import { NextResponse } from "next/server";

export function success<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function error(message: string, code: string, status = 400, details?: any) {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        ...(details && { details }),
      },
    },
    { status }
  );
}

export function notFound(resource: string) {
  return error(`${resource} not found`, "NOT_FOUND", 404);
}

export function validationError(message: string, details?: any) {
  return error(message, "VALIDATION_ERROR", 400, details);
}

export function serverError(message: string) {
  return error(message, "INTERNAL_ERROR", 500);
}
