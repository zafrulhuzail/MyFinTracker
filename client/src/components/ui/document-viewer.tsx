import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

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
  
  const isPdf = mimeType?.includes('pdf') || fileUrl.toLowerCase().endsWith('.pdf');
  const isImage = mimeType?.includes('image') || 
    /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(fileUrl);

  useEffect(() => {
    // Reset state when file changes
    setLoading(true);
    setError(null);
    setPageNumber(1);
    setScale(1);
    setRotation(0);
  }, [fileUrl]);

  if (!fileUrl) {
    return (
      <Card className="flex items-center justify-center h-80 w-full">
        <p className="text-gray-500">No document provided</p>
      </Card>
    );
  }

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
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
      <Card className="flex items-center justify-center h-80 w-full">
        <p className="text-error">{error}</p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col w-full">
      <div className="flex justify-center w-full mb-4 border rounded-md p-4 bg-gray-50 min-h-[400px]">
        {loading && (
          <div className="flex items-center justify-center w-full h-80">
            <Skeleton className="w-full h-full" />
          </div>
        )}
        
        {isPdf ? (
          <Document
            file={fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={<Skeleton className="w-full h-80" />}
          >
            <Page 
              pageNumber={pageNumber} 
              scale={scale}
              rotate={rotation}
              loading={<Skeleton className="w-full h-80" />}
            />
          </Document>
        ) : isImage ? (
          <div className="flex items-center justify-center">
            <img 
              src={fileUrl} 
              alt="Document preview" 
              style={{ 
                transform: `scale(${scale}) rotate(${rotation}deg)`,
                maxWidth: '100%',
                transition: 'transform 0.2s ease'
              }}
              className="max-h-[60vh]" 
              onLoad={() => setLoading(false)}
              onError={() => {
                setError('Failed to load image');
                setLoading(false);
              }}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-80 w-full">
            <p className="text-gray-500">
              This file type cannot be previewed. Please download to view.
            </p>
          </div>
        )}
      </div>

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
        </div>

        {isPdf && numPages && (
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={previousPage}
              disabled={pageNumber <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {pageNumber} of {numPages}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={nextPage}
              disabled={!numPages || pageNumber >= numPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}