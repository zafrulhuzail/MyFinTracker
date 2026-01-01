import { apiRequest } from "@/lib/queryClient";

type ModuleRow = {
  semester: string;        // e.g. "WS2024"
  module_code?: string;
  module_name?: string;
  grade?: string | null;   // "3,00" etc
  ects?: number | null;
};

type TranscriptComputed = {
  semesters: Record<string, ModuleRow[]>; // { "WS2024": [...], "SS2025": [...] }
};

function parseSemesterKey(key: string): { semester: "Winter" | "Summer"; year: string } {
  // WS2024 / SS2024
  const m = key.trim().match(/^(WS|SS)\s*(\d{4})$/i);
  if (!m) return { semester: "Winter", year: key.replace(/\D/g, "") || "0000" };

  const term = m[1].toUpperCase();
  const year = m[2];
  return { semester: term === "WS" ? "Winter" : "Summer", year };
}

// replace "," with "."
function normalizeGrade(g?: string | null): string {
  if (!g) return "";
  return String(g).trim().replace(",", ".");
}

function inferStatus(gradeRaw?: string | null, ects?: number | null): "Passed" | "In Progress" {
  const grade = normalizeGrade(gradeRaw);

  if (!grade || grade === "0" || ects === 0) return "In Progress";
  return "Passed";
}

/**
 * Persist transcript semesters->academic records, and modules->courses.
 *
 * Requires:
 * - POST /api/academic-records
 * - POST /api/courses
 */
export async function persistTranscriptToDb(transcript: TranscriptComputed, userId: number) {
  const semestersObj = transcript?.semesters || {};
  const results: Array<{ semesterKey: string; academicRecordId: number; coursesCreated: number }> = [];

  for (const [semesterKey, modules] of Object.entries(semestersObj)) {
    const { semester, year } = parseSemesterKey(semesterKey);

    const ectsCredits = (modules || []).reduce((sum, m) => sum + (Number(m.ects) || 0), 0);

    // Create academic record
    const recRes = await apiRequest("POST", "/api/academic-records", {
      userId,
      semester,
      year,
      ectsCredits,
    });

    if (!recRes.ok) {
      const err = await recRes.text().catch(() => "");
      throw new Error(`Failed creating academic record for ${semesterKey}: ${err}`);
    }

    const createdRecord = await recRes.json();
    const academicRecordId = createdRecord.id as number;

    // 2) Create courses for that record
    let created = 0;
    for (const m of modules || []) {
      const payload = {
        academicRecordId,
        name: (m.module_name || `Unknown Module ${m.module_code || ""}`).trim(),
        credits: Number(m.ects) || 0,
        grade: normalizeGrade(m.grade),
        status: inferStatus(m.grade, m.ects),
      };

      const cRes = await apiRequest("POST", "/api/courses", payload);
      if (!cRes.ok) {
        const err = await cRes.text().catch(() => "");
        throw new Error(`Failed creating course "${payload.name}" for ${semesterKey}: ${err}`);
      }
      created += 1;
    }

    results.push({ semesterKey, academicRecordId, coursesCreated: created });
  }

  return results;
}
