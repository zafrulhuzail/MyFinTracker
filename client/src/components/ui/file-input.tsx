import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CloudUpload, FileText, Loader2 } from "lucide-react";
import { ChangeEvent, useRef, useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  label: string;
  description: string;
  icon: string;
  value: string;
  onChange: (...event: any[]) => void;
  error?: string;
}

export function FileUpload({
  label,
  description,
  icon,
  value,
  onChange,
  error
}: FileUploadProps) {
  const [fileName, setFileName] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const uploadFile = async (file: File) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("File uploaded successfully:", data);
      
      // Store the fileUrl which contains the timestamped filename
      onChange(data.fileUrl);
      return data;
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Could not upload file",
        variant: "destructive"
      });
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      try {
        const uploadResult = await uploadFile(file);
        console.log("Upload completed, setting file URL:", uploadResult.fileUrl);
      } catch (error) {
        // Error is already handled in uploadFile function
        setFileName("");
      }
    }
  };

  return (
    <div className="w-full">
      <Card className={`border ${error ? 'border-destructive' : ''}`}>
        <CardContent className="p-4">
          <div className="flex flex-col items-center justify-center text-center p-4">
            <input
              type="file"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png"
              disabled={uploading}
            />
            
            {uploading ? (
              <div className="w-full">
                <div className="flex items-center justify-center mb-2">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                </div>
                <p className="font-medium text-sm">Uploading {fileName}...</p>
              </div>
            ) : fileName ? (
              <div className="w-full">
                <div className="flex items-center justify-center mb-2">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <p className="font-medium text-sm">{fileName}</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-2" 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  Change File
                </Button>
              </div>
            ) : (
              <div 
                className="w-full cursor-pointer" 
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex items-center justify-center mb-2">
                  <CloudUpload className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-base font-medium">{label}</h3>
                <p className="text-sm text-muted-foreground mt-1">{description}</p>
                <Button variant="outline" size="sm" className="mt-3" disabled={uploading}>
                  Select File
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      {error && <p className="text-destructive text-sm mt-1">{error}</p>}
    </div>
  );
}