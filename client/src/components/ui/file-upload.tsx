import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Loader2, Check, X, File } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface FileUploadProps {
  onUploadComplete?: (fileData: FileUploadResponse) => void;
  accept?: string;
  maxSize?: number; // in MB
  buttonText?: string;
}

export interface FileUploadResponse {
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
}

export function FileUpload({
  onUploadComplete,
  accept = ".pdf,.jpg,.jpeg,.png,.gif,.webp",
  maxSize = 10, // Default 10MB
  buttonText = "Upload File"
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > maxSize) {
      toast({
        title: "File too large",
        description: `The file size exceeds the maximum limit of ${maxSize}MB.`,
        variant: "destructive"
      });
      resetFileInput();
      return;
    }

    setIsUploading(true);
    setUploadStatus('uploading');
    setUploadedFileName(file.name);
    
    // Simulate progress (in a real implementation, you'd use XHR or fetch with progress events)
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = Math.min(prev + 10, 90);
        return newProgress;
      });
    }, 200);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      setUploadProgress(100);
      setUploadStatus('success');
      
      const fileData: FileUploadResponse = await response.json();
      
      toast({
        title: "File uploaded successfully",
        description: file.name,
      });
      
      if (onUploadComplete) {
        onUploadComplete(fileData);
      }
    } catch (error) {
      clearInterval(progressInterval);
      setUploadStatus('error');
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setTimeout(() => {
        // Reset progress but keep status for feedback
        setUploadProgress(0);
      }, 2000);
    }
  };

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setUploadStatus('idle');
    setUploadedFileName(null);
  };

  return (
    <div className="w-full">
      <input
        type="file"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
      />
      
      {uploadStatus === 'idle' ? (
        <Button 
          onClick={() => fileInputRef.current?.click()}
          variant="outline"
          className="w-full"
          disabled={isUploading}
        >
          <Upload className="mr-2 h-4 w-4" />
          {buttonText}
        </Button>
      ) : (
        <div className="w-full space-y-2">
          <div className="flex items-center gap-2">
            {uploadStatus === 'uploading' && (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            )}
            {uploadStatus === 'success' && (
              <Check className="h-4 w-4 text-green-500" />
            )}
            {uploadStatus === 'error' && (
              <X className="h-4 w-4 text-red-500" />
            )}
            
            <div className="text-sm flex-1 truncate" title={uploadedFileName || ''}>
              {uploadedFileName}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={resetFileInput}
              disabled={isUploading}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear</span>
            </Button>
          </div>
          
          {uploadStatus === 'uploading' && (
            <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300 ease-in-out"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}