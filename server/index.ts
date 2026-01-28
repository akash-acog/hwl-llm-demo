// Healthcare Workforce Logistics - Core Module
// Main entry point exporting all core functionality

// ============================================================================
// Database Queries
// ============================================================================

export {
  facilities,
  canonicalJobTitles,
  canonicalLicenses,
  canonicalCertifications,
  candidates,
  requisitions,
} from "./db/queries";

export type {
  Facility,
  CanonicalJobTitle,
  CanonicalLicense,
  CanonicalCertification,
  Candidate,
  CandidateLicense,
  CandidateCertification,
  Requisition,
  RequisitionLicense,
  RequisitionCertification,
} from "./db/queries";

// ============================================================================
// Document Processing
// ============================================================================

export {
  processResume,
  processRequisition,
  processLicense,
  processCertification,
} from "./process";

export type { ProcessRequisitionsResult } from "./process";

// ============================================================================
// Matching
// ============================================================================

export {
  findCandidatesForRequisition,
  findRequisitionsForCandidate,
  getMatchDetails,
} from "./matching";

export type {
  MatchFilters,
  MatchScore,
  CandidateMatch,
  RequisitionMatch,
} from "./matching";

// ============================================================================
// Canonicalization
// ============================================================================

export { canonicalize, canonicalizeBatch } from "./canonicalize";

// ============================================================================
// US State Utilities
// ============================================================================

export {
  normalizeState,
  isValidStateCode,
  getStateName,
  getAllStateCodes,
  extractStateFromLocation,
} from "./us-states";

// ============================================================================
// Storage
// ============================================================================

export {
  uploadFile,
  downloadFile,
  deleteFile,
  deleteFiles,
  fileExists,
  getFileInfo,
} from "./storage";

// ============================================================================
// Types
// ============================================================================

export type {
  // Core enums
  MatchType,
  DocumentStatus,
  RequirementLevel,
  ContractType,

  // Canonicalization
  CanonicalKey,
  CanonicalResult,

  // Extraction
  FieldSource,
  ExtractedField,
  ParsingStats,
  CanonStats,

  // File types
  FileInput,
  SourceFile,

  // Processing results
  ProcessResumeResult,
  ProcessRequisitionResult,
  ProcessLicenseResult,
  ProcessCertificationResult,
} from "./types";
