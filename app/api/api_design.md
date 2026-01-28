# API Endpoints (14 total)

### Candidates (4 endpoints)
```
POST   /api/candidates              Process resume(s) → create candidate(s)
GET    /api/candidates              List candidates with filters
GET    /api/candidates/[id]         Get candidate (use ?include for relations)
PATCH  /api/candidates/[id]         Update candidate
DELETE /api/candidates/[id]         Delete candidate
```

### Candidate Credentials (6 endpoints)
```
POST   /api/candidates/[id]/licenses         Add license (with file)
PATCH  /api/licenses/[id]                    Update license
DELETE /api/licenses/[id]                    Delete license

POST   /api/candidates/[id]/certifications   Add certification (with file)
PATCH  /api/certifications/[id]              Update certification
DELETE /api/certifications/[id]              Delete certification
```

### Requisitions (4 endpoints)
```
POST   /api/requisitions            Process requisition(s) → create requisition(s)
GET    /api/requisitions            List requisitions with filters
GET    /api/requisitions/[id]       Get requisition (use ?include for relations)
PATCH  /api/requisitions/[id]       Update requisition
DELETE /api/requisitions/[id]       Delete requisition
```

### Facilities (3 endpoints)
```
GET    /api/facilities              List all facilities
POST   /api/facilities              Create facility
PATCH  /api/facilities/[id]         Update facility
```

### Canonical Data (2 endpoints)
```
GET    /api/canonical               Get all canonical data (use ?type to filter)
POST   /api/canonical/resolve       Manually resolve canonicalization
```

### Matching (2 endpoints)
```
GET    /api/matches/candidate/[id]   Get requisition matches for candidate
GET    /api/matches/requisition/[id] Get candidate matches for requisition
```

---

**Total: 21 endpoints** (vs 60+ in original design)

Query parameters handle all the complexity:
- `?include=licenses,certifications,matches`
- `?status=active&state=CA&limit=50`
- `?type=jobTitles` for canonical data
