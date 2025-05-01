import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { DocumentViewer } from "@/components/ui/document-viewer";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, FileText, ZoomIn, ZoomOut, RotateCw, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Set PDF.js worker path
// Use CDN for worker file - this is more reliable than local file
pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

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
  
  // PDF viewer state
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<Error | null>(null);
  
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
              {/* PDF Viewer */}
              <div className="flex-1 flex flex-col items-center overflow-auto">
                <Document
                  file={finalUrl}
                  onLoadSuccess={({ numPages }) => {
                    setNumPages(numPages);
                    setIsLoading(false);
                  }}
                  onLoadError={(error) => {
                    console.error('Error loading PDF:', error);
                    setLoadError(error);
                    setIsLoading(false);
                  }}
                  loading={
                    <div className="flex items-center justify-center h-40">
                      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  }
                  error={
                    <div className="text-center p-4 text-destructive">
                      <p className="font-medium mb-2">Error loading PDF</p>
                      <p className="text-sm">Could not load the PDF file. Please try the download button.</p>
                    </div>
                  }
                >
                  {!loadError && (
                    <Page
                      pageNumber={pageNumber}
                      scale={scale}
                      rotate={rotation}
                      className="shadow-md"
                      renderTextLayer={true}
                      renderAnnotationLayer={true}
                    />
                  )}
                </Document>
              </div>

              {/* PDF Controls */}
              {!loadError && !isLoading && numPages && (
                <div className="mt-4 border-t pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm">
                      Page {pageNumber} of {numPages}
                    </div>
                    <div className="flex gap-2">
                      <a href={finalUrl} download={fileName}>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                      disabled={pageNumber <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
                      disabled={pageNumber >= numPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setScale(Math.max(0.5, scale - 0.2))}
                      title="Zoom out"
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setScale(Math.min(2.5, scale + 0.2))}
                      title="Zoom in"
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setRotation((rotation + 90) % 360)}
                      title="Rotate"
                    >
                      <RotateCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
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