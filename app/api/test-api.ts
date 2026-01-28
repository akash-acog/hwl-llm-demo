#!/usr/bin/env bun
/**
 * Comprehensive API Test Script
 *
 * Tests all API endpoints with real sample data
 * Verifies extraction, canonicalization, and matching functionality
 */

import { readFileSync, readdirSync } from "fs";
import { join } from "path";

const API_BASE = "http://localhost:3000/api";

// ANSI colors for output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
};

function log(message: string, color: keyof typeof colors = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title: string) {
  log(`\n${"=".repeat(60)}`, "cyan");
  log(title, "cyan");
  log("=".repeat(60), "cyan");
}

function subsection(title: string) {
  log(`\n${title}`, "blue");
  log("-".repeat(40), "gray");
}

function success(message: string) {
  log(`✓ ${message}`, "green");
}

function error(message: string) {
  log(`✗ ${message}`, "red");
}

function info(message: string) {
  log(`  ${message}`, "gray");
}

// Helper to make API requests
async function request(
  method: string,
  path: string,
  body?: any,
  isMultipart = false
): Promise<{ success: boolean; data?: any; error?: any }> {
  try {
    const options: RequestInit = {
      method,
      headers: isMultipart ? {} : { "Content-Type": "application/json" },
    };

    if (body) {
      options.body = isMultipart ? body : JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE}${path}`, options);
    const json = await response.json();

    if (!response.ok) {
      return { success: false, error: json.error };
    }

    return { success: true, data: json.data };
  } catch (err: any) {
    return { success: false, error: { message: err.message } };
  }
}

// Helper to create FormData with files
function createFormData(files: { filename: string; path: string }[], fields?: Record<string, string>): FormData {
  const formData = new FormData();

  for (const { filename, path } of files) {
    const buffer = readFileSync(path);
    const blob = new Blob([buffer], { type: "application/pdf" });
    formData.append("files", blob, filename);
  }

  if (fields) {
    for (const [key, value] of Object.entries(fields)) {
      formData.append(key, value);
    }
  }

  return formData;
}

// Test state
const state = {
  candidateIds: [] as string[],
  requisitionIds: [] as string[],
  facilityIds: [] as string[],
  licenseIds: [] as string[],
  certificationIds: [] as string[],
};

// Test counters
const stats = {
  total: 0,
  passed: 0,
  failed: 0,
};

function assert(condition: boolean, message: string) {
  stats.total++;
  if (condition) {
    success(message);
    stats.passed++;
  } else {
    error(message);
    stats.failed++;
  }
}

// ============================================================================
// TESTS
// ============================================================================

async function testCanonicalEndpoints() {
  section("TEST 1: Canonical Data Endpoints");

  subsection("GET /api/canonical (all data)");
  const all = await request("GET", "/canonical");
  assert(all.success, "Should fetch all canonical data");
  assert(all.data?.jobTitles?.length > 0, "Should have job titles");
  assert(all.data?.licenses?.length > 0, "Should have licenses");
  assert(all.data?.certifications?.length > 0, "Should have certifications");
  assert(all.data?.facilities?.length > 0, "Should have facilities");
  info(`Found ${all.data?.jobTitles?.length} job titles, ${all.data?.licenses?.length} licenses, ${all.data?.certifications?.length} certifications`);

  subsection("GET /api/canonical?type=jobTitles");
  const jobTitles = await request("GET", "/canonical?type=jobTitles");
  assert(jobTitles.success, "Should fetch job titles only");
  assert(jobTitles.data?.jobTitles?.length > 0, "Should have job titles");

  subsection("GET /api/canonical?type=licenses");
  const licenses = await request("GET", "/canonical?type=licenses");
  assert(licenses.success, "Should fetch licenses only");
  assert(licenses.data?.licenses?.length > 0, "Should have licenses");

  subsection("GET /api/canonical?type=certifications");
  const certifications = await request("GET", "/canonical?type=certifications");
  assert(certifications.success, "Should fetch certifications only");
  assert(certifications.data?.certifications?.length > 0, "Should have certifications");
}

async function testFacilityEndpoints() {
  section("TEST 2: Facility Endpoints");

  subsection("POST /api/facilities - Create facility");
  const facility = await request("POST", "/facilities", {
    name: "Test Hospital",
    city: "San Francisco",
    state: "CA",
    aliases: ["Test", "TH"],
  });
  assert(facility.success, "Should create facility");
  assert(facility.data?.id, "Should return facility ID");
  if (facility.data?.id) {
    state.facilityIds.push(facility.data.id);
  }
  info(`Created facility: ${facility.data?.id}`);

  subsection("GET /api/facilities - List facilities");
  const facilities = await request("GET", "/facilities");
  assert(facilities.success, "Should list facilities");
  assert(facilities.data?.data?.length > 0, "Should have facilities");
  info(`Found ${facilities.data?.data?.length} facilities`);

  subsection("GET /api/facilities?state=CA - Filter by state");
  const caFacilities = await request("GET", "/facilities?state=CA");
  assert(caFacilities.success, "Should filter facilities by state");

  if (state.facilityIds[0]) {
    subsection(`GET /api/facilities/${state.facilityIds[0]} - Get facility`);
    const getFacility = await request("GET", `/facilities/${state.facilityIds[0]}`);
    assert(getFacility.success, "Should get facility");
    assert(getFacility.data?.id === state.facilityIds[0], "Should return correct facility");

    subsection(`PATCH /api/facilities/${state.facilityIds[0]} - Update facility`);
    const updateFacility = await request("PATCH", `/facilities/${state.facilityIds[0]}`, {
      name: "Updated Test Hospital",
    });
    assert(updateFacility.success, "Should update facility");
    assert(updateFacility.data?.name === "Updated Test Hospital", "Should have updated name");
  }
}

async function testCandidateProcessing() {
  section("TEST 3: Candidate Processing");

  subsection("POST /api/candidates - Process single resume");
  const resumeFiles = readdirSync("sample_data/resumes").filter((f) => f.endsWith(".pdf"));
  const firstResume = resumeFiles[0];
  const formData1 = createFormData([
    { filename: firstResume, path: join("sample_data/resumes", firstResume) },
  ]);

  const single = await request("POST", "/candidates", formData1, true);
  assert(single.success, "Should process single resume");
  assert(single.data?.processed === 1, "Should process 1 resume");
  assert(single.data?.results?.length === 1, "Should have 1 result");
  assert(single.data?.results?.[0]?.candidateId, "Should have candidate ID");

  if (single.data?.results?.[0]?.candidateId) {
    state.candidateIds.push(single.data.results[0].candidateId);
    info(`Created candidate: ${single.data.results[0].candidateId}`);
    info(`Status: ${single.data.results[0].status}`);
    info(
      `Parsing: ${single.data.results[0].parsingStats.explicit} explicit, ` +
        `${single.data.results[0].parsingStats.implicit} implicit, ` +
        `${single.data.results[0].parsingStats.ambiguous} ambiguous, ` +
        `${single.data.results[0].parsingStats.missing} missing`
    );
    info(
      `Canon: ${single.data.results[0].canonStats.resolved}/${single.data.results[0].canonStats.total} resolved`
    );
  }

  subsection("POST /api/candidates - Process multiple resumes");
  const bulkResumes = resumeFiles.slice(1, 4);
  const formData2 = createFormData(
    bulkResumes.map((f) => ({ filename: f, path: join("sample_data/resumes", f) }))
  );

  const bulk = await request("POST", "/candidates", formData2, true);
  assert(bulk.success, "Should process multiple resumes");
  assert(bulk.data?.processed === 3, "Should process 3 resumes");
  assert(bulk.data?.results?.length === 3, "Should have 3 results");

  for (const result of bulk.data?.results || []) {
    if (result.candidateId) {
      state.candidateIds.push(result.candidateId);
    }
  }
  info(`Created ${state.candidateIds.length} total candidates`);
  info(
    `Total parsing: ${bulk.data?.totalParsingStats.explicit} explicit, ` +
      `${bulk.data?.totalParsingStats.implicit} implicit`
  );
  info(`Total canon: ${bulk.data?.totalCanonStats.resolved}/${bulk.data?.totalCanonStats.total} resolved`);
}

async function testCandidateEndpoints() {
  section("TEST 4: Candidate CRUD");

  subsection("GET /api/candidates - List candidates");
  const list = await request("GET", "/candidates");
  assert(list.success, "Should list candidates");
  assert(list.data?.data?.length >= state.candidateIds.length, "Should have candidates");
  info(`Found ${list.data?.data?.length} candidates`);

  subsection("GET /api/candidates?status=active - Filter by status");
  const activeList = await request("GET", "/candidates?status=active");
  assert(activeList.success, "Should filter by status");

  subsection("GET /api/candidates?include=licenses,certifications - Include relations");
  const withRelations = await request("GET", "/candidates?include=licenses,certifications&limit=2");
  assert(withRelations.success, "Should include relations");

  if (state.candidateIds[0]) {
    const candidateId = state.candidateIds[0];

    subsection(`GET /api/candidates/${candidateId} - Get candidate`);
    const get = await request("GET", `/candidates/${candidateId}`);
    assert(get.success, "Should get candidate");
    assert(get.data?.id === candidateId, "Should return correct candidate");
    info(`Name: ${get.data?.first_name} ${get.data?.last_name}`);
    info(`Status: ${get.data?.status}`);

    subsection(`GET /api/candidates/${candidateId}?include=licenses,certifications`);
    const getWithRelations = await request("GET", `/candidates/${candidateId}?include=licenses,certifications`);
    assert(getWithRelations.success, "Should get candidate with relations");
    assert(Array.isArray(getWithRelations.data?.licenses), "Should have licenses array");
    assert(Array.isArray(getWithRelations.data?.certifications), "Should have certifications array");
    info(`Licenses: ${getWithRelations.data?.licenses?.length || 0}`);
    info(`Certifications: ${getWithRelations.data?.certifications?.length || 0}`);

    subsection(`PATCH /api/candidates/${candidateId} - Update candidate`);
    const update = await request("PATCH", `/candidates/${candidateId}`, {
      phone: "+1-555-TEST-123",
      status: "active",
    });
    assert(update.success, "Should update candidate");
    assert(update.data?.phone === "+1-555-TEST-123", "Should update phone");
  }
}

async function testRequisitionProcessing() {
  section("TEST 5: Requisition Processing");

  subsection("POST /api/requisitions - Process single requisition");
  const reqFiles = readdirSync("sample_data/requisitions").filter((f) => f.endsWith(".pdf"));
  const firstReq = reqFiles[0];
  const formData1 = createFormData([
    { filename: firstReq, path: join("sample_data/requisitions", firstReq) },
  ]);

  const single = await request("POST", "/requisitions", formData1, true);
  assert(single.success, "Should process requisition");
  assert(single.data?.totalRequisitions >= 1, "Should extract at least 1 requisition");

  for (const result of single.data?.results || []) {
    if (result.requisitionId) {
      state.requisitionIds.push(result.requisitionId);
      info(`Created requisition: ${result.requisitionId}`);
      info(`Status: ${result.status}`);
    }
  }

  subsection("POST /api/requisitions - Process with facility ID");
  if (state.facilityIds[0] && reqFiles[1]) {
    const formData2 = createFormData(
      [{ filename: reqFiles[1], path: join("sample_data/requisitions", reqFiles[1]) }],
      { facilityId: state.facilityIds[0] }
    );

    const withFacility = await request("POST", "/requisitions", formData2, true);
    assert(withFacility.success, "Should process with facility ID");
    for (const result of withFacility.data?.results || []) {
      if (result.requisitionId) {
        state.requisitionIds.push(result.requisitionId);
      }
    }
  }

  info(`Created ${state.requisitionIds.length} total requisitions`);
}

async function testRequisitionEndpoints() {
  section("TEST 6: Requisition CRUD");

  subsection("GET /api/requisitions - List requisitions");
  const list = await request("GET", "/requisitions");
  assert(list.success, "Should list requisitions");
  assert(list.data?.data?.length >= state.requisitionIds.length, "Should have requisitions");
  info(`Found ${list.data?.data?.length} requisitions`);

  subsection("GET /api/requisitions?status=active&notExpired=true - Filter");
  const filtered = await request("GET", "/requisitions?status=active&notExpired=true");
  assert(filtered.success, "Should filter requisitions");

  if (state.requisitionIds[0]) {
    const requisitionId = state.requisitionIds[0];

    subsection(`GET /api/requisitions/${requisitionId} - Get requisition`);
    const get = await request("GET", `/requisitions/${requisitionId}`);
    assert(get.success, "Should get requisition");
    assert(get.data?.id === requisitionId, "Should return correct requisition");
    info(`Job Title: ${get.data?.job_title}`);
    info(`Status: ${get.data?.status}`);

    subsection(`GET /api/requisitions/${requisitionId}?include=licenses,certifications,facility`);
    const getWithRelations = await request(
      "GET",
      `/requisitions/${requisitionId}?include=licenses,certifications,facility`
    );
    assert(getWithRelations.success, "Should get requisition with relations");
    info(`Licenses: ${getWithRelations.data?.licenses?.length || 0}`);
    info(`Certifications: ${getWithRelations.data?.certifications?.length || 0}`);

    subsection(`PATCH /api/requisitions/${requisitionId} - Update requisition`);
    const update = await request("PATCH", `/requisitions/${requisitionId}`, {
      number_of_positions: 5,
      status: "active",
    });
    assert(update.success, "Should update requisition");
    assert(update.data?.number_of_positions === 5, "Should update positions");
  }
}

async function testMatchingEndpoints() {
  section("TEST 7: Matching Endpoints");

  if (state.candidateIds[0]) {
    const candidateId = state.candidateIds[0];

    subsection(`GET /api/matches/candidate/${candidateId} - Get matches for candidate`);
    const candidateMatches = await request("GET", `/matches/candidate/${candidateId}`);
    assert(candidateMatches.success, "Should get candidate matches");
    assert(Array.isArray(candidateMatches.data?.matches), "Should have matches array");
    info(`Found ${candidateMatches.data?.matches?.length || 0} requisition matches`);

    if (candidateMatches.data?.matches?.length > 0) {
      const match = candidateMatches.data.matches[0];
      info(`Best match: ${match.score.overall}% overall`);
      info(
        `  Job title: ${match.score.jobTitleScore}%, ` +
          `Licenses: ${match.score.licenseScore}%, ` +
          `Certs: ${match.score.certificationScore}%, ` +
          `Location: ${match.score.locationScore}%`
      );
    }

    subsection(`GET /api/matches/candidate/${candidateId}?minScore=80 - Filter by score`);
    const highMatches = await request("GET", `/matches/candidate/${candidateId}?minScore=80`);
    assert(highMatches.success, "Should filter matches by score");
    info(`High-quality matches (80%+): ${highMatches.data?.matches?.length || 0}`);
  }

  if (state.requisitionIds[0]) {
    const requisitionId = state.requisitionIds[0];

    subsection(`GET /api/matches/requisition/${requisitionId} - Get matches for requisition`);
    const requisitionMatches = await request("GET", `/matches/requisition/${requisitionId}`);
    assert(requisitionMatches.success, "Should get requisition matches");
    assert(Array.isArray(requisitionMatches.data?.matches), "Should have matches array");
    info(`Found ${requisitionMatches.data?.matches?.length || 0} candidate matches`);

    if (requisitionMatches.data?.matches?.length > 0) {
      const match = requisitionMatches.data.matches[0];
      info(`Best match: ${match.score.overall}% overall`);
      info(`Matched licenses: ${match.matchedLicenses?.length || 0}`);
      info(`Missing licenses: ${match.missingLicenses?.length || 0}`);
    }
  }
}

async function testCanonicalResolution() {
  section("TEST 8: Manual Canonicalization Resolution");

  if (state.candidateIds[0]) {
    // Get candidate to check if there are unresolved canonicalizations
    const candidate = await request("GET", `/candidates/${state.candidateIds[0]}?include=licenses,certifications`);

    if (candidate.success && candidate.data?.licenses?.length > 0) {
      const license = candidate.data.licenses[0];

      if (license.canonical_license_id === null) {
        subsection("POST /api/canonical/resolve - Resolve license canonicalization");

        // Get a canonical license ID
        const canonical = await request("GET", "/canonical?type=licenses");
        if (canonical.success && canonical.data?.licenses?.length > 0) {
          const canonicalLicenseId = canonical.data.licenses[0].id;

          const resolve = await request("POST", "/canonical/resolve", {
            entityType: "license",
            entityId: license.id,
            canonicalId: canonicalLicenseId,
          });

          assert(resolve.success, "Should resolve license canonicalization");
          info(`Resolved license to: ${canonicalLicenseId}`);
        }
      } else {
        info("No unresolved license canonicalizations found");
      }
    }
  }
}

async function testCredentialManagement() {
  section("TEST 9: Credential Management");

  if (state.candidateIds[0]) {
    const candidateId = state.candidateIds[0];

    // Note: These tests would require actual license/certification files
    // For now, we'll test the endpoints are accessible
    subsection("POST /api/candidates/[id]/licenses - Endpoint exists");
    info("Skipped - requires license file");

    subsection("POST /api/candidates/[id]/certifications - Endpoint exists");
    info("Skipped - requires certification file");

    // Get candidate with credentials to test updates
    const candidate = await request("GET", `/candidates/${candidateId}?include=licenses,certifications`);

    if (candidate.success && candidate.data?.licenses?.length > 0) {
      const licenseId = candidate.data.licenses[0].id;

      subsection(`PATCH /api/licenses/${licenseId} - Update license`);
      const updateLicense = await request("PATCH", `/licenses/${licenseId}`, {
        license_number: "TEST-123-UPDATED",
      });
      assert(updateLicense.success, "Should update license");
      info(`Updated license: ${licenseId}`);
    }

    if (candidate.success && candidate.data?.certifications?.length > 0) {
      const certId = candidate.data.certifications[0].id;

      subsection(`PATCH /api/certifications/${certId} - Update certification`);
      const updateCert = await request("PATCH", `/certifications/${certId}`, {
        issuing_organization: "Updated Org",
      });
      assert(updateCert.success, "Should update certification");
      info(`Updated certification: ${certId}`);
    }
  }
}

async function testDeletion() {
  section("TEST 10: Deletion");

  // Create a test candidate to delete
  subsection("Create candidate for deletion test");
  const resumeFiles = readdirSync("sample_data/resumes").filter((f) => f.endsWith(".pdf"));
  const formData = createFormData([
    { filename: resumeFiles[0], path: join("sample_data/resumes", resumeFiles[0]) },
  ]);

  const create = await request("POST", "/candidates", formData, true);
  if (create.success && create.data?.results?.[0]?.candidateId) {
    const deleteId = create.data.results[0].candidateId;

    subsection(`DELETE /api/candidates/${deleteId} - Delete candidate`);
    const del = await request("DELETE", `/candidates/${deleteId}?deleteFiles=false`);
    assert(del.success, "Should delete candidate");
    assert(del.data?.deleted === true, "Should confirm deletion");
    info(`Deleted candidate: ${deleteId}`);

    // Verify deletion
    subsection("Verify deletion");
    const get = await request("GET", `/candidates/${deleteId}`);
    assert(!get.success, "Should not find deleted candidate");
  }

  // Test credential deletion
  if (state.candidateIds[0]) {
    const candidate = await request("GET", `/candidates/${state.candidateIds[0]}?include=licenses`);

    if (candidate.success && candidate.data?.licenses?.length > 0) {
      const licenseId = candidate.data.licenses[0].id;

      subsection(`DELETE /api/licenses/${licenseId} - Delete license`);
      const delLicense = await request("DELETE", `/licenses/${licenseId}`);
      assert(delLicense.success, "Should delete license");
      info(`Deleted license: ${licenseId}`);
    }
  }
}

async function testPaginationAndFilters() {
  section("TEST 11: Pagination and Advanced Filters");

  subsection("GET /api/candidates?limit=2&offset=0 - Pagination");
  const page1 = await request("GET", "/candidates?limit=2&offset=0");
  assert(page1.success, "Should paginate candidates");
  assert(page1.data?.pagination?.limit === 2, "Should respect limit");
  info(`Page 1: ${page1.data?.data?.length} results`);

  subsection("GET /api/candidates?limit=2&offset=2 - Next page");
  const page2 = await request("GET", "/candidates?limit=2&offset=2");
  assert(page2.success, "Should get next page");
  info(`Page 2: ${page2.data?.data?.length} results`);

  subsection("GET /api/requisitions?limit=5 - Paginate requisitions");
  const reqPage = await request("GET", "/requisitions?limit=5");
  assert(reqPage.success, "Should paginate requisitions");

  subsection("GET /api/facilities?search=Hospital - Search facilities");
  const search = await request("GET", "/facilities?search=Hospital");
  assert(search.success, "Should search facilities");
  info(`Found ${search.data?.data?.length} matching facilities`);
}

// ============================================================================
// RUN ALL TESTS
// ============================================================================

async function runAllTests() {
  log("\n╔════════════════════════════════════════════════════════════╗", "cyan");
  log("║        HEALTHCARE WORKFORCE LOGISTICS - API TESTS          ║", "cyan");
  log("╚════════════════════════════════════════════════════════════╝", "cyan");

  const startTime = Date.now();

  try {
    await testCanonicalEndpoints();
    await testFacilityEndpoints();
    await testCandidateProcessing();
    await testCandidateEndpoints();
    await testRequisitionProcessing();
    await testRequisitionEndpoints();
    await testMatchingEndpoints();
    await testCanonicalResolution();
    await testCredentialManagement();
    await testDeletion();
    await testPaginationAndFilters();
  } catch (err: any) {
    error(`\nTest execution error: ${err.message}`);
    console.error(err);
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  // Print summary
  section("TEST SUMMARY");
  log(`\nTotal Tests: ${stats.total}`, "cyan");
  log(`Passed: ${stats.passed}`, "green");
  log(`Failed: ${stats.failed}`, stats.failed > 0 ? "red" : "green");
  log(`Duration: ${duration}s`, "gray");

  if (stats.failed === 0) {
    log("\n🎉 All tests passed!", "green");
    process.exit(0);
  } else {
    log(`\n❌ ${stats.failed} test(s) failed`, "red");
    process.exit(1);
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch(`${API_BASE}/canonical`);
    if (!response.ok) {
      throw new Error("Server responded with error");
    }
  } catch (err) {
    error("Cannot connect to API server");
    error("Make sure the server is running on http://localhost:3000");
    error("Run: bun run dev");
    process.exit(1);
  }
}

// Main
async function main() {
  await checkServer();
  await runAllTests();
}

main();
