// Shared types for the healthcare workforce logistics system

// ============================================================================
// Core Enums
// ============================================================================

// Match types for canonicalization
export type MatchType = "exact" | "fuzzy" | "ai" | "manual" | "none";

// Document status (shared by candidates, requisitions, compliance docs)
export type DocumentStatus = "pending_review" | "active" | "archived";

// Requirement level for licenses/certifications in requisitions
export type RequirementLevel = "required" | "preferred";

// Contract types for requisitions
export type ContractType = "permanent" | "travel" | "contract" | "per-diem";

// ============================================================================
// Canonicalization
// ============================================================================

// Canonical keys for different entity types
export type CanonicalKey = "facilityName" | "licenseType" | "certType" | "jobTitle";

// Result of canonicalization attempt
export type CanonicalResult = {
  key: CanonicalKey;
  rawValue: string;
  canonicalId: string | null;
  canonicalValue: string | null;
  matchType: MatchType;
  confidence: number;
  reason: string;
};

// ============================================================================
// Extraction Types
// ============================================================================

// Field source for extracted values
export type FieldSource = "explicit" | "implicit" | "missing" | "ambiguous";

// Extracted field wrapper with source tracking
export type ExtractedField<T> = {
  value: T | null;
  source: FieldSource;
  reason: string;
};

// Parsing statistics from document extraction
export type ParsingStats = {
  explicit: number;
  implicit: number;
  ambiguous: number;
  missing: number;
};

// Canonicalization statistics
export type CanonStats = {
  resolved: number;
  unresolved: number;
  total: number;
};

// ============================================================================
// File Types
// ============================================================================

// File input for processing
export type FileInput = {
  data: string; // base64
  mimeType: string;
  filename: string;
};

// Source file reference (stored in DB)
export type SourceFile = {
  storagePath: string;
  originalFilename: string;
  mimeType: string;
};

// ============================================================================
// Processing Result Types
// ============================================================================

// Result of processing a resume
export type ProcessResumeResult = {
  candidateId: string;
  status: DocumentStatus;
  parsingStats: ParsingStats;
  canonStats: CanonStats;
  hasUnresolvedCanonicalization: boolean;
  hasAmbiguousFields: boolean;
};

// Result of processing a requisition
export type ProcessRequisitionResult = {
  requisitionId: string;
  status: DocumentStatus;
  parsingStats: ParsingStats;
  canonStats: CanonStats;
  hasUnresolvedCanonicalization: boolean;
  hasAmbiguousFields: boolean;
};

// Result of processing a license file
export type ProcessLicenseResult = {
  licenseId: string;
  candidateId: string;
  status: DocumentStatus;
  parsingStats: ParsingStats;
  canonStats: CanonStats;
  hasUnresolvedCanonicalization: boolean;
  hasAmbiguousFields: boolean;
};

// Result of processing a certification file
export type ProcessCertificationResult = {
  certificationId: string;
  candidateId: string;
  status: DocumentStatus;
  parsingStats: ParsingStats;
  canonStats: CanonStats;
  hasUnresolvedCanonicalization: boolean;
  hasAmbiguousFields: boolean;
};

// ============================================================================
// Matching Types
// ============================================================================

// Filter options for matching
export type MatchFilters = {
  // Status filter
  status?: DocumentStatus | "all";

  // Location matching
  stateMatch?: boolean; // Require state to match

  // Credential matching
  licensesMatch?: "all" | "any" | "none"; // How to match license requirements
  certificationsMatch?: "all" | "any" | "none"; // How to match cert requirements

  // Job title matching
  jobTitleMatch?: boolean; // Require canonical job title to match

  // Experience filter (for candidates)
  minExperience?: number;

  // Date filters
  availableBy?: string; // ISO date - candidate available by this date
  notExpired?: boolean; // Exclude expired requisitions
};

// Match score breakdown
export type MatchScore = {
  overall: number; // 0-100
  jobTitleScore: number; // 0-100
  licenseScore: number; // 0-100
  certificationScore: number; // 0-100
  locationScore: number; // 0-100
};

// Candidate match result (for a requisition)
export type CandidateMatch = {
  candidateId: string;
  score: MatchScore;
  matchedLicenses: string[]; // canonical_license_ids that matched
  matchedCertifications: string[]; // canonical_certification_ids that matched
  missingLicenses: string[]; // Required licenses candidate doesn't have
  missingCertifications: string[]; // Required certs candidate doesn't have
};

// Requisition match result (for a candidate)
export type RequisitionMatch = {
  requisitionId: string;
  score: MatchScore;
  matchedLicenses: string[];
  matchedCertifications: string[];
  missingLicenses: string[];
  missingCertifications: string[];
};
