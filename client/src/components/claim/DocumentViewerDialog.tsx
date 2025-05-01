import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { DocumentViewer } from "@/components/ui/document-viewer";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, FileText } from "lucide-react";
import { useState, useEffect } from "react";

interface DocumentViewerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  fileName: string;
  title: string;
}

export function DocumentViewerDialog({
  isOpen,
  onClose,
  fileUrl,
  fileName,
  title
}: DocumentViewerDialogProps) {
  const [finalUrl, setFinalUrl] = useState("");
  const [isPdf, setIsPdf] = useState(false);
  const [isImage, setIsImage] = useState(false);
  
  useEffect(() => {
    // Normalize file URL
    const normalizedUrl = fileUrl.startsWith('file://') 
      ? `/uploads/${fileUrl.replace('file://', '')}` 
      : fileUrl;
    
    setFinalUrl(normalizedUrl);
    
    // Check file type
    const lowerFileName = fileName.toLowerCase();
    setIsPdf(lowerFileName.endsWith('.pdf'));
    setIsImage(
      lowerFileName.endsWith('.jpg') || 
      lowerFileName.endsWith('.jpeg') || 
      lowerFileName.endsWith('.png') || 
      lowerFileName.endsWith('.gif') || 
      lowerFileName.endsWith('.webp')
    );
  }, [fileUrl, fileName]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-[95vw] h-[85vh] max-h-[800px] flex flex-col">
        <DialogHeader className="pb-4">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {fileName}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto border rounded-md bg-gray-50 p-4">
          {isImage ? (
            <div className="flex items-center justify-center h-full">
              <img 
                src={finalUrl} 
                alt={fileName} 
                className="max-h-[65vh] object-contain"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 h-full">
              <FileText className="h-16 w-16 text-gray-400" />
              <h3 className="text-xl font-medium">
                {isPdf ? "PDF Document" : "Document"}
              </h3>
              <p className="text-gray-500 text-sm text-center max-w-md">
                {isPdf 
                  ? "PDF preview is not available. You can open or download the document using the buttons below." 
                  : "This file type cannot be previewed. You can download the document using the button below."}
              </p>
              <div className="flex gap-2">
                <a 
                  href={finalUrl} 
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open in Browser
                  </Button>
                </a>
                <a 
                  href={finalUrl} 
                  download={fileName}
                >
                  <Button>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </a>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}