import { db } from "./index";
import type {
  MatchType,
  DocumentStatus,
  RequirementLevel,
  ContractType,
  SourceFile,
} from "../types";

// ============================================================================
// Type Definitions
// ============================================================================

export type Facility = {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  aliases: string[];
  created_at: string;
  updated_at: string;
};

export type CanonicalJobTitle = {
  id: string;
  name: string;
  abbreviation: string;
  aliases: string[];
  category: string | null;
  created_at: string;
};

export type CanonicalLicense = {
  id: string;
  name: string;
  abbreviation: string;
  aliases: string[];
  created_at: string;
};

export type CanonicalCertification = {
  id: string;
  name: string;
  abbreviation: string;
  issuing_organization: string | null;
  aliases: string[];
  created_at: string;
};

export type Candidate = {
  id: string;
  status: DocumentStatus;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  canonical_job_title_id: string | null;
  job_title_match_type: MatchType | null;
  raw_job_title: string | null;
  primary_specialty: string | null;
  years_of_experience: number | null;
  raw_extraction: unknown;
  source_files: SourceFile[] | null;
  created_at: string;
  updated_at: string;
};

export type CandidateLicense = {
  id: string;
  candidate_id: string;
  status: DocumentStatus;
  canonical_license_id: string | null;
  license_match_type: MatchType | null;
  raw_name: string;
  state: string | null;
  license_number: string | null;
  expiration_date: string | null;
  is_compact: boolean;
  source_file: SourceFile | null;
  created_at: string;
};

export type CandidateCertification = {
  id: string;
  candidate_id: string;
  status: DocumentStatus;
  canonical_certification_id: string | null;
  cert_match_type: MatchType | null;
  raw_name: string;
  issuing_organization: string | null;
  expiration_date: string | null;
  source_file: SourceFile | null;
  created_at: string;
};

export type Requisition = {
  id: string;
  status: DocumentStatus;
  facility_id: string | null;
  facility_match_type: MatchType | null;
  raw_facility_name: string | null;
  canonical_job_title_id: string | null;
  job_title_match_type: MatchType | null;
  job_title: string;
  department: string | null;
  location: string | null;
  state: string | null;
  number_of_positions: number | null;
  shift_type: string | null;
  contract_type: ContractType | null;
  start_date: string | null;
  end_date: string | null;
  expires_at: string | null;
  duration: string | null;
  pay_rate: string | null;
  bill_rate: string | null;
  benefits_offered: string[] | null;
  experience_required: string | null;
  urgency: string | null;
  notes: string | null;
  raw_extraction: unknown;
  source_files: SourceFile[] | null;
  created_at: string;
  updated_at: string;
};

export type RequisitionLicense = {
  id: string;
  requisition_id: string;
  canonical_license_id: string | null;
  license_match_type: MatchType | null;
  raw_name: string;
  state: string | null;
  requirement_level: RequirementLevel;
  created_at: string;
};

export type RequisitionCertification = {
  id: string;
  requisition_id: string;
  canonical_certification_id: string | null;
  cert_match_type: MatchType | null;
  raw_name: string;
  requirement_level: RequirementLevel;
  created_at: string;
};

// Join types
type CandidateWithJobTitle = Candidate & {
  canonical_job_title: CanonicalJobTitle | null;
};

type CandidateLicenseWithCanonical = CandidateLicense & {
  canonical_license: CanonicalLicense | null;
};

type CandidateCertificationWithCanonical = CandidateCertification & {
  canonical_certification: CanonicalCertification | null;
};

type RequisitionWithRelations = Requisition & {
  facility: Facility | null;
  canonical_job_title: CanonicalJobTitle | null;
};

type RequisitionLicenseWithCanonical = RequisitionLicense & {
  canonical_license: CanonicalLicense | null;
};

type RequisitionCertificationWithCanonical = RequisitionCertification & {
  canonical_certification: CanonicalCertification | null;
};

// ============================================================================
// Facilities
// ============================================================================

export const facilities = {
  async list(): Promise<Facility[]> {
    const { data, error } = await db
      .from("facilities")
      .select("*")
      .order("name");
    if (error) throw error;
    return data;
  },

  async get(id: string): Promise<Facility> {
    const { data, error } = await db
      .from("facilities")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(
    facility: Omit<Facility, "id" | "created_at" | "updated_at">,
  ): Promise<Facility> {
    const { data, error } = await db
      .from("facilities")
      .insert(facility)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(
    id: string,
    facility: Partial<Omit<Facility, "id" | "created_at">>,
  ): Promise<Facility> {
    const { data, error } = await db
      .from("facilities")
      .update({ ...facility, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await db.from("facilities").delete().eq("id", id);
    if (error) throw error;
  },
};

// ============================================================================
// Canonical Job Titles
// ============================================================================

export const canonicalJobTitles = {
  async list(): Promise<CanonicalJobTitle[]> {
    const { data, error } = await db
      .from("canonical_job_titles")
      .select("*")
      .order("name");
    if (error) throw error;
    return data;
  },

  async get(id: string): Promise<CanonicalJobTitle> {
    const { data, error } = await db
      .from("canonical_job_titles")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(
    jobTitle: Omit<CanonicalJobTitle, "id" | "created_at">,
  ): Promise<CanonicalJobTitle> {
    const { data, error } = await db
      .from("canonical_job_titles")
      .insert(jobTitle)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(
    id: string,
    jobTitle: Partial<Omit<CanonicalJobTitle, "id" | "created_at">>,
  ): Promise<CanonicalJobTitle> {
    const { data, error } = await db
      .from("canonical_job_titles")
      .update(jobTitle)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await db
      .from("canonical_job_titles")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },
};

// ============================================================================
// Canonical Licenses
// ============================================================================

export const canonicalLicenses = {
  async list(): Promise<CanonicalLicense[]> {
    const { data, error } = await db
      .from("canonical_licenses")
      .select("*")
      .order("name");
    if (error) throw error;
    return data;
  },

  async get(id: string): Promise<CanonicalLicense> {
    const { data, error } = await db
      .from("canonical_licenses")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(
    license: Omit<CanonicalLicense, "id" | "created_at">,
  ): Promise<CanonicalLicense> {
    const { data, error } = await db
      .from("canonical_licenses")
      .insert(license)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(
    id: string,
    license: Partial<Omit<CanonicalLicense, "id" | "created_at">>,
  ): Promise<CanonicalLicense> {
    const { data, error } = await db
      .from("canonical_licenses")
      .update(license)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await db
      .from("canonical_licenses")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },
};

// ============================================================================
// Canonical Certifications
// ============================================================================

export const canonicalCertifications = {
  async list(): Promise<CanonicalCertification[]> {
    const { data, error } = await db
      .from("canonical_certifications")
      .select("*")
      .order("name");
    if (error) throw error;
    return data;
  },

  async get(id: string): Promise<CanonicalCertification> {
    const { data, error } = await db
      .from("canonical_certifications")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(
    cert: Omit<CanonicalCertification, "id" | "created_at">,
  ): Promise<CanonicalCertification> {
    const { data, error } = await db
      .from("canonical_certifications")
      .insert(cert)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(
    id: string,
    cert: Partial<Omit<CanonicalCertification, "id" | "created_at">>,
  ): Promise<CanonicalCertification> {
    const { data, error } = await db
      .from("canonical_certifications")
      .update(cert)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await db
      .from("canonical_certifications")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },
};

// ============================================================================
// Candidates
// ============================================================================

export const candidates = {
  async list(filters?: {
    status?: DocumentStatus;
  }): Promise<CandidateWithJobTitle[]> {
    let query = db
      .from("candidates")
      .select("*, canonical_job_title:canonical_job_titles(*)");

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });
    if (error) throw error;
    return data;
  },

  async get(id: string): Promise<Candidate> {
    const { data, error } = await db
      .from("candidates")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },

  async getWithRelations(id: string): Promise<
    CandidateWithJobTitle & {
      licenses: CandidateLicenseWithCanonical[];
      certifications: CandidateCertificationWithCanonical[];
    }
  > {
    const [candidate, licenses, certifications] = await Promise.all([
      db
        .from("candidates")
        .select("*, canonical_job_title:canonical_job_titles(*)")
        .eq("id", id)
        .single(),
      db
        .from("candidate_licenses")
        .select("*, canonical_license:canonical_licenses(*)")
        .eq("candidate_id", id),
      db
        .from("candidate_certifications")
        .select("*, canonical_certification:canonical_certifications(*)")
        .eq("candidate_id", id),
    ]);
    if (candidate.error) throw candidate.error;
    if (licenses.error) throw licenses.error;
    if (certifications.error) throw certifications.error;
    return {
      ...candidate.data,
      licenses: licenses.data,
      certifications: certifications.data,
    };
  },

  async create(
    candidate: Omit<Candidate, "id" | "created_at" | "updated_at">,
    licenses?: Omit<CandidateLicense, "id" | "candidate_id" | "created_at">[],
    certifications?: Omit<
      CandidateCertification,
      "id" | "candidate_id" | "created_at"
    >[],
  ) {
    const { data, error } = await db
      .from("candidates")
      .insert(candidate)
      .select()
      .single();
    if (error) throw error;

    if (licenses?.length) {
      const licensesWithCandidate = licenses.map((l) => ({
        ...l,
        candidate_id: data.id,
      }));
      const { error: licenseError } = await db
        .from("candidate_licenses")
        .insert(licensesWithCandidate);
      if (licenseError) throw licenseError;
    }

    if (certifications?.length) {
      const certsWithCandidate = certifications.map((c) => ({
        ...c,
        candidate_id: data.id,
      }));
      const { error: certError } = await db
        .from("candidate_certifications")
        .insert(certsWithCandidate);
      if (certError) throw certError;
    }

    return this.getWithRelations(data.id);
  },

  async update(
    id: string,
    candidate: Partial<Omit<Candidate, "id" | "created_at">>,
  ): Promise<Candidate> {
    const { data, error } = await db
      .from("candidates")
      .update({ ...candidate, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateStatus(id: string, status: DocumentStatus): Promise<Candidate> {
    return this.update(id, { status });
  },

  async delete(id: string): Promise<void> {
    const { error } = await db.from("candidates").delete().eq("id", id);
    if (error) throw error;
  },

  async addLicense(
    candidateId: string,
    license: Omit<CandidateLicense, "id" | "candidate_id" | "created_at">,
  ): Promise<CandidateLicenseWithCanonical> {
    const { data, error } = await db
      .from("candidate_licenses")
      .insert({ ...license, candidate_id: candidateId })
      .select("*, canonical_license:canonical_licenses(*)")
      .single();
    if (error) throw error;
    return data;
  },

  async updateLicense(
    licenseId: string,
    updates: Partial<Omit<CandidateLicense, "id" | "candidate_id" | "created_at">>,
  ): Promise<CandidateLicense> {
    const { data, error } = await db
      .from("candidate_licenses")
      .update(updates)
      .eq("id", licenseId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteLicense(licenseId: string): Promise<void> {
    const { error } = await db
      .from("candidate_licenses")
      .delete()
      .eq("id", licenseId);
    if (error) throw error;
  },

  async addCertification(
    candidateId: string,
    certification: Omit<
      CandidateCertification,
      "id" | "candidate_id" | "created_at"
    >,
  ): Promise<CandidateCertificationWithCanonical> {
    const { data, error } = await db
      .from("candidate_certifications")
      .insert({ ...certification, candidate_id: candidateId })
      .select("*, canonical_certification:canonical_certifications(*)")
      .single();
    if (error) throw error;
    return data;
  },

  async updateCertification(
    certificationId: string,
    updates: Partial<Omit<CandidateCertification, "id" | "candidate_id" | "created_at">>,
  ): Promise<CandidateCertification> {
    const { data, error } = await db
      .from("candidate_certifications")
      .update(updates)
      .eq("id", certificationId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteCertification(certificationId: string): Promise<void> {
    const { error } = await db
      .from("candidate_certifications")
      .delete()
      .eq("id", certificationId);
    if (error) throw error;
  },
};

// ============================================================================
// Requisitions
// ============================================================================

export const requisitions = {
  async list(filters?: {
    status?: DocumentStatus;
    facilityId?: string;
    notExpired?: boolean;
  }): Promise<RequisitionWithRelations[]> {
    let query = db
      .from("requisitions")
      .select(
        "*, facility:facilities(*), canonical_job_title:canonical_job_titles(*)",
      );

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }
    if (filters?.facilityId) {
      query = query.eq("facility_id", filters.facilityId);
    }
    if (filters?.notExpired) {
      query = query.or(
        `expires_at.is.null,expires_at.gt.${new Date().toISOString()}`,
      );
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });
    if (error) throw error;
    return data;
  },

  async get(id: string): Promise<Requisition> {
    const { data, error } = await db
      .from("requisitions")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },

  async getWithRelations(id: string): Promise<
    RequisitionWithRelations & {
      licenses: RequisitionLicenseWithCanonical[];
      certifications: RequisitionCertificationWithCanonical[];
    }
  > {
    const [requisition, licenses, certifications] = await Promise.all([
      db
        .from("requisitions")
        .select(
          "*, facility:facilities(*), canonical_job_title:canonical_job_titles(*)",
        )
        .eq("id", id)
        .single(),
      db
        .from("requisition_licenses")
        .select("*, canonical_license:canonical_licenses(*)")
        .eq("requisition_id", id),
      db
        .from("requisition_certifications")
        .select("*, canonical_certification:canonical_certifications(*)")
        .eq("requisition_id", id),
    ]);
    if (requisition.error) throw requisition.error;
    if (licenses.error) throw licenses.error;
    if (certifications.error) throw certifications.error;
    return {
      ...requisition.data,
      licenses: licenses.data,
      certifications: certifications.data,
    };
  },

  async create(
    requisition: Omit<Requisition, "id" | "created_at" | "updated_at">,
    licenses?: Omit<RequisitionLicense, "id" | "requisition_id" | "created_at">[],
    certifications?: Omit<
      RequisitionCertification,
      "id" | "requisition_id" | "created_at"
    >[],
  ) {
    const { data, error } = await db
      .from("requisitions")
      .insert(requisition)
      .select()
      .single();
    if (error) throw error;

    if (licenses?.length) {
      const licensesWithReq = licenses.map((l) => ({
        ...l,
        requisition_id: data.id,
      }));
      const { error: licenseError } = await db
        .from("requisition_licenses")
        .insert(licensesWithReq);
      if (licenseError) throw licenseError;
    }

    if (certifications?.length) {
      const certsWithReq = certifications.map((c) => ({
        ...c,
        requisition_id: data.id,
      }));
      const { error: certError } = await db
        .from("requisition_certifications")
        .insert(certsWithReq);
      if (certError) throw certError;
    }

    return this.getWithRelations(data.id);
  },

  async update(
    id: string,
    requisition: Partial<Omit<Requisition, "id" | "created_at">>,
  ): Promise<Requisition> {
    const { data, error } = await db
      .from("requisitions")
      .update({ ...requisition, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateStatus(id: string, status: DocumentStatus): Promise<Requisition> {
    return this.update(id, { status });
  },

  async delete(id: string): Promise<void> {
    const { error } = await db.from("requisitions").delete().eq("id", id);
    if (error) throw error;
  },
};
