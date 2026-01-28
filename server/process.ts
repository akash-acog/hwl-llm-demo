// Document processing module
// Extracts data from files, canonicalizes, and creates database records

import { candidates, requisitions } from "./db/queries";
import { ingest, type IngestInput } from "./ingest";
import { loadTool } from "./tools";
import { getStructuredOutput, providers, type Content } from "./ai";
import { canonicalize } from "./canonicalize";
import { normalizeState } from "./us-states";
import {
  uploadFile as s3Upload,
  generateStoragePath,
} from "./storage";
import type {
  DocumentStatus,
  FileInput,
  SourceFile,
  ParsingStats,
  CanonStats,
  CanonicalResult,
  ProcessResumeResult,
  ProcessRequisitionResult,
  ProcessLicenseResult,
  ProcessCertificationResult,
} from "./types";

// ============================================================================
// Configuration
// ============================================================================

type ProcessingOptions = {
  skipFileUpload?: boolean; // Skip S3 upload (useful for testing)
};

// ============================================================================
// Helpers
// ============================================================================

function countFieldSources(obj: unknown, stats: ParsingStats): void {
  if (obj === null || obj === undefined) return;

  if (typeof obj === "object") {
    if (Array.isArray(obj)) {
      for (const item of obj) {
        countFieldSources(item, stats);
      }
    } else {
      const record = obj as Record<string, unknown>;

      if ("source" in record && typeof record.source === "string") {
        const source = record.source as keyof ParsingStats;
        if (source in stats) {
          stats[source]++;
        }
      }

      for (const value of Object.values(record)) {
        countFieldSources(value, stats);
      }
    }
  }
}

function determineStatus(
  parsingStats: ParsingStats,
  canonStats: CanonStats,
): DocumentStatus {
  const hasUnresolved = canonStats.unresolved > 0;
  const hasAmbiguous = parsingStats.ambiguous > 0;
  return hasUnresolved || hasAmbiguous ? "pending_review" : "active";
}

async function uploadFiles(
  entityId: string,
  files: FileInput[],
  skip: boolean = false,
): Promise<SourceFile[] | null> {
  if (skip) return null;

  try {
    const sourceFiles: SourceFile[] = [];
    for (const file of files) {
      const storagePath = generateStoragePath(entityId, file.filename);
      await s3Upload(storagePath, file.data, { contentType: file.mimeType });
      sourceFiles.push({
        storagePath,
        originalFilename: file.filename,
        mimeType: file.mimeType,
      });
    }
    return sourceFiles;
  } catch {
    // S3 not configured, skip upload
    return null;
  }
}

async function extractDocument(
  toolId: string,
  content: Content[],
): Promise<unknown> {
  const tool = await loadTool(toolId);
  if (!tool) {
    throw new Error(`Tool not found: ${toolId}`);
  }

  return getStructuredOutput({
    input: content,
    system: tool.systemPrompt,
    prompt: tool.prompt,
    schema: tool.schema,
    model: {
      model: providers.openai.defaultModel,
      modelFn: providers.openai.fn,
    },
  });
}

// ============================================================================
// Resume Processing
// ============================================================================

type ResumeExtraction = {
  candidate: {
    firstName: { value: string | null };
    lastName: { value: string | null };
    email: { value: string | null };
    phone: { value: string | null };
    city: { value: string | null };
    state: { value: string | null };
    primaryJobTitle: { value: string | null };
    primarySpecialty: { value: string | null };
    yearsOfExperience: { value: number | null };
    licenses: Array<{
      licenseType: { value: string | null; source: string };
      state: { value: string | null; source: string };
      licenseNumber: { value: string | null; source: string };
      expirationDate: { value: string | null; source: string };
      isCompact: { value: boolean | null; source: string };
    }>;
    certifications: Array<{
      certType: { value: string | null; source: string };
      issuingOrganization: { value: string | null; source: string };
      expirationDate: { value: string | null; source: string };
    }>;
  };
};

/**
 * Process resume file(s) and create a candidate record.
 * If multiple files, they are combined into one extraction (e.g., resume + cover letter).
 */
export async function processResume(
  files: FileInput[],
  options: ProcessingOptions = {},
): Promise<ProcessResumeResult> {
  // Convert files to AI content
  const ingestInputs: IngestInput[] = files.map((f) => ({
    data: f.data,
    mimeType: f.mimeType,
  }));
  const content = await ingest(ingestInputs);

  // Extract data
  const extraction = (await extractDocument(
    "candidate-resume-extractor",
    content,
  )) as ResumeExtraction;

  // Calculate parsing stats
  const parsingStats: ParsingStats = {
    explicit: 0,
    implicit: 0,
    ambiguous: 0,
    missing: 0,
  };
  countFieldSources(extraction, parsingStats);

  // Canonicalize job title
  const canonResults: CanonicalResult[] = [];
  let jobTitleCanon: CanonicalResult | null = null;

  if (extraction.candidate.primaryJobTitle?.value) {
    jobTitleCanon = await canonicalize(
      "jobTitle",
      extraction.candidate.primaryJobTitle.value,
    );
    canonResults.push(jobTitleCanon);
  }

  // Canonicalize licenses
  const licenseCanons: Map<number, CanonicalResult> = new Map();
  for (let i = 0; i < extraction.candidate.licenses.length; i++) {
    const lic = extraction.candidate.licenses[i]!;
    if (lic.licenseType?.value) {
      const canon = await canonicalize("licenseType", lic.licenseType.value);
      licenseCanons.set(i, canon);
      canonResults.push(canon);
    }
  }

  // Canonicalize certifications
  const certCanons: Map<number, CanonicalResult> = new Map();
  for (let i = 0; i < extraction.candidate.certifications.length; i++) {
    const cert = extraction.candidate.certifications[i]!;
    if (cert.certType?.value) {
      const canon = await canonicalize("certType", cert.certType.value);
      certCanons.set(i, canon);
      canonResults.push(canon);
    }
  }

  // Calculate canon stats
  const canonStats: CanonStats = {
    total: canonResults.length,
    resolved: canonResults.filter((r) => r.canonicalId !== null).length,
    unresolved: canonResults.filter((r) => r.canonicalId === null).length,
  };

  // Determine status
  const status = determineStatus(parsingStats, canonStats);

  // Create candidate record
  const cand = extraction.candidate;
  const candidateResult = await candidates.create(
    {
      status,
      first_name: cand.firstName?.value || "Unknown",
      last_name: cand.lastName?.value || "Unknown",
      email: cand.email?.value || null,
      phone: cand.phone?.value || null,
      city: cand.city?.value || null,
      state: normalizeState(cand.state?.value),
      canonical_job_title_id: jobTitleCanon?.canonicalId || null,
      job_title_match_type: jobTitleCanon?.matchType || null,
      raw_job_title: cand.primaryJobTitle?.value || null,
      primary_specialty: cand.primarySpecialty?.value || null,
      years_of_experience: cand.yearsOfExperience?.value || null,
      raw_extraction: extraction,
      source_files: null,
    },
    // Licenses
    cand.licenses.map((lic, i) => {
      const canon = licenseCanons.get(i);
      return {
        status: (canon?.canonicalId ? "active" : "pending_review") as DocumentStatus,
        canonical_license_id: canon?.canonicalId || null,
        license_match_type: canon?.matchType || null,
        raw_name: lic.licenseType?.value || "Unknown",
        state: normalizeState(lic.state?.value),
        license_number: lic.licenseNumber?.value || null,
        expiration_date: lic.expirationDate?.value || null,
        is_compact: lic.isCompact?.value || false,
        source_file: null,
      };
    }),
    // Certifications
    cand.certifications.map((cert, i) => {
      const canon = certCanons.get(i);
      return {
        status: (canon?.canonicalId ? "active" : "pending_review") as DocumentStatus,
        canonical_certification_id: canon?.canonicalId || null,
        cert_match_type: canon?.matchType || null,
        raw_name: cert.certType?.value || "Unknown",
        issuing_organization: cert.issuingOrganization?.value || null,
        expiration_date: cert.expirationDate?.value || null,
        source_file: null,
      };
    }),
  );

  // Upload files (optional)
  const sourceFiles = await uploadFiles(
    candidateResult.id,
    files,
    options.skipFileUpload,
  );
  if (sourceFiles) {
    await candidates.update(candidateResult.id, { source_files: sourceFiles });
  }

  return {
    candidateId: candidateResult.id,
    status,
    parsingStats,
    canonStats,
    hasUnresolvedCanonicalization: canonStats.unresolved > 0,
    hasAmbiguousFields: parsingStats.ambiguous > 0,
  };
}

// ============================================================================
// Requisition Processing
// ============================================================================

type RequisitionExtraction = {
  requisitions: Array<{
    jobTitle: { value: string | null };
    facilityName: { value: string | null };
    department: { value: string | null };
    location: { value: string | null };
    numberOfPositions: { value: number | null };
    contractType: { value: string | null };
    shiftType: { value: string | null };
    startDate: { value: string | null };
    endDate: { value: string | null };
    expiresAt: { value: string | null };
    duration: { value: string | null };
    payRate: { value: string | null };
    billRate: { value: string | null };
    benefitsOffered: { value: string[] | null };
    experienceRequired: { value: string | null };
    urgency: { value: string | null };
    notes: { value: string | null };
    licenses: Array<{
      licenseType: { value: string | null; source: string };
      state: { value: string | null; source: string };
      requirement: { value: string | null; source: string };
    }>;
    certifications: Array<{
      certType: { value: string | null; source: string };
      requirement: { value: string | null; source: string };
    }>;
  }>;
};

export type ProcessRequisitionsResult = {
  results: ProcessRequisitionResult[];
  totalParsingStats: ParsingStats;
  totalCanonStats: CanonStats;
};

/**
 * Process requisition file(s) and create requisition records.
 * One document may contain multiple requisitions (e.g., a job board export).
 */
export async function processRequisition(
  files: FileInput[],
  facilityId?: string,
  options: ProcessingOptions = {},
): Promise<ProcessRequisitionsResult> {
  // Convert files to AI content
  const ingestInputs: IngestInput[] = files.map((f) => ({
    data: f.data,
    mimeType: f.mimeType,
  }));
  const content = await ingest(ingestInputs);

  // Extract data (can return multiple requisitions from one document)
  const extraction = (await extractDocument(
    "requisition-extractor",
    content,
  )) as RequisitionExtraction;

  const results: ProcessRequisitionResult[] = [];
  const totalParsingStats: ParsingStats = {
    explicit: 0,
    implicit: 0,
    ambiguous: 0,
    missing: 0,
  };
  const totalCanonStats: CanonStats = { total: 0, resolved: 0, unresolved: 0 };

  for (const req of extraction.requisitions) {
    // Calculate parsing stats for this requisition
    const parsingStats: ParsingStats = {
      explicit: 0,
      implicit: 0,
      ambiguous: 0,
      missing: 0,
    };
    countFieldSources(req, parsingStats);

    // Canonicalize
    const canonResults: CanonicalResult[] = [];

    // Job title
    let jobTitleCanon: CanonicalResult | null = null;
    if (req.jobTitle?.value) {
      jobTitleCanon = await canonicalize("jobTitle", req.jobTitle.value);
      canonResults.push(jobTitleCanon);
    }

    // Facility (only if not provided)
    let facilityCanon: CanonicalResult | null = null;
    if (!facilityId && req.facilityName?.value) {
      facilityCanon = await canonicalize("facilityName", req.facilityName.value);
      canonResults.push(facilityCanon);
    }

    // Licenses
    const licenseCanons: Map<number, CanonicalResult> = new Map();
    for (let i = 0; i < req.licenses.length; i++) {
      const lic = req.licenses[i]!;
      if (lic.licenseType?.value) {
        const canon = await canonicalize("licenseType", lic.licenseType.value);
        licenseCanons.set(i, canon);
        canonResults.push(canon);
      }
    }

    // Certifications
    const certCanons: Map<number, CanonicalResult> = new Map();
    for (let i = 0; i < req.certifications.length; i++) {
      const cert = req.certifications[i]!;
      if (cert.certType?.value) {
        const canon = await canonicalize("certType", cert.certType.value);
        certCanons.set(i, canon);
        canonResults.push(canon);
      }
    }

    // Canon stats
    const canonStats: CanonStats = {
      total: canonResults.length,
      resolved: canonResults.filter((r) => r.canonicalId !== null).length,
      unresolved: canonResults.filter((r) => r.canonicalId === null).length,
    };

    // Determine status
    const status = determineStatus(parsingStats, canonStats);

    // Extract state from location
    const state = normalizeState(req.location?.value);

    // Create requisition
    const requisitionResult = await requisitions.create(
      {
        status,
        facility_id: facilityId || facilityCanon?.canonicalId || null,
        facility_match_type: facilityId ? "manual" : facilityCanon?.matchType || null,
        raw_facility_name: req.facilityName?.value || null,
        canonical_job_title_id: jobTitleCanon?.canonicalId || null,
        job_title_match_type: jobTitleCanon?.matchType || null,
        job_title: jobTitleCanon?.canonicalValue || req.jobTitle?.value || "Unknown",
        department: req.department?.value || null,
        location: req.location?.value || null,
        state,
        number_of_positions: req.numberOfPositions?.value || 1,
        shift_type: req.shiftType?.value || null,
        contract_type: (req.contractType?.value as any) || null,
        start_date: req.startDate?.value || null,
        end_date: req.endDate?.value || null,
        expires_at: req.expiresAt?.value || null,
        duration: req.duration?.value || null,
        pay_rate: req.payRate?.value || null,
        bill_rate: req.billRate?.value || null,
        benefits_offered: req.benefitsOffered?.value || null,
        experience_required: req.experienceRequired?.value || null,
        urgency: req.urgency?.value || null,
        notes: req.notes?.value || null,
        raw_extraction: req,
        source_files: null,
      },
      // License requirements
      req.licenses.map((lic, i) => {
        const canon = licenseCanons.get(i);
        return {
          canonical_license_id: canon?.canonicalId || null,
          license_match_type: canon?.matchType || null,
          raw_name: lic.licenseType?.value || "Unknown",
          state: normalizeState(lic.state?.value),
          requirement_level: (lic.requirement?.value === "preferred" ? "preferred" : "required") as "required" | "preferred",
        };
      }),
      // Certification requirements
      req.certifications.map((cert, i) => {
        const canon = certCanons.get(i);
        return {
          canonical_certification_id: canon?.canonicalId || null,
          cert_match_type: canon?.matchType || null,
          raw_name: cert.certType?.value || "Unknown",
          requirement_level: (cert.requirement?.value === "preferred" ? "preferred" : "required") as "required" | "preferred",
        };
      }),
    );

    // Upload files (optional, for first requisition only)
    if (results.length === 0) {
      const sourceFiles = await uploadFiles(
        requisitionResult.id,
        files,
        options.skipFileUpload,
      );
      if (sourceFiles) {
        await requisitions.update(requisitionResult.id, {
          source_files: sourceFiles,
        });
      }
    }

    results.push({
      requisitionId: requisitionResult.id,
      status,
      parsingStats,
      canonStats,
      hasUnresolvedCanonicalization: canonStats.unresolved > 0,
      hasAmbiguousFields: parsingStats.ambiguous > 0,
    });

    // Aggregate totals
    totalParsingStats.explicit += parsingStats.explicit;
    totalParsingStats.implicit += parsingStats.implicit;
    totalParsingStats.ambiguous += parsingStats.ambiguous;
    totalParsingStats.missing += parsingStats.missing;
    totalCanonStats.total += canonStats.total;
    totalCanonStats.resolved += canonStats.resolved;
    totalCanonStats.unresolved += canonStats.unresolved;
  }

  return { results, totalParsingStats, totalCanonStats };
}

// ============================================================================
// License File Processing (for existing candidate)
// ============================================================================

type LicenseExtraction = {
  license: {
    licenseType: { value: string | null; source: string };
    state: { value: string | null; source: string };
    licenseNumber: { value: string | null; source: string };
    expirationDate: { value: string | null; source: string };
    isCompact: { value: boolean | null; source: string };
  };
};

/**
 * Process a license file and add it to an existing candidate.
 */
export async function processLicense(
  candidateId: string,
  file: FileInput,
  options: ProcessingOptions = {},
): Promise<ProcessLicenseResult> {
  // Convert file to AI content
  const content = await ingest([{ data: file.data, mimeType: file.mimeType }]);

  // Extract data
  const extraction = (await extractDocument(
    "license-extractor",
    content,
  )) as LicenseExtraction;

  // Calculate parsing stats
  const parsingStats: ParsingStats = {
    explicit: 0,
    implicit: 0,
    ambiguous: 0,
    missing: 0,
  };
  countFieldSources(extraction, parsingStats);

  // Canonicalize
  const canonResults: CanonicalResult[] = [];
  let canonResult: CanonicalResult = {
    key: "licenseType",
    rawValue: "",
    canonicalId: null,
    canonicalValue: null,
    matchType: "none",
    confidence: 0,
    reason: "No license type extracted",
  };

  if (extraction.license.licenseType?.value) {
    canonResult = await canonicalize(
      "licenseType",
      extraction.license.licenseType.value,
    );
  }
  canonResults.push(canonResult);

  // Calculate canon stats
  const canonStats: CanonStats = {
    total: canonResults.length,
    resolved: canonResults.filter((r) => r.canonicalId !== null).length,
    unresolved: canonResults.filter((r) => r.canonicalId === null).length,
  };

  // Determine status
  const status = determineStatus(parsingStats, canonStats);

  // Upload file (optional)
  let sourceFile: SourceFile | null = null;
  if (!options.skipFileUpload) {
    try {
      const storagePath = generateStoragePath(candidateId, file.filename);
      await s3Upload(storagePath, file.data, { contentType: file.mimeType });
      sourceFile = {
        storagePath,
        originalFilename: file.filename,
        mimeType: file.mimeType,
      };
    } catch {
      // S3 not configured
    }
  }

  // Create license record
  const license = await candidates.addLicense(candidateId, {
    status,
    canonical_license_id: canonResult.canonicalId,
    license_match_type: canonResult.matchType,
    raw_name: extraction.license.licenseType?.value || "Unknown",
    state: normalizeState(extraction.license.state?.value),
    license_number: extraction.license.licenseNumber?.value || null,
    expiration_date: extraction.license.expirationDate?.value || null,
    is_compact: extraction.license.isCompact?.value || false,
    source_file: sourceFile,
  });

  return {
    licenseId: license.id,
    candidateId,
    status,
    parsingStats,
    canonStats,
    hasUnresolvedCanonicalization: canonStats.unresolved > 0,
    hasAmbiguousFields: parsingStats.ambiguous > 0,
  };
}

// ============================================================================
// Certification File Processing (for existing candidate)
// ============================================================================

type CertificationExtraction = {
  certification: {
    certType: { value: string | null; source: string };
    issuingOrganization: { value: string | null; source: string };
    expirationDate: { value: string | null; source: string };
  };
};

/**
 * Process a certification file and add it to an existing candidate.
 */
export async function processCertification(
  candidateId: string,
  file: FileInput,
  options: ProcessingOptions = {},
): Promise<ProcessCertificationResult> {
  // Convert file to AI content
  const content = await ingest([{ data: file.data, mimeType: file.mimeType }]);

  // Extract data
  const extraction = (await extractDocument(
    "certification-extractor",
    content,
  )) as CertificationExtraction;

  // Calculate parsing stats
  const parsingStats: ParsingStats = {
    explicit: 0,
    implicit: 0,
    ambiguous: 0,
    missing: 0,
  };
  countFieldSources(extraction, parsingStats);

  // Canonicalize
  const canonResults: CanonicalResult[] = [];
  let canonResult: CanonicalResult = {
    key: "certType",
    rawValue: "",
    canonicalId: null,
    canonicalValue: null,
    matchType: "none",
    confidence: 0,
    reason: "No certification type extracted",
  };

  if (extraction.certification.certType?.value) {
    canonResult = await canonicalize(
      "certType",
      extraction.certification.certType.value,
    );
  }
  canonResults.push(canonResult);

  // Calculate canon stats
  const canonStats: CanonStats = {
    total: canonResults.length,
    resolved: canonResults.filter((r) => r.canonicalId !== null).length,
    unresolved: canonResults.filter((r) => r.canonicalId === null).length,
  };

  // Determine status
  const status = determineStatus(parsingStats, canonStats);

  // Upload file (optional)
  let sourceFile: SourceFile | null = null;
  if (!options.skipFileUpload) {
    try {
      const storagePath = generateStoragePath(candidateId, file.filename);
      await s3Upload(storagePath, file.data, { contentType: file.mimeType });
      sourceFile = {
        storagePath,
        originalFilename: file.filename,
        mimeType: file.mimeType,
      };
    } catch {
      // S3 not configured
    }
  }

  // Create certification record
  const cert = await candidates.addCertification(candidateId, {
    status,
    canonical_certification_id: canonResult.canonicalId,
    cert_match_type: canonResult.matchType,
    raw_name: extraction.certification.certType?.value || "Unknown",
    issuing_organization:
      extraction.certification.issuingOrganization?.value || null,
    expiration_date: extraction.certification.expirationDate?.value || null,
    source_file: sourceFile,
  });

  return {
    certificationId: cert.id,
    candidateId,
    status,
    parsingStats,
    canonStats,
    hasUnresolvedCanonicalization: canonStats.unresolved > 0,
    hasAmbiguousFields: parsingStats.ambiguous > 0,
  };
}
