import { z } from "zod";

const FieldSource = z.enum(["explicit", "implicit", "missing", "ambiguous"]);
const ProficiencyLevel = z.enum(["beginner", "intermediate", "advanced", "expert", "unspecified"]);
const ShiftType = z.enum(["day", "night", "evening", "rotating", "flexible", "unspecified"]);
const EmploymentType = z.enum(["full-time", "part-time", "per-diem", "travel", "contract", "unspecified"]);
const SkillCategory = z.enum(["clinical", "technical", "emr", "equipment", "language", "soft-skill", "other"]);

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
  expirationDate: ExtractedField(z.string()),
  isCompact: ExtractedField(z.boolean()),
});

const CertificationSchema = z.object({
  certType: ExtractedField(z.string()).describe("Certification type for canonicalization (e.g., BLS, ACLS, PALS)"),
  issuingOrganization: ExtractedField(z.string()),
  expirationDate: ExtractedField(z.string()),
});

const EducationSchema = z.object({
  degree: z.string(),
  fieldOfStudy: z.string().nullable(),
  institution: z.string(),
  graduationDate: z.string().nullable(),
  gpa: z.string().nullable(),
  source: FieldSource,
  reason: z.string(),
});

const WorkExperienceSchema = z.object({
  jobTitle: z.string().describe("Job title for canonicalization"),
  employer: z.string(),
  facilityType: z.string().nullable(),
  department: z.string().nullable(),
  location: z.string().nullable(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  isCurrent: z.boolean(),
  employmentType: EmploymentType,
  responsibilities: z.array(z.string()),
  patientPopulation: z.string().nullable(),
  bedsOrCaseload: z.string().nullable(),
  source: FieldSource,
  reason: z.string(),
});

const SkillSchema = z.object({
  name: z.string(),
  category: SkillCategory,
  proficiency: ProficiencyLevel,
  yearsOfExperience: z.number().nullable(),
  source: FieldSource,
  reason: z.string(),
});

const ReferenceSchema = z.object({
  name: z.string(),
  title: z.string().nullable(),
  organization: z.string().nullable(),
  relationship: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  source: FieldSource,
  reason: z.string(),
});

const CandidateSchema = z.object({
  // Personal info
  firstName: ExtractedField(z.string()),
  lastName: ExtractedField(z.string()),
  middleName: ExtractedField(z.string()),
  preferredName: ExtractedField(z.string()),

  // Contact
  email: ExtractedField(z.string()),
  phone: ExtractedField(z.string()),
  alternatePhone: ExtractedField(z.string()),
  address: ExtractedField(z.string()),
  city: ExtractedField(z.string()),
  state: ExtractedField(z.string()),
  zipCode: ExtractedField(z.string()),
  linkedIn: ExtractedField(z.string()),

  // Professional info - key field for canonicalization
  primaryJobTitle: ExtractedField(z.string()).describe("Primary job title for canonicalization"),
  professionalSummary: ExtractedField(z.string()),
  primarySpecialty: ExtractedField(z.string()),
  secondarySpecialties: ExtractedField(z.array(z.string())),
  yearsOfExperience: ExtractedField(z.number()),

  // Credentials
  licenses: z.array(LicenseSchema),
  certifications: z.array(CertificationSchema),

  // Background
  education: z.array(EducationSchema),
  workExperience: z.array(WorkExperienceSchema),
  skills: z.array(SkillSchema),
  emrSystems: ExtractedField(z.array(z.string())),

  // Preferences
  shiftPreference: ExtractedField(ShiftType),
  willingToRelocate: ExtractedField(z.boolean()),
  willingToTravel: ExtractedField(z.boolean()),
  desiredLocations: ExtractedField(z.array(z.string())),
  availableStartDate: ExtractedField(z.string()),
  desiredPayRate: ExtractedField(z.string()),

  // References and notes
  references: z.array(ReferenceSchema),
  additionalNotes: ExtractedField(z.string()),
});

export const schema = z.object({
  documentType: z.string(),
  candidate: CandidateSchema,
});

export type Candidate = z.infer<typeof CandidateSchema>;
export type Extraction = z.infer<typeof schema>;
