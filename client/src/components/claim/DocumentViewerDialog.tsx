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
// Using iframe approach for PDF viewing instead of PDF.js library

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
    // Normalize file URL based on different possible formats
    let normalizedUrl = fileUrl;
    
    // Handle file:// protocol (old format)
    if (fileUrl.startsWith('file://')) {
      normalizedUrl = `/uploads/${fileUrl.replace('file://', '')}`;
    } 
    // Handle relative paths that don't start with /
    else if (!fileUrl.startsWith('/') && !fileUrl.startsWith('http')) {
      normalizedUrl = `/uploads/${fileUrl}`;
    }
    // Handle hackeruerdendacker.png direct filename
    else if (!fileUrl.includes('/') && !fileUrl.startsWith('http')) {
      normalizedUrl = `/uploads/${fileUrl}`;
    }
    
    console.log('Original URL:', fileUrl);
    console.log('Normalized URL:', normalizedUrl);
    
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
          <DialogDescription className="text-sm text-muted-foreground mt-1">
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
                onError={(e) => {
                  console.error('Image failed to load:', finalUrl);
                  e.currentTarget.onerror = null; 
                  e.currentTarget.style.display = 'none';
                  // Show error message
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'text-center p-4 text-destructive';
                    errorDiv.innerHTML = `
                      <p class="font-medium mb-2">Error loading image</p>
                      <p class="text-sm">The image could not be loaded. Please try the download button below.</p>
                    `;
                    parent.appendChild(errorDiv);
                  }
                }}
              />
            </div>
          ) : isPdf ? (
            <div className="flex flex-col h-full">
              {/* PDF Viewer using object tag */}
              <div className="flex-1 relative">
                <object
                  data={finalUrl}
                  type="application/pdf"
                  className="w-full h-full border rounded"
                  style={{ minHeight: '500px' }}
                >
                  <div className="flex flex-col items-center justify-center p-8 text-center h-full">
                    <FileText className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="font-medium mb-2">PDF cannot be displayed</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Your browser might be blocking the PDF from displaying.
                      Please use the buttons below.
                    </p>
                  </div>
                </object>
              </div>

              <div className="mt-4 border-t pt-4">
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <a href={finalUrl} download={fileName}>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </a>
                  <a href={finalUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="default">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open in Full Screen
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 h-full">
              <FileText className="h-16 w-16 text-gray-400" />
              <h3 className="text-xl font-medium">Document</h3>
              <p className="text-gray-500 text-sm text-center max-w-md">
                This file type cannot be previewed. You can download the document using the button below.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <a 
                  href={finalUrl} 
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" className="w-full sm:w-auto">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open in Browser
                  </Button>
                </a>
                <a 
                  href={finalUrl} 
                  download={fileName}
                >
                  <Button className="w-full sm:w-auto">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </a>
              </div>
              
              <div className="mt-4 text-sm text-muted-foreground">
                <p>URL: {finalUrl}</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}