import { useState } from "react";
import { extractPdfs } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type ExtractResponse = any;

export default function NewClaimWithUpload() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ExtractResponse | null>(null);

  // editable fields (user can override AI)
  const [claimPeriod, setClaimPeriod] = useState("");
  const [description, setDescription] = useState("");

  const money = data?.computed?.money;
  const ectsBySemester = data?.computed?.transcript?.ects_by_semester ?? {};

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
    } catch (e: any) {
      setError(e?.message || "Failed to extract PDFs");
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit() {
    // Next step: wire this to POST /api/claims
    alert(
      JSON.stringify(
        {
          claimPeriod,
          description,
          extractedTotals: money,
          ectsBySemester,
        },
        null,
        2
      )
    );
  }

  return (
    <div className="w-full pb-8">
      <div className="px-4 py-6 container mx-auto max-w-4xl space-y-6">
        <div>
          <h2 className="text-2xl font-bold">New Claim (Upload + Auto-fill)</h2>
          <p className="text-gray-600">
            Upload your bank receipt and transcript PDFs. We’ll extract totals and semester credits.
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
            {data && (
              <Button
                variant="outline"
                onClick={() => {
                  setData(null);
                  setError(null);
                }}
              >
                Clear
              </Button>
            )}
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}
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
              {Object.keys(ectsBySemester).length === 0 ? (
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

            <details className="text-sm">
              <summary className="cursor-pointer text-gray-700">
                Show raw JSON (debug)
              </summary>
              <pre className="mt-2 whitespace-pre-wrap">
                {JSON.stringify(data, null, 2)}
              </pre>
            </details>
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

          <Button onClick={onSubmit} disabled={!data}>
            Submit Claim (next step)
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
