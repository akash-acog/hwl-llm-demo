import { z } from "zod";

const FieldSource = z.enum(["explicit", "implicit", "missing", "ambiguous"]);

const ExtractedField = <T extends z.ZodTypeAny>(schema: T) =>
  z.object({
    value: schema.nullable(),
    source: FieldSource,
    reason: z.string(),
  });

const LicenseSchema = z.object({
  licenseType: ExtractedField(z.string()).describe("License type for canonicalization (e.g., RN, LPN, CNA)"),
  state: ExtractedField(z.string()),
  licenseNumber: ExtractedField(z.string()),
  holderName: ExtractedField(z.string()),
  issueDate: ExtractedField(z.string()),
  expirationDate: ExtractedField(z.string()),
  isCompact: ExtractedField(z.boolean()).describe("Whether this is a compact/multi-state license"),
  status: ExtractedField(z.string()).describe("License status (active, expired, suspended, etc.)"),
  verificationUrl: ExtractedField(z.string()).describe("URL to verify license if available"),
});

export const schema = z.object({
  documentType: z.string(),
  license: LicenseSchema,
});

export type License = z.infer<typeof LicenseSchema>;
export type Extraction = z.infer<typeof schema>;
