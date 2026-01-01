import { useMemo, useState } from "react";
import { extractPdfs, uploadFile } from "@/lib/api";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { persistTranscriptToDb } from "@/lib/persistTranscript";
import { useToast } from "@/hooks/use-toast";

type ExtractResponse = any;

/**
 * docs: [{ file_name, classified_as }]
 * classifiedAs examples: "bank_receipt", "transcript"
 */
function pickFileByClassifier(files: File[], docs: any[], classifiedAs: string): File | undefined {
  const doc = docs?.find((d: any) => d?.classified_as === classifiedAs);
  if (!doc?.file_name) return undefined;
  return files.find((f) => f.name === doc.file_name);
}

export default function NewClaimWithUpload() {
  // ---------- Hooks ----------
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // ---------- Upload & extraction state ----------
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ExtractResponse | null>(null);

  // ---------- Submit state ----------
  const [submitting, setSubmitting] = useState(false);

  // ---------- Claim inputs ----------
  const [claimType, setClaimType] = useState("Insurance");
  const [claimPeriod, setClaimPeriod] = useState("");
  const [description, setDescription] = useState("");

  // ---------- Derived values ----------
  const docs: any[] = data?.documents ?? [];
  const money = data?.computed?.money;
  const ectsBySemester = data?.computed?.transcript?.ects_by_semester ?? {};
  const semesters = useMemo(() => Object.keys(ectsBySemester), [ectsBySemester]);

  async function onExtract() {
    setError(null);
    
    if (!files.length) {
      setError("Please select at least one PDF.");
      return;
    }

    setLoading(true);
    try {
      const result = await extractPdfs(files);
      setData(result);

      // optional: auto-suggest claim period if exactly one semester exists
      const semesters = Object.keys(ectsBySemester);
      if (!claimPeriod && semesters.length === 1) {
        setClaimPeriod(semesters[0]);
      }

      // Auto pick claimType based on totals
      const m = result?.computed?.money;
      const hasInsurance = Number(m?.insurance_total ?? 0) > 0;
      const hasTuition = Number(m?.semester_fee_total ?? 0) > 0;

      if (hasTuition && !hasInsurance) setClaimType("Tuition Fee");
      else if (hasInsurance && !hasTuition) setClaimType("Insurance");
      else if (hasInsurance || hasTuition) setClaimType("Tuition Fee & Insurance");

    } catch (e: any) {
      setError(e?.message || "Failed to extract PDFs");
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit() {
    if (!data) {
      setError("Extract first");
      return;
    }

    if (!claimPeriod.trim()) {
      setError("Claim period required");
      return;
    }

    // Bank info comes from user profile (same logic as old ClaimForm)
    const bankName = user?.bankName ?? "";
    const bankAddress = user?.bankAddress ?? "";
    const accountNumber = user?.accountNumber ?? "";
    const swiftCode = user?.swiftCode ?? "";

    if (!bankName || !bankAddress || !accountNumber || !swiftCode) {
      setError("Missing bank info");
      return;
    }

    const total = Number(money?.grand_total ?? 0);
    if (!Number.isFinite(total) || total <= 0) {
      setError("Invalid total");
      return;
    }

    setSubmitting(true);
    try {
      // Upload stored files to Node so we can save receiptFile/supportingDocFile fields
      const receiptPdf = pickFileByClassifier(files, docs, "bank_receipt") || files[0];
      const transcriptPdf = pickFileByClassifier(files, docs, "transcript");

      const receiptUpload = await uploadFile(receiptPdf);
      const transcriptUpload = transcriptPdf ? await uploadFile(transcriptPdf) : null;

      // Create claim
      const claimPayload = {
        claimType,
        amount: total,
        claimPeriod: claimPeriod.trim(),
        description: description?.trim() || "",
        receiptFile: receiptUpload.fileUrl,
        supportingDocFile: transcriptUpload?.fileUrl || "",
        bankName,
        bankAddress,
        accountNumber,
        swiftCode,
      };

      const claimRes = await apiRequest("POST", "/api/claims", claimPayload);
      if (!claimRes.ok) {
        const err = await claimRes.text().catch(() => "");
        throw new Error(err || "Claim submit failed");
      }
      const createdClaim = await claimRes.json();

      // save transcript -> academic-records + courses
      if (data?.computed?.transcript?.semesters && user?.id) {
        await persistTranscriptToDb({ semesters: data?.computed?.transcript.semesters }, user.id);
      }

      // Refresh lists
      queryClient.invalidateQueries({ queryKey: ["/api/claims"] });
      queryClient.invalidateQueries({ queryKey: ["/api/academic-records"] });

      toast({
        title: "Submitted",
        description: `Claim created (ID: ${createdClaim?.id}). Transcript saved.`,
      });

      setLocation("/history");
    } catch (e: any) {
      setError("Submit failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full pb-8">
      <div className="px-4 py-6 container mx-auto max-w-4xl space-y-6">
        <div>
          <h2 className="text-2xl font-bold">New Claim (Upload + Transcript Save)</h2>
          <p className="text-gray-600">
            Upload PDFs (bank receipt + transcript). We extract totals and semesters, then submit claim and save courses.
          </p>
        </div>

        {/* Upload */}
        <div className="bg-white rounded-lg shadow p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Upload PDFs</label>
            <input
              type="file"
              accept="application/pdf"
              multiple
              onChange={(e) => {
                const list = e.target.files ? Array.from(e.target.files) : [];
                setFiles(list);
              }}
            />
            <p className="text-xs text-gray-500 mt-2">
              Tip: you can select multiple PDFs at once.
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={onExtract} disabled={loading}>
              {loading ? "Extracting..." : "Extract from PDFs"}
            </Button>
          </div>
        </div>

        {/* Extracted summary */}
        {data && (
          <div className="bg-white rounded-lg shadow p-5 space-y-4">
            <h3 className="text-lg font-semibold">Extracted Summary</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="border rounded p-3">
                <div className="text-xs text-gray-500">Insurance total</div>
                <div className="text-xl font-bold">{money?.insurance_total ?? 0}</div>
              </div>
              <div className="border rounded p-3">
                <div className="text-xs text-gray-500">Semester fee total</div>
                <div className="text-xl font-bold">{money?.semester_fee_total ?? 0}</div>
              </div>
              <div className="border rounded p-3">
                <div className="text-xs text-gray-500">Grand total</div>
                <div className="text-xl font-bold">{money?.grand_total ?? 0}</div>
              </div>
            </div>

            <div className="border rounded p-3">
              <div className="font-medium mb-2">ECTS by semester</div>
              {semesters.length === 0 ? (
                <p className="text-sm text-gray-600">No transcript data detected.</p>
              ) : (
                <ul className="text-sm space-y-1">
                  {Object.entries(ectsBySemester).map(([sem, ects]) => (
                    <li key={sem} className="flex justify-between">
                      <span>{sem}</span>
                      <span>{Number(ects).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Claim details */}
        <div className="bg-white rounded-lg shadow p-5 space-y-4">
          <h3 className="text-lg font-semibold">Claim Details</h3>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Claim Period / Semester</label>
            <Input
              value={claimPeriod}
              onChange={(e) => setClaimPeriod(e.target.value)}
              placeholder="e.g. WS2024, SS2025"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Anything you want to add..."
              className="min-h-[100px]"
            />
          </div>

          <Button onClick={onSubmit} disabled={!data || submitting}>
            {submitting ? "Submitting..." : "Submit Claim + Save Transcript"}
          </Button>

          {!data && (
            <p className="text-xs text-gray-500">
              Extract PDFs first before submitting.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
