import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink, Download, FileText } from 'lucide-react';

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
  const [fullUrl, setFullUrl] = useState("");
  const [isPdf, setIsPdf] = useState(false);
  const [isImage, setIsImage] = useState(false);
  
  useEffect(() => {
    // Create a clean, browser-friendly URL by ensuring all paths start with /uploads/
    let processedUrl = fileUrl;
    
    // If it's not already a full path, add the /uploads/ prefix
    if (!fileUrl.startsWith('/uploads/') && !fileUrl.startsWith('http')) {
      processedUrl = `/uploads/${fileUrl}`;
    }
    
    // Set the full URL for viewing
    setFullUrl(processedUrl);
    
    // Determine file type from extension
    const lowerFileName = fileName.toLowerCase();
    setIsPdf(lowerFileName.endsWith('.pdf'));
    setIsImage(
      lowerFileName.endsWith('.jpg') || 
      lowerFileName.endsWith('.jpeg') || 
      lowerFileName.endsWith('.png') || 
      lowerFileName.endsWith('.gif') || 
      lowerFileName.endsWith('.webp')
    );
    
    // Debug log
    console.log('Document viewer: ', { fileUrl, processedUrl, fileName, isPdf: lowerFileName.endsWith('.pdf') });
  }, [fileUrl, fileName]);

  // Function to open document in a new tab
  const openInNewTab = () => {
    window.open(fullUrl, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] h-[85vh] max-h-[800px] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{fileName}</DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto border rounded-md bg-gray-50 p-4">
          {isPdf ? (
            <div className="flex flex-col items-center justify-center h-full gap-6">
              <div className="bg-primary/10 rounded-full p-6">
                <FileText className="h-16 w-16 text-primary" />
              </div>
              
              <div className="text-center max-w-lg">
                <h3 className="text-xl font-medium mb-2">PDF Document</h3>
                <p className="text-muted-foreground mb-6">
                  This document will open in a new browser tab for better viewing.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  onClick={openInNewTab}
                >
                  <ExternalLink className="mr-2 h-5 w-5" />
                  Open Document
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  asChild
                >
                  <a href={fullUrl} download={fileName}>
                    <Download className="mr-2 h-5 w-5" />
                    Download
                  </a>
                </Button>
              </div>
            </div>
          ) : isImage ? (
            <div className="flex items-center justify-center h-full">
              <img 
                src={fullUrl} 
                alt={fileName} 
                className="max-h-[600px] object-contain"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-6">
              <FileText className="h-16 w-16 text-gray-400" />
              <div className="text-center">
                <h3 className="text-xl font-medium mb-2">Unknown File Type</h3>
                <p className="text-muted-foreground mb-6">
                  This file cannot be previewed directly in the browser.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  variant="outline"
                  onClick={openInNewTab}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open in Browser
                </Button>
                
                <Button asChild>
                  <a href={fullUrl} download={fileName}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </a>
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}