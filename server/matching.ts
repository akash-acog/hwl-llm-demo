import { db } from "./db/index";
import type { DocumentStatus } from "./types";

// ============================================================================
// Types
// ============================================================================

export type MatchFilters = {
  status?: DocumentStatus;
  includeExpired?: boolean;
};

export type MatchScore = {
  overall: number; // 0-100, percentage of all requirements met
  jobTitle: number; // 0 or 100 (match or no match)
  licenses: number; // 0-100, percentage of required licenses matched
  certifications: number; // 0-100, percentage of required certs matched
  location: number; // 0 or 100 (can work in state or not)
};

export type CandidateMatch = {
  candidateId: string;
  candidateName: string;
  score: MatchScore;
  matchedLicenses: string[];
  matchedCertifications: string[];
  missingRequiredLicenses: string[];
  missingRequiredCertifications: string[];
};

export type RequisitionMatch = {
  requisitionId: string;
  jobTitle: string;
  facilityName: string | null;
  score: MatchScore;
  matchedLicenses: string[];
  matchedCertifications: string[];
  missingRequiredLicenses: string[];
  missingRequiredCertifications: string[];
};

// Internal types
type CandidateData = {
  id: string;
  first_name: string;
  last_name: string;
  status: DocumentStatus;
  state: string | null;
  canonical_job_title_id: string | null;
  licenses: Array<{
    canonical_license_id: string | null;
    state: string | null;
    is_compact: boolean;
    expiration_date: string | null;
  }>;
  certifications: Array<{
    canonical_certification_id: string | null;
    expiration_date: string | null;
  }>;
};

type RequisitionData = {
  id: string;
  job_title: string;
  raw_facility_name: string | null;
  status: DocumentStatus;
  state: string | null;
  canonical_job_title_id: string | null;
  expires_at: string | null;
  licenses: Array<{
    canonical_license_id: string | null;
    state: string | null;
    requirement_level: string;
  }>;
  certifications: Array<{
    canonical_certification_id: string | null;
    requirement_level: string;
  }>;
};

// ============================================================================
// Helpers
// ============================================================================

function isExpired(date: string | null): boolean {
  if (!date) return false;
  return new Date(date) < new Date();
}

function getValidLicenseIds(licenses: CandidateData["licenses"]): Set<string> {
  const ids = new Set<string>();
  for (const lic of licenses) {
    if (lic.canonical_license_id && !isExpired(lic.expiration_date)) {
      ids.add(lic.canonical_license_id);
    }
  }
  return ids;
}

function getValidCertIds(
  certifications: CandidateData["certifications"],
): Set<string> {
  const ids = new Set<string>();
  for (const cert of certifications) {
    if (cert.canonical_certification_id && !isExpired(cert.expiration_date)) {
      ids.add(cert.canonical_certification_id);
    }
  }
  return ids;
}

function canWorkInState(
  licenses: CandidateData["licenses"],
  state: string | null,
): boolean {
  if (!state) return true;
  return licenses.some(
    (lic) =>
      !isExpired(lic.expiration_date) &&
      (lic.state === state || lic.is_compact),
  );
}

// ============================================================================
// Matching Logic
// ============================================================================

function calculateMatch(
  candidate: CandidateData,
  requisition: RequisitionData,
): {
  score: MatchScore;
  details: Omit<CandidateMatch, "candidateId" | "candidateName" | "score">;
} {
  const requirements: number[] = [];

  // 1. Job Title (required if specified)
  let jobTitleScore = 0;
  if (requisition.canonical_job_title_id) {
    jobTitleScore =
      candidate.canonical_job_title_id === requisition.canonical_job_title_id
        ? 100
        : 0;
    requirements.push(jobTitleScore);
  }

  // 2. Location (required if specified)
  let locationScore = 0;
  if (requisition.state) {
    locationScore = canWorkInState(candidate.licenses, requisition.state)
      ? 100
      : 0;
    requirements.push(locationScore);
  }

  // 3. Licenses
  const candidateLicenseIds = getValidLicenseIds(candidate.licenses);
  const requiredLicenses = requisition.licenses.filter(
    (l) => l.requirement_level === "required" && l.canonical_license_id,
  );

  const matchedLicenses: string[] = [];
  const missingRequiredLicenses: string[] = [];

  for (const reqLic of requiredLicenses) {
    const licId = reqLic.canonical_license_id!;
    if (candidateLicenseIds.has(licId)) {
      matchedLicenses.push(licId);
      requirements.push(100);
    } else {
      missingRequiredLicenses.push(licId);
      requirements.push(0);
    }
  }

  const licenseScore =
    requiredLicenses.length > 0
      ? Math.round((matchedLicenses.length / requiredLicenses.length) * 100)
      : 100;

  // 4. Certifications
  const candidateCertIds = getValidCertIds(candidate.certifications);
  const requiredCerts = requisition.certifications.filter(
    (c) => c.requirement_level === "required" && c.canonical_certification_id,
  );

  const matchedCertifications: string[] = [];
  const missingRequiredCertifications: string[] = [];

  for (const reqCert of requiredCerts) {
    const certId = reqCert.canonical_certification_id!;
    if (candidateCertIds.has(certId)) {
      matchedCertifications.push(certId);
      requirements.push(100);
    } else {
      missingRequiredCertifications.push(certId);
      requirements.push(0);
    }
  }

  const certificationScore =
    requiredCerts.length > 0
      ? Math.round((matchedCertifications.length / requiredCerts.length) * 100)
      : 100;

  // Overall: simple average of all requirements
  const overall =
    requirements.length > 0
      ? Math.round(
          requirements.reduce((sum, score) => sum + score, 0) /
            requirements.length,
        )
      : 100; // No requirements = perfect match

  return {
    score: {
      overall,
      jobTitle: jobTitleScore,
      licenses: licenseScore,
      certifications: certificationScore,
      location: locationScore,
    },
    details: {
      matchedLicenses,
      matchedCertifications,
      missingRequiredLicenses,
      missingRequiredCertifications,
    },
  };
}

// ============================================================================
// Data Fetching
// ============================================================================

async function fetchCandidate(id: string): Promise<CandidateData | null> {
  const [candidate, licenses, certifications] = await Promise.all([
    db.from("candidates").select("*").eq("id", id).single(),
    db.from("candidate_licenses").select("*").eq("candidate_id", id),
    db.from("candidate_certifications").select("*").eq("candidate_id", id),
  ]);

  if (candidate.error) return null;

  return {
    ...candidate.data,
    licenses: licenses.data || [],
    certifications: certifications.data || [],
  };
}

async function fetchRequisition(id: string): Promise<RequisitionData | null> {
  const [requisition, licenses, certifications] = await Promise.all([
    db.from("requisitions").select("*").eq("id", id).single(),
    db.from("requisition_licenses").select("*").eq("requisition_id", id),
    db.from("requisition_certifications").select("*").eq("requisition_id", id),
  ]);

  if (requisition.error) return null;

  return {
    ...requisition.data,
    licenses: licenses.data || [],
    certifications: certifications.data || [],
  };
}

async function fetchAllCandidates(
  filters: MatchFilters,
): Promise<CandidateData[]> {
  let query = db.from("candidates").select("*");

  if (filters.status) {
    query = query.eq("status", filters.status);
  } else {
    query = query.eq("status", "active");
  }

  const { data: candidatesData, error } = await query;
  if (error || !candidatesData?.length) return [];

  const ids = candidatesData.map((c) => c.id);

  const [licenses, certifications] = await Promise.all([
    db.from("candidate_licenses").select("*").in("candidate_id", ids),
    db.from("candidate_certifications").select("*").in("candidate_id", ids),
  ]);

  const licenseMap = new Map<string, CandidateData["licenses"]>();
  const certMap = new Map<string, CandidateData["certifications"]>();

  for (const lic of licenses.data || []) {
    const arr = licenseMap.get(lic.candidate_id) || [];
    arr.push(lic);
    licenseMap.set(lic.candidate_id, arr);
  }

  for (const cert of certifications.data || []) {
    const arr = certMap.get(cert.candidate_id) || [];
    arr.push(cert);
    certMap.set(cert.candidate_id, arr);
  }

  return candidatesData.map((c) => ({
    ...c,
    licenses: licenseMap.get(c.id) || [],
    certifications: certMap.get(c.id) || [],
  }));
}

async function fetchAllRequisitions(
  filters: MatchFilters,
): Promise<RequisitionData[]> {
  let query = db.from("requisitions").select("*");

  if (filters.status) {
    query = query.eq("status", filters.status);
  } else {
    query = query.eq("status", "active");
  }

  if (!filters.includeExpired) {
    query = query.or(
      `expires_at.is.null,expires_at.gt.${new Date().toISOString()}`,
    );
  }

  const { data: requisitionsData, error } = await query;
  if (error || !requisitionsData?.length) return [];

  const ids = requisitionsData.map((r) => r.id);

  const [licenses, certifications] = await Promise.all([
    db.from("requisition_licenses").select("*").in("requisition_id", ids),
    db.from("requisition_certifications").select("*").in("requisition_id", ids),
  ]);

  const licenseMap = new Map<string, RequisitionData["licenses"]>();
  const certMap = new Map<string, RequisitionData["certifications"]>();

  for (const lic of licenses.data || []) {
    const arr = licenseMap.get(lic.requisition_id) || [];
    arr.push(lic);
    licenseMap.set(lic.requisition_id, arr);
  }

  for (const cert of certifications.data || []) {
    const arr = certMap.get(cert.requisition_id) || [];
    arr.push(cert);
    certMap.set(cert.requisition_id, arr);
  }

  return requisitionsData.map((r) => ({
    ...r,
    licenses: licenseMap.get(r.id) || [],
    certifications: certMap.get(r.id) || [],
  }));
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Find candidates matching a requisition.
 * Returns all candidates sorted by match score (% of requirements met).
 */
export async function findCandidatesForRequisition(
  requisitionId: string,
  filters: MatchFilters = {},
): Promise<CandidateMatch[]> {
  const requisition = await fetchRequisition(requisitionId);
  if (!requisition) {
    throw new Error(`Requisition not found: ${requisitionId}`);
  }

  const candidates = await fetchAllCandidates(filters);
  const matches: CandidateMatch[] = [];

  for (const candidate of candidates) {
    const { score, details } = calculateMatch(candidate, requisition);
    matches.push({
      candidateId: candidate.id,
      candidateName: `${candidate.first_name} ${candidate.last_name}`,
      score,
      ...details,
    });
  }

  matches.sort((a, b) => b.score.overall - a.score.overall);
  return matches;
}

/**
 * Find requisitions matching a candidate.
 * Returns all requisitions sorted by match score (% of requirements met).
 */
export async function findRequisitionsForCandidate(
  candidateId: string,
  filters: MatchFilters = {},
): Promise<RequisitionMatch[]> {
  const candidate = await fetchCandidate(candidateId);
  if (!candidate) {
    throw new Error(`Candidate not found: ${candidateId}`);
  }

  const requisitions = await fetchAllRequisitions(filters);
  const matches: RequisitionMatch[] = [];

  for (const requisition of requisitions) {
    const { score, details } = calculateMatch(candidate, requisition);
    matches.push({
      requisitionId: requisition.id,
      jobTitle: requisition.job_title,
      facilityName: requisition.raw_facility_name,
      score,
      matchedLicenses: details.matchedLicenses,
      matchedCertifications: details.matchedCertifications,
      missingRequiredLicenses: details.missingRequiredLicenses,
      missingRequiredCertifications: details.missingRequiredCertifications,
    });
  }

  matches.sort((a, b) => b.score.overall - a.score.overall);
  return matches;
}

/**
 * Get detailed match between a specific candidate and requisition.
 */
export async function getMatchDetails(
  candidateId: string,
  requisitionId: string,
): Promise<CandidateMatch | null> {
  const [candidate, requisition] = await Promise.all([
    fetchCandidate(candidateId),
    fetchRequisition(requisitionId),
  ]);

  if (!candidate || !requisition) return null;

  const { score, details } = calculateMatch(candidate, requisition);
  return {
    candidateId: candidate.id,
    candidateName: `${candidate.first_name} ${candidate.last_name}`,
    score,
    ...details,
  };
}
