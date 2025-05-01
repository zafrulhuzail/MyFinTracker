import { useState, useEffect } from 'react';
import { FileText, ZoomIn, ZoomOut, RotateCw, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface DocumentViewerProps {
  fileUrl: string;
  mimeType?: string;
}

export function DocumentViewer({ fileUrl, mimeType }: DocumentViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  console.log("DocumentViewer - Original File URL:", fileUrl);
  
  // Prepare file URL for proper access
  const cleanFileUrl = fileUrl.startsWith('file://') 
    ? fileUrl.replace('file://', '/')  // Convert file:// protocol to relative path
    : fileUrl;
  
  // If path already starts with /uploads, use it directly
  // Otherwise, if it's a relative path without a leading slash, add the leading slash
  const finalFileUrl = cleanFileUrl.startsWith('/uploads') 
    ? cleanFileUrl 
    : (cleanFileUrl.startsWith('/') ? cleanFileUrl : `/${cleanFileUrl}`);
    
  console.log("DocumentViewer - Final File URL:", finalFileUrl);
  console.log("DocumentViewer - Is empty URL:", !finalFileUrl);
  console.log("DocumentViewer - File type:", mimeType);
  
  const isPdf = mimeType?.includes('pdf') || finalFileUrl.toLowerCase().endsWith('.pdf');
  const isImage = mimeType?.includes('image') || 
    /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(finalFileUrl);
    
  console.log("DocumentViewer - isPdf:", isPdf);
  console.log("DocumentViewer - isImage:", isImage);

  useEffect(() => {
    // Reset state when file changes
    console.log("DocumentViewer - useEffect - fileUrl changed:", fileUrl);
    setLoading(true);
    setError(null);
    setPageNumber(1);
    setScale(1);
    setRotation(0);
  }, [fileUrl]);

  if (!fileUrl) {
    return (
      <div className="flex flex-col w-full h-full">
        <div className="flex items-center justify-center h-full min-h-[300px] w-full border rounded-md p-4 bg-gray-50 mb-4">
          <p className="text-gray-500">No document provided</p>
        </div>
      </div>
    );
  }

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    console.log("DocumentViewer - PDF loaded successfully, pages:", numPages);
    setNumPages(numPages);
    setLoading(false);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('Error loading document:', error);
    setError('Failed to load document. Please try again.');
    setLoading(false);
  };

  const previousPage = () => {
    setPageNumber(prev => Math.max(prev - 1, 1));
  };

  const nextPage = () => {
    if (numPages) {
      setPageNumber(prev => Math.min(prev + 1, numPages));
    }
  };

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  const rotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  if (error) {
    return (
      <div className="flex flex-col w-full h-full">
        <div className="flex items-center justify-center h-full min-h-[300px] w-full border rounded-md p-4 bg-gray-50 mb-4">
          <p className="text-red-500 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  // Use a simple approach for document viewing
  useEffect(() => {
    setLoading(false);
  }, [fileUrl]);

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex flex-col justify-center items-center w-full mb-4 border rounded-md p-4 bg-gray-50 overflow-auto min-h-[300px]">
        {loading ? (
          <div className="flex items-center justify-center w-full h-full min-h-[300px]">
            <Skeleton className="w-full h-full" />
          </div>
        ) : isPdf ? (
          <div className="flex flex-col items-center justify-center gap-4">
            <FileText className="h-16 w-16 text-gray-400" />
            <p className="text-xl font-medium">PDF Document</p>
            <p className="text-gray-500 text-sm mb-2">
              PDF preview is not available. You can open or download the document using the buttons below.
            </p>
            <div className="flex gap-2">
              <a 
                href={finalFileUrl} 
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in Browser
                </Button>
              </a>
              <a 
                href={finalFileUrl} 
                download
              >
                <Button>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </a>
            </div>
          </div>
        ) : isImage ? (
          <div className="flex items-center justify-center h-full">
            <img 
              src={finalFileUrl} 
              alt="Document preview" 
              style={{ 
                transform: `scale(${scale}) rotate(${rotation}deg)`,
                maxWidth: '100%',
                transition: 'transform 0.2s ease'
              }}
              className="max-h-[65vh] object-contain" 
              onLoad={() => setLoading(false)}
              onError={(e) => {
                console.error("DocumentViewer - Image load error:", e);
                setError('Failed to load image');
              }}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4">
            <FileText className="h-16 w-16 text-gray-400" />
            <p className="text-xl font-medium">Document</p>
            <p className="text-gray-500 text-sm mb-2">
              This file type cannot be previewed. You can download the document using the button below.
            </p>
            <a 
              href={finalFileUrl} 
              download
            >
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </a>
          </div>
        )}
      </div>

      {isImage && (
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={zoomOut}
              disabled={scale <= 0.5}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={zoomIn}
              disabled={scale >= 3}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={rotate}>
              <RotateCw className="h-4 w-4" />
            </Button>
            <a 
              href={finalFileUrl} 
              download 
            >
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}