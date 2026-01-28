import { z } from "zod";

const FieldSource = z.enum(["explicit", "implicit", "missing", "ambiguous"]);

const ExtractedField = <T extends z.ZodTypeAny>(schema: T) =>
  z.object({
    value: schema.nullable(),
    source: FieldSource,
    reason: z.string(),
  });

const CertificationSchema = z.object({
  certType: ExtractedField(z.string()).describe("Certification type for canonicalization (e.g., BLS, ACLS, PALS)"),
  abbreviation: ExtractedField(z.string()).describe("Standard abbreviation if different from certType"),
  holderName: ExtractedField(z.string()),
  issuingOrganization: ExtractedField(z.string()).describe("Organization that issued the certification (e.g., AHA, BCEN)"),
  issueDate: ExtractedField(z.string()),
  expirationDate: ExtractedField(z.string()),
  cardNumber: ExtractedField(z.string()).describe("Certificate or card ID number"),
  eCardId: ExtractedField(z.string()).describe("Electronic card ID for verification"),
  status: ExtractedField(z.string()).describe("Certification status (current, expired, etc.)"),
  verificationUrl: ExtractedField(z.string()).describe("URL to verify certification if available"),
});

export const schema = z.object({
  documentType: z.string(),
  certification: CertificationSchema,
});

export type Certification = z.infer<typeof CertificationSchema>;
export type Extraction = z.infer<typeof schema>;
