-- Enable pg_trgm extension for fuzzy matching (must be first)
create extension if not exists pg_trgm;

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Match type enum for canonicalization tracking
create type match_type as enum ('exact', 'fuzzy', 'ai', 'manual', 'none');

-- Document status enum (shared by candidates, requisitions, and compliance docs)
create type document_status as enum ('pending_review', 'active', 'archived');

-- Contract type enum for requisitions
create type contract_type as enum ('permanent', 'travel', 'contract', 'per-diem');

-- Requirement level for licenses/certifications in requisitions
create type requirement_level as enum ('required', 'preferred');

-- ============================================================================
-- CANONICAL TABLES (Reference Data)
-- ============================================================================

-- Facilities
create table facilities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text,
  state char(2), -- Standardized 2-letter state code
  aliases text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Canonical Job Titles
create table canonical_job_titles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  abbreviation text not null,
  aliases text[] default '{}',
  category text,
  created_at timestamptz default now()
);

-- Canonical Licenses
create table canonical_licenses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  abbreviation text not null,
  aliases text[] default '{}',
  created_at timestamptz default now()
);

-- Canonical Certifications
create table canonical_certifications (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  abbreviation text not null,
  issuing_organization text,
  aliases text[] default '{}',
  created_at timestamptz default now()
);

-- ============================================================================
-- CANDIDATES
-- ============================================================================

create table candidates (
  id uuid primary key default gen_random_uuid(),
  status document_status not null default 'pending_review',

  -- Personal info
  first_name text not null,
  last_name text not null,
  email text,
  phone text,

  -- Location (standardized)
  city text,
  state char(2), -- Standardized 2-letter state code

  -- Professional info
  canonical_job_title_id uuid references canonical_job_titles(id),
  job_title_match_type match_type,
  raw_job_title text, -- Original extracted value
  primary_specialty text,
  years_of_experience integer,

  -- Extraction metadata
  raw_extraction jsonb, -- Full AI extraction for reference
  source_files jsonb, -- Array of {storage_path, original_filename, mime_type}

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Candidate Licenses (compliance documents)
create table candidate_licenses (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references candidates(id) on delete cascade,
  status document_status not null default 'pending_review',

  -- Canonicalization
  canonical_license_id uuid references canonical_licenses(id),
  license_match_type match_type,
  raw_name text not null, -- Original extracted value

  -- License details
  state char(2), -- State where license is valid (standardized)
  license_number text,
  expiration_date date,
  is_compact boolean default false,

  -- Source tracking
  source_file jsonb, -- {storage_path, original_filename, mime_type}

  created_at timestamptz default now()
);

-- Candidate Certifications (compliance documents)
create table candidate_certifications (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references candidates(id) on delete cascade,
  status document_status not null default 'pending_review',

  -- Canonicalization
  canonical_certification_id uuid references canonical_certifications(id),
  cert_match_type match_type,
  raw_name text not null, -- Original extracted value

  -- Certification details
  issuing_organization text,
  expiration_date date,

  -- Source tracking
  source_file jsonb, -- {storage_path, original_filename, mime_type}

  created_at timestamptz default now()
);

-- ============================================================================
-- REQUISITIONS
-- ============================================================================

create table requisitions (
  id uuid primary key default gen_random_uuid(),
  status document_status not null default 'pending_review',

  -- Facility (canonicalized)
  facility_id uuid references facilities(id),
  facility_match_type match_type,
  raw_facility_name text, -- Original extracted value

  -- Job title (canonicalized)
  canonical_job_title_id uuid references canonical_job_titles(id),
  job_title_match_type match_type,
  job_title text not null, -- Display title (may be raw or canonical)

  -- Position details
  department text,
  location text, -- Full location string from source
  state char(2), -- Standardized state code for matching
  number_of_positions integer default 1,

  -- Schedule
  shift_type text,
  contract_type contract_type,

  -- Dates
  start_date date,
  end_date date,
  expires_at timestamptz,
  duration text, -- e.g., "13 weeks"

  -- Compensation
  pay_rate text,
  bill_rate text,
  benefits_offered text[],

  -- Requirements
  experience_required text,

  -- Meta
  urgency text,
  notes text,

  -- Extraction metadata
  raw_extraction jsonb,
  source_files jsonb,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Requisition License Requirements
create table requisition_licenses (
  id uuid primary key default gen_random_uuid(),
  requisition_id uuid not null references requisitions(id) on delete cascade,

  -- Canonicalization
  canonical_license_id uuid references canonical_licenses(id),
  license_match_type match_type,
  raw_name text not null,

  -- Requirement details
  state char(2), -- Required state (standardized), null = any state
  requirement_level requirement_level not null default 'required',

  created_at timestamptz default now()
);

-- Requisition Certification Requirements
create table requisition_certifications (
  id uuid primary key default gen_random_uuid(),
  requisition_id uuid not null references requisitions(id) on delete cascade,

  -- Canonicalization
  canonical_certification_id uuid references canonical_certifications(id),
  cert_match_type match_type,
  raw_name text not null,

  -- Requirement details
  requirement_level requirement_level not null default 'required',

  created_at timestamptz default now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Facilities
create index idx_facilities_name on facilities using gin (name gin_trgm_ops);
create index idx_facilities_aliases on facilities using gin (aliases);
create index idx_facilities_state on facilities(state);

-- Canonical tables
create index idx_canonical_job_titles_name on canonical_job_titles(name);
create index idx_canonical_job_titles_abbreviation on canonical_job_titles(abbreviation);
create index idx_canonical_job_titles_aliases on canonical_job_titles using gin (aliases);

create index idx_canonical_licenses_abbreviation on canonical_licenses(abbreviation);
create index idx_canonical_licenses_aliases on canonical_licenses using gin (aliases);

create index idx_canonical_certifications_abbreviation on canonical_certifications(abbreviation);
create index idx_canonical_certifications_aliases on canonical_certifications using gin (aliases);

-- Candidates
create index idx_candidates_status on candidates(status);
create index idx_candidates_state on candidates(state);
create index idx_candidates_canonical_job_title_id on candidates(canonical_job_title_id);

-- Candidate licenses
create index idx_candidate_licenses_candidate_id on candidate_licenses(candidate_id);
create index idx_candidate_licenses_canonical_id on candidate_licenses(canonical_license_id);
create index idx_candidate_licenses_status on candidate_licenses(status);
create index idx_candidate_licenses_state on candidate_licenses(state);
create index idx_candidate_licenses_expiration on candidate_licenses(expiration_date);

-- Candidate certifications
create index idx_candidate_certifications_candidate_id on candidate_certifications(candidate_id);
create index idx_candidate_certifications_canonical_id on candidate_certifications(canonical_certification_id);
create index idx_candidate_certifications_status on candidate_certifications(status);
create index idx_candidate_certifications_expiration on candidate_certifications(expiration_date);

-- Requisitions
create index idx_requisitions_status on requisitions(status);
create index idx_requisitions_state on requisitions(state);
create index idx_requisitions_facility_id on requisitions(facility_id);
create index idx_requisitions_canonical_job_title_id on requisitions(canonical_job_title_id);
create index idx_requisitions_expires_at on requisitions(expires_at);

-- Requisition requirements
create index idx_requisition_licenses_requisition_id on requisition_licenses(requisition_id);
create index idx_requisition_licenses_canonical_id on requisition_licenses(canonical_license_id);

create index idx_requisition_certifications_requisition_id on requisition_certifications(requisition_id);
create index idx_requisition_certifications_canonical_id on requisition_certifications(canonical_certification_id);
