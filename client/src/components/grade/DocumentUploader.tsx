import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
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

  // Process document with simulated OCR
  const processDocument = async () => {
    if (!file) return;
    
    try {
      setIsProcessing(true);
      setProgress(0);
      setError(null);
      
      // Simulate OCR processing with progress updates
      const simulateProgress = () => {
        let currentProgress = 0;
        const interval = setInterval(() => {
          currentProgress += 5;
          setProgress(currentProgress);
          
          if (currentProgress >= 100) {
            clearInterval(interval);
            finishProcessing();
          }
        }, 150);
      };
      
      const finishProcessing = () => {
        // For demo purposes - simulate extracted text
        const simulatedText = generateSimulatedResults(file.name);
        setOcrResult(simulatedText);
        
        // Extract course data from the simulated text
        const courses = extractGradeData(simulatedText);
        setExtractedCourses(courses);
        onExtractedData(courses);
        
        setIsProcessing(false);
      };
      
      // Start the simulated progress
      simulateProgress();
      
    } catch (err: any) {
      console.error('Processing error:', err);
      setError(`Error processing document: ${err.message || 'Unknown error'}`);
      setIsProcessing(false);
    }
  };
  
  // Generate simulated OCR results based on filename for demo purposes
  const generateSimulatedResults = (filename: string): string => {
    // Generate more or fewer courses based on file size to simulate different documents
    const courseNames = [
      "Computer Science 101",
      "Database Systems",
      "Artificial Intelligence",
      "Mathematics for Engineers",
      "Web Development",
      "Machine Learning",
      "Software Engineering"
    ];
    
    // Simulate OCR text output
    let result = "University of Applied Sciences\nStudent: John Doe\nMatrikel-Nr: 12345\n\nCourse Results:\n\n";
    
    // Add 3-5 random courses
    const numCourses = 3 + Math.floor(Math.random() * 3);
    const selectedCourses: string[] = [];
    
    for (let i = 0; i < numCourses; i++) {
      // Choose a random course that hasn't been selected yet
      let courseName;
      do {
        courseName = courseNames[Math.floor(Math.random() * courseNames.length)];
      } while (selectedCourses.includes(courseName));
      
      selectedCourses.push(courseName);
      
      // Generate random grade (1.0 - 4.0) and random credits (3 - 8)
      const grade = (1 + Math.random() * 3).toFixed(1);
      const credits = Math.floor(3 + Math.random() * 6);
      
      // Add course details in format that the extractor can parse
      result += `${courseName} ${grade} ${credits} ECTS\n`;
    }
    
    return result;
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
          grade: courseMatch[2].replace(',', '.'),
          credits: parseInt(courseMatch[3].replace(',', '.')),
          status: 'completed'
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