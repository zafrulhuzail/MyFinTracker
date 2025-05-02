import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface AcademicRecordFormProps {
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

export default function AcademicRecordForm({ onSubmit, isLoading }: AcademicRecordFormProps) {
  const [semester, setSemester] = useState<string>("Winter");
  const [year, setYear] = useState<string>(new Date().getFullYear().toString());
  const [gpa, setGpa] = useState<string>("");
  const [ectsCredits, setEctsCredits] = useState<string>("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate year
    if (!year || isNaN(Number(year)) || Number(year) < 2000 || Number(year) > 2100) {
      alert("Please enter a valid year between 2000 and 2100");
      return;
    }
    
    // Validate GPA if provided
    if (gpa && (isNaN(Number(gpa)) || Number(gpa) < 0 || Number(gpa) > 4.0)) {
      alert("GPA must be between 0 and 4.0");
      return;
    }
    
    // Validate ECTS credits if provided
    if (ectsCredits && (isNaN(Number(ectsCredits)) || Number(ectsCredits) < 0)) {
      alert("Credits must be a positive number");
      return;
    }
    
    // Process form data
    const formattedData = {
      semester,
      year,
      gpa: gpa ? parseFloat(gpa) : null,
      ectsCredits: ectsCredits ? parseInt(ectsCredits) : null,
      isCompleted: false
    };
    
    onSubmit(formattedData);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="semester">Semester</Label>
          <Select 
            value={semester}
            onValueChange={setSemester}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select semester" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Winter">Winter</SelectItem>
              <SelectItem value="Summer">Summer</SelectItem>
              <SelectItem value="Fall">Fall</SelectItem>
              <SelectItem value="Spring">Spring</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="year">Year</Label>
          <Input 
            id="year"
            placeholder="Enter year (e.g., 2023)" 
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="gpa">GPA (optional)</Label>
          <Input 
            id="gpa"
            type="number" 
            step="0.01"
            placeholder="Enter GPA (0-4.0)" 
            value={gpa}
            onChange={(e) => setGpa(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="credits">Credits (optional)</Label>
          <Input 
            id="credits"
            type="number" 
            placeholder="Enter ECTS credits earned" 
            value={ectsCredits}
            onChange={(e) => setEctsCredits(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex justify-end space-x-2 pt-2">
        <Button
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Adding..." : "Add Semester"}
        </Button>
      </div>
    </form>
  );
}