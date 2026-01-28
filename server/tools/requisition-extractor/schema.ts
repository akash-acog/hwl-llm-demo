import { z } from "zod";

const FieldSource = z.enum(["explicit", "implicit", "missing", "ambiguous"]);
const RequirementLevel = z.enum(["required", "preferred", "unspecified"]);
const ContractType = z.enum(["permanent", "travel", "contract", "per-diem"]);
const Urgency = z.enum(["asap", "urgent", "normal", "flexible"]);

const ExtractedField = <T extends z.ZodTypeAny>(schema: T) =>
  z.object({
    value: schema.nullable(),
    source: FieldSource,
    reason: z.string(),
  });

const CertificationSchema = z.object({
  certType: ExtractedField(z.string()).describe("Certification type/name for canonicalization"),
  requirement: ExtractedField(RequirementLevel),
});

const LicenseSchema = z.object({
  licenseType: ExtractedField(z.string()).describe("License type for canonicalization"),
  state: ExtractedField(z.string()),
  requirement: ExtractedField(RequirementLevel),
});

const RequisitionSchema = z.object({
  // Job info - key field for canonicalization
  jobTitle: ExtractedField(z.string()).describe("Job title for canonicalization"),
  department: ExtractedField(z.string()),

  // Facility info - key field for canonicalization
  facilityName: ExtractedField(z.string()).describe("Facility name for canonicalization"),
  location: ExtractedField(z.string()),

  // Position details
  numberOfPositions: ExtractedField(z.number()),
  contractType: ExtractedField(ContractType),

  // Schedule
  shiftType: ExtractedField(z.string()),
  shiftHours: ExtractedField(z.string()),

  // Dates
  startDate: ExtractedField(z.string()),
  endDate: ExtractedField(z.string()),
  expiresAt: ExtractedField(z.string()).describe("When this requisition expires/closes"),
  duration: ExtractedField(z.string()),

  // Compensation
  payRate: ExtractedField(z.string()),
  billRate: ExtractedField(z.string()),
  benefitsOffered: ExtractedField(z.array(z.string())),

  // Requirements
  certifications: z.array(CertificationSchema),
  licenses: z.array(LicenseSchema),
  experienceRequired: ExtractedField(z.string()),
  specialRequirements: ExtractedField(z.array(z.string())),

  // Contact
  contactName: ExtractedField(z.string()),
  contactEmail: ExtractedField(z.string()),
  contactPhone: ExtractedField(z.string()),

  // Meta
  urgency: ExtractedField(Urgency),
  notes: ExtractedField(z.string()),
});

export const schema = z.object({
  documentType: z.string(),
  requisitions: z.array(RequisitionSchema),
});

export type Requisition = z.infer<typeof RequisitionSchema>;
export type Extraction = z.infer<typeof schema>;
