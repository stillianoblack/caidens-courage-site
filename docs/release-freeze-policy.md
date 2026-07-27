# Pilot Readiness v1.0 Release Freeze Policy

After Pilot Readiness v1.0 is approved, only severity-ranked bug fixes may be added before pilot launch.

The freeze excludes new infrastructure, navigation redesigns, schema expansion, analytics dashboards, and major features. Pilot Insights and branded shareout PDFs remain Phase 3 and Phase 4 work.

Every emergency defect requires:

- an isolated branch from the published production commit;
- an exact changed-file manifest;
- a documented severity and reproduced failure;
- targeted tests for the changed area;
- the full test suite and production build;
- a deploy preview tied to the exact commit;
- a confirmed rollback target;
- an approved production smoke test.

Production deployment, SQL, data mutation, and customer messaging require explicit authorization from the release owner.
