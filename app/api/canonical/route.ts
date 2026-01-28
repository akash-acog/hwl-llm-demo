// GET /api/canonical - Get all canonical data
import { NextRequest } from "next/server";
import { success, error, serverError } from "../lib/response";
import { getQueryParam } from "../lib/query";
import {
  canonicalJobTitles,
  canonicalLicenses,
  canonicalCertifications,
  facilities,
} from "@/server/db/queries";

export async function GET(request: NextRequest) {
  try {
    const type = getQueryParam(request, "type");

    if (type) {
      // Return specific type
      switch (type) {
        case "jobTitles":
          return success({ jobTitles: await canonicalJobTitles.list() });
        case "licenses":
          return success({ licenses: await canonicalLicenses.list() });
        case "certifications":
          return success({ certifications: await canonicalCertifications.list() });
        case "facilities":
          return success({ facilities: await facilities.list() });
        default:
          return error(`Invalid type: ${type}`, "VALIDATION_ERROR", 400);
      }
    }

    // Return all canonical data
    const [jobTitles, licenses, certifications, facilitiesList] = await Promise.all([
      canonicalJobTitles.list(),
      canonicalLicenses.list(),
      canonicalCertifications.list(),
      facilities.list(),
    ]);

    return success({
      jobTitles,
      licenses,
      certifications,
      facilities: facilitiesList,
    });
  } catch (err: any) {
    console.error("Failed to get canonical data:", err);
    return serverError(err.message || "Failed to get canonical data");
  }
}
