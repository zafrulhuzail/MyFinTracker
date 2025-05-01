import { useState } from "react";
import { Button } from "./button";
import { Progress } from "./progress";

interface FileUploadProps {
  accept?: string;
  maxSize?: number;
  label: string;
  description?: string;
  icon?: string;
  error?: string;
  value?: string;
  onChange: (fileUrl: string) => void;
}

export function FileUpload({
  accept = ".pdf,.jpg,.jpeg,.png",
  maxSize = 5 * 1024 * 1024, // 5MB
  label,
  description = "PDF, JPG or PNG (Max. 5MB)",
  icon = "cloud_upload",
  error,
  value,
  onChange
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  
  const simulateUpload = (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulate progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        // In a real app, this would be the URL returned from the server
        onChange(`file://${file.name}`);
        setFileName(file.name);
        setIsUploading(false);
      }
    }, 200);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) return;
    
    // Check file size
    if (file.size > maxSize) {
      alert(`File size exceeds the ${maxSize / 1024 / 1024}MB limit.`);
      return;
    }
    
    simulateUpload(file);
  };
  
  return (
    <div className="relative">
      <div className={`border-2 border-dashed rounded-lg p-4 text-center ${error ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}>
        {!isUploading && !value && (
          <>
            <div className="mb-3">
              <span className="material-icons text-4xl text-gray-400">{icon}</span>
            </div>
            <p className="text-gray-600 mb-2">{label}</p>
            <p className="text-xs text-gray-500 mb-3">{description}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="bg-primary-50 text-primary border-primary-200"
              onClick={() => document.getElementById("fileInput")?.click()}
            >
              Select File
            </Button>
            <input
              id="fileInput"
              type="file"
              accept={accept}
              className="hidden"
              onChange={handleFileChange}
            />
          </>
        )}
        
        {isUploading && (
          <div className="py-3">
            <p className="text-gray-600 mb-2">Uploading...</p>
            <Progress value={uploadProgress} className="mx-auto w-4/5" />
          </div>
        )}
        
        {!isUploading && (value || fileName) && (
          <div className="py-2">
            <div className="flex items-center justify-center mb-2">
              <span className="material-icons text-green-500 mr-2">check_circle</span>
              <span className="text-green-700 font-medium">File uploaded</span>
            </div>
            <p className="text-gray-600 text-sm mb-3">{fileName || value?.split('/').pop()}</p>
            <div className="flex justify-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-red-500 border-red-200"
                onClick={() => {
                  onChange("");
                  setFileName(null);
                }}
              >
                Remove
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="bg-primary-50 text-primary border-primary-200"
                onClick={() => document.getElementById("fileInput")?.click()}
              >
                Change File
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  );
}
