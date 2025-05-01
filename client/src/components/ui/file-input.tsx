import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CloudUpload, FileText } from "lucide-react";
import { ChangeEvent, useRef, useState } from "react";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      
      // For demo/prototype purposes, we're just setting the file name as the value
      // In a real implementation, we'd upload the file and store the URL
      onChange(file.name);
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
            />
            
            {fileName ? (
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
                <Button variant="outline" size="sm" className="mt-3">
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