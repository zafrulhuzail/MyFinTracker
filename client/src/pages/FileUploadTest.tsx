import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUpload, FileUploadResponse } from '@/components/ui/file-upload';
import { DocumentViewerDialog } from '@/components/claim/DocumentViewerDialog';

export default function FileUploadTest() {
  const [uploadedFile, setUploadedFile] = useState<FileUploadResponse | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const handleUploadComplete = (fileData: FileUploadResponse) => {
    console.log('Upload complete. File data:', fileData);
    setUploadedFile(fileData);
  };

  return (
    <div className="container py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Document Upload Test</CardTitle>
          <CardDescription>
            Test the file upload and document viewer functionality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <FileUpload 
            onUploadComplete={handleUploadComplete}
            buttonText="Upload Document"
          />

          {uploadedFile && (
            <div className="mt-4 p-4 border rounded-md">
              <h3 className="font-medium mb-2">Uploaded File:</h3>
              <div className="text-sm text-muted-foreground">
                <p><strong>Name:</strong> {uploadedFile.fileName}</p>
                <p><strong>Type:</strong> {uploadedFile.mimeType}</p>
                <p><strong>Size:</strong> {Math.round(uploadedFile.fileSize / 1024)} KB</p>
              </div>
              <button
                onClick={() => setIsViewerOpen(true)}
                className="mt-2 text-primary hover:underline text-sm"
              >
                View Document
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {uploadedFile && (
        <DocumentViewerDialog
          isOpen={isViewerOpen}
          onClose={() => setIsViewerOpen(false)}
          fileUrl={uploadedFile.fileUrl}
          fileName={uploadedFile.fileName}
          title="Document Preview"
        />
      )}
    </div>
  );
}