import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { academicRecordFormSchema, courseFormSchema } from "@/lib/validators";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";
import { AcademicRecord, Course, StudyPlan } from "@shared/schema";
import AppHeader from "@/components/layout/AppHeader";
import BottomNavigation from "@/components/layout/BottomNavigation";
import SemesterAccordion from "@/components/grade/SemesterAccordion";
import CourseForm from "@/components/grade/CourseForm";
import StudyPlanTable from "@/components/grade/StudyPlanTable";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function Grades() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [selectedAcademicRecord, setSelectedAcademicRecord] = useState<AcademicRecord | null>(null);
  
  // Fetch academic records
  const { data: academicRecords, isLoading: isLoadingRecords } = useQuery<AcademicRecord[]>({
    queryKey: ["/api/academic-records"],
  });
  
  // Fetch study plans
  const { data: studyPlans, isLoading: isLoadingPlans } = useQuery<StudyPlan[]>({
    queryKey: ["/api/study-plans"],
  });
  
  // Calculate academic stats
  const currentGPA = academicRecords?.reduce((sum, record) => sum + (record.gpa || 0), 0) 
    ? (academicRecords?.reduce((sum, record) => sum + (record.gpa || 0), 0) / 
      academicRecords?.filter(record => record.gpa).length).toFixed(2)
    : "N/A";
  
  const totalCredits = academicRecords?.reduce((sum, record) => sum + (record.ectsCredits || 0), 0) || 0;
  
  // Get the current/latest semester
  const currentRecord = academicRecords?.sort((a, b) => {
    // Compare year first
    const yearDiff = parseInt(b.year) - parseInt(a.year);
    if (yearDiff !== 0) return yearDiff;
    
    // If same year, compare semester (Winter > Summer)
    return a.semester === "Winter" ? 1 : -1;
  })[0];
  
  // This function just creates the query key for a specific academic record
  const getCoursesQueryKey = (academicRecordId: number) => 
    [`/api/academic-records/${academicRecordId}/courses`];
  
  // Mutation for adding a new course
  const addCourseMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/courses", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Course added successfully",
        description: "Your academic record has been updated",
      });
      
      // Invalidate related queries
      if (selectedAcademicRecord) {
        queryClient.invalidateQueries({ 
          queryKey: getCoursesQueryKey(selectedAcademicRecord.id) 
        });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/academic-records"] });
      
      // Close dialog
      setIsAddingCourse(false);
      setSelectedAcademicRecord(null);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add course",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    },
  });
  
  const handleAddCourse = (academicRecord: AcademicRecord) => {
    setSelectedAcademicRecord(academicRecord);
    setIsAddingCourse(true);
  };
  
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <AppHeader title="Academic Progress" />
      
      <div className="flex-1 overflow-auto pb-16">
        <div className="px-4 py-6">
          <div className="mb-4">
            <h2 className="text-2xl font-bold">Academic Progress</h2>
            <p className="text-gray-600">Update your academic information and grades</p>
          </div>
          
          {/* Summary Section */}
          <Card className="p-4 mb-6">
            <h3 className="font-medium mb-3">Academic Summary</h3>
            {isLoadingRecords ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-sm">Current GPA/Note</p>
                  <p className="text-2xl font-bold text-primary">{currentGPA}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">ECTS Credits</p>
                  <p className="text-2xl font-bold text-primary">{totalCredits}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Current Semester</p>
                  <p className="font-medium">
                    {currentRecord ? `${currentRecord.semester} ${currentRecord.year}` : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Study Progress</p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                    <div 
                      className="bg-primary h-2.5 rounded-full" 
                      style={{ width: `${Math.min(totalCredits / 240 * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </Card>
          
          {/* Semester Grades Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-medium">Semester Results</h3>
              {academicRecords && academicRecords.length > 0 && currentRecord && (
                <Button
                  onClick={() => handleAddCourse(currentRecord)}
                  size="sm"
                >
                  Update Grades
                </Button>
              )}
            </div>
            
            {isLoadingRecords ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : academicRecords && academicRecords.length > 0 ? (
              <>
                {academicRecords.map(record => {
                  // Use useQuery at the top level for each academic record
                  const queryKey = getCoursesQueryKey(record.id);
                  const { data: courses } = useQuery<Course[]>({
                    queryKey: queryKey,
                    enabled: !!record.id
                  });
                  const isCurrentSemester = currentRecord?.id === record.id;
                  
                  return (
                    <SemesterAccordion
                      key={record.id}
                      academicRecord={record}
                      courses={courses || []}
                      isCurrentSemester={isCurrentSemester}
                    />
                  );
                })}
              </>
            ) : (
              <Card className="p-4 text-center">
                <p className="text-gray-500">No academic records found</p>
                <Button className="mt-3" onClick={() => setIsAddingCourse(true)}>
                  Add First Semester
                </Button>
              </Card>
            )}
          </div>
          
          {/* Study Plan Section */}
          <div>
            <h3 className="text-lg font-medium mb-3">Study Plan</h3>
            <Card className="p-4">
              {isLoadingPlans ? (
                <Skeleton className="h-32 w-full" />
              ) : studyPlans && studyPlans.length > 0 ? (
                <StudyPlanTable studyPlans={studyPlans} />
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500">No study plan defined yet</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
      
      {/* Add Course Dialog */}
      <Dialog open={isAddingCourse} onOpenChange={setIsAddingCourse}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedAcademicRecord 
                ? `Add Course to ${selectedAcademicRecord.semester} ${selectedAcademicRecord.year}`
                : "Add New Semester"
              }
            </DialogTitle>
          </DialogHeader>
          
          {selectedAcademicRecord ? (
            <CourseForm
              academicRecord={selectedAcademicRecord}
              onSubmit={(data) => addCourseMutation.mutate(data)}
              isLoading={addCourseMutation.isPending}
            />
          ) : (
            <p>Please select an academic record first.</p>
          )}
        </DialogContent>
      </Dialog>
      
      <BottomNavigation />
    </div>
  );
}
