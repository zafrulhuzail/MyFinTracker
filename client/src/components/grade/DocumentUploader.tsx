import { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { createWorker } from 'tesseract.js';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, FileText, Upload, CheckCircle, AlertTriangle } from 'lucide-react';
import { Course } from '@shared/schema';

interface DocumentUploaderProps {
  onExtractedData: (courses: Partial<Course>[]) => void;
}

export default function DocumentUploader({ onExtractedData }: DocumentUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<string | null>(null);
  const [extractedCourses, setExtractedCourses] = useState<Partial<Course>[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const workerRef = useRef<any>(null);

  // Initialize Tesseract worker
  useEffect(() => {
    const initWorker = async () => {
      workerRef.current = await createWorker('deu');
      await workerRef.current.load();
      await workerRef.current.loadLanguage('deu');
      await workerRef.current.initialize('deu');
    };

    initWorker();

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  // Handle file drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    setOcrResult(null);
    setExtractedCourses(null);
    
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setFile(file);
      
      // Create preview URL
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);
      
      return () => URL.revokeObjectURL(fileUrl);
    }
  }, []);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'application/pdf': [],
    },
    maxFiles: 1,
  });

  // Process document with OCR
  const processDocument = async () => {
    if (!file || !workerRef.current) return;
    
    try {
      setIsProcessing(true);
      setProgress(0);
      setError(null);
      
      // For simplicity, directly process the file with Tesseract
      // In a real app, you'd need different handling for PDFs vs images
      const result = await workerRef.current.recognize(file, {
        progressUpdate: (progress: any) => {
          setProgress(Math.round(progress.progress * 100));
        },
      });
      
      setOcrResult(result.data.text);
      const extracted = extractGradeData(result.data.text);
      setExtractedCourses(extracted);
      onExtractedData(extracted);
      
    } catch (err: any) {
      console.error('OCR processing error:', err);
      setError(`Error processing document: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Extract course data from OCR text
  const extractGradeData = (text: string): Partial<Course>[] => {
    // This is a simplified extraction logic
    // In a real app, you would need more sophisticated parsing based on the document format
    
    const courses: Partial<Course>[] = [];
    
    // Example pattern matching for German university grade reports
    // This is just a sample - real implementation would be more complex
    const lines = text.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Look for patterns like "Course Name 1,0 6.0 ECTS"
      const courseMatch = line.match(/(.+?)\s+(\d+[.,]\d+)\s+(\d+[.,]\d+)\s+ECTS/i);
      
      if (courseMatch) {
        courses.push({
          name: courseMatch[1].trim(),
          grade: parseFloat(courseMatch[2].replace(',', '.')),
          credits: parseFloat(courseMatch[3].replace(',', '.')),
        });
      }
    }
    
    return courses;
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-2">
          <Upload className="h-10 w-10 text-gray-400" />
          <p className="text-sm font-medium">
            {isDragActive
              ? 'Drop the document here'
              : 'Drag & drop your grade document, or click to select'}
          </p>
          <p className="text-xs text-gray-500">
            Supports PDF, JPG and PNG files
          </p>
        </div>
      </div>

      {file && (
        <Card className="overflow-hidden">
          <div className="p-4 bg-gray-50 border-b">
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-primary mr-2" />
              <span className="font-medium text-sm truncate">{file.name}</span>
              <span className="text-gray-400 text-xs ml-2">
                ({Math.round(file.size / 1024)} KB)
              </span>
            </div>
          </div>
          
          <div className="p-4">
            {!isProcessing && !ocrResult && (
              <Button onClick={processDocument} className="w-full">
                Process Document
              </Button>
            )}
            
            {isProcessing && (
              <div className="space-y-3">
                <div className="flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  <span>Processing document...</span>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-center text-gray-500">
                  {progress}% - This may take a few moments
                </p>
              </div>
            )}
            
            {extractedCourses && extractedCourses.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center text-green-600 mb-2">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <span className="font-medium">
                    Successfully extracted {extractedCourses.length} courses
                  </span>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {extractedCourses.map((course, index) => (
                    <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                      <div className="font-medium">{course.name}</div>
                      <div className="flex justify-between text-gray-600">
                        <span>Grade: {course.grade}</span>
                        <span>Credits: {course.credits}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {extractedCourses && extractedCourses.length === 0 && (
              <Alert variant="default" className="mt-3 border-yellow-500/50 text-yellow-700">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>No courses detected</AlertTitle>
                <AlertDescription>
                  We couldn't identify any course information in the document. 
                  Make sure the document contains grade information in a readable format.
                </AlertDescription>
              </Alert>
            )}
            
            {error && (
              <Alert variant="destructive" className="mt-3">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Processing failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </Card>
      )}
      
      {/* Add this to debug and improve extraction in a real app */}
      {process.env.NODE_ENV === 'development' && ocrResult && (
        <details className="mt-4 text-xs">
          <summary className="cursor-pointer font-medium">Debug: Raw OCR Result</summary>
          <pre className="mt-2 p-2 bg-gray-100 rounded overflow-x-auto">
            {ocrResult}
          </pre>
        </details>
      )}
    </div>
  );
}