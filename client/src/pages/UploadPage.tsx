import { extractPdfs } from "../lib/api";

function UploadPage() {
  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    try {
      const result = await extractPdfs(Array.from(e.target.files));
      console.log("Extraction result:", result);
    } catch (err) {
      console.error(err);
      alert("Failed to extract PDFs");
    }
  };

  return (
    <div>
      <h1>Upload PDFs</h1>
      <input type="file" multiple accept="application/pdf" onChange={handleChange} />
    </div>
  );
}

export default UploadPage;
