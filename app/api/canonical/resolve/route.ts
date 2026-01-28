// POST /api/canonical/resolve - Manually resolve canonicalization
import { NextRequest } from "next/server";
import { success, error, serverError } from "../../lib/response";
import { candidates, requisitions } from "@/server/db/queries";

type EntityType = "candidate" | "license" | "certification" | "requisition" | "requisition-license" | "requisition-certification";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { entityType, entityId, canonicalId, field } = body as {
      entityType: EntityType;
      entityId: string;
      canonicalId: string;
      field?: string; // For specifying which field to update
    };

    if (!entityType || !entityId || !canonicalId) {
      return error(
        "Missing required fields: entityType, entityId, canonicalId",
        "VALIDATION_ERROR",
        400
      );
    }

    let updated;
    let statusChanged = false;
    let newStatus;

    switch (entityType) {
      case "candidate":
        updated = await candidates.update(entityId, {
          canonical_job_title_id: canonicalId,
          job_title_match_type: "manual",
        });
        // TODO: Check if this resolves all canonicalization issues and update status
        newStatus = updated.status;
        break;

      case "license":
        updated = await candidates.updateLicense(entityId, {
          canonical_license_id: canonicalId,
          license_match_type: "manual",
        });
        newStatus = updated.status;
        break;

      case "certification":
        updated = await candidates.updateCertification(entityId, {
          canonical_certification_id: canonicalId,
          cert_match_type: "manual",
        });
        newStatus = updated.status;
        break;

      case "requisition":
        // Need to know which field to update (job title or facility)
        if (!field) {
          return error("Field parameter required for requisition", "VALIDATION_ERROR", 400);
        }
        if (field === "jobTitle") {
          updated = await requisitions.update(entityId, {
            canonical_job_title_id: canonicalId,
            job_title_match_type: "manual",
          });
        } else if (field === "facility") {
          updated = await requisitions.update(entityId, {
            facility_id: canonicalId,
            facility_match_type: "manual",
          });
        } else {
          return error(`Invalid field: ${field}`, "VALIDATION_ERROR", 400);
        }
        newStatus = updated.status;
        break;

      default:
        return error(`Invalid entity type: ${entityType}`, "VALIDATION_ERROR", 400);
    }

    return success({
      entityType,
      entityId,
      canonicalId,
      statusChanged,
      newStatus,
    });
  } catch (err: any) {
    console.error("Failed to resolve canonicalization:", err);
    return serverError(err.message || "Failed to resolve canonicalization");
  }
}
