import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { DocumentViewer } from "@/components/ui/document-viewer";
import { Button } from "@/components/ui/button";
import { DownloadCloud } from "lucide-react";

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
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-[95vw] h-[85vh] max-h-[800px] flex flex-col">
        <DialogHeader className="pb-4">
          <DialogTitle>{title}</DialogTitle>
          <div className="text-sm text-muted-foreground mt-1">
            {fileName}
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          <DocumentViewer fileUrl={fileUrl} />
        </div>
        
        <div className="flex justify-end mt-4">
          <Button asChild variant="outline" className="flex items-center gap-1">
            <a href={fileUrl} download={fileName} target="_blank" rel="noopener">
              <DownloadCloud className="h-4 w-4 mr-1" />
              Download
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}