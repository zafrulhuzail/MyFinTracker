import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";
import { AcademicRecord, Course, StudyPlan } from "@shared/schema";
import AppHeader from "@/components/layout/AppHeader";
import SemesterAccordion from "@/components/grade/SemesterAccordion";
import CourseForm from "@/components/grade/CourseForm";
import StudyPlanTable from "@/components/grade/StudyPlanTable";
import StudyPlanForm from "@/components/grade/StudyPlanForm";
import DocumentUploader from "@/components/grade/DocumentUploader";
import AcademicRecordForm from "@/components/grade/AcademicRecordForm";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

// Separate component for each semester accordion to solve the React hooks issue
function SemesterItem({ 
  academicRecord, 
  isCurrentSemester,
  onAddCourse
}: { 
  academicRecord: AcademicRecord;
  isCurrentSemester: boolean;
  onAddCourse: (record: AcademicRecord) => void;
}) {
  // Each SemesterItem has its own useQuery hook which is now at the top level
  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: [`/api/academic-records/${academicRecord.id}/courses`],
    enabled: !!academicRecord.id,
  });
  
  return (
    <SemesterAccordion
      key={academicRecord.id}
      academicRecord={academicRecord}
      courses={courses}
      isCurrentSemester={isCurrentSemester}
    />
  );
}

export default function Grades() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [isAddingStudyPlan, setIsAddingStudyPlan] = useState(false);
  const [isAddingSemester, setIsAddingSemester] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [selectedAcademicRecord, setSelectedAcademicRecord] = useState<AcademicRecord | null>(null);
  const [selectedStudyPlan, setSelectedStudyPlan] = useState<StudyPlan | null>(null);
  
  // Fetch academic records
  const { data: academicRecords = [], isLoading: isLoadingRecords } = useQuery<AcademicRecord[]>({
    queryKey: ["/api/academic-records"],
  });
  
  // Fetch study plans
  const { data: studyPlans = [], isLoading: isLoadingPlans } = useQuery<StudyPlan[]>({
    queryKey: ["/api/study-plans"],
  });
  
  // Calculate academic stats
  const currentGPA = academicRecords.reduce((sum, record) => sum + (record.gpa || 0), 0) 
    ? (academicRecords.reduce((sum, record) => sum + (record.gpa || 0), 0) / 
      academicRecords.filter(record => record.gpa).length).toFixed(2)
    : "N/A";
  
  const totalCredits = academicRecords.reduce((sum, record) => sum + (record.ectsCredits || 0), 0) || 0;
  
  // Get the current/latest semester
  const [currentRecord, setCurrentRecord] = useState<AcademicRecord | null>(null);
  
  // Find and set current semester on initial load
  useEffect(() => {
    if (academicRecords.length > 0) {
      // Sort academic records by year and semester
      const sortedRecords = [...academicRecords].sort((a, b) => {
        // Compare year first
        const yearDiff = parseInt(b.year) - parseInt(a.year);
        if (yearDiff !== 0) return yearDiff;
        
        // If same year, compare semester (Winter > Summer)
        return a.semester === "Winter" ? 1 : -1;
      });
      
      // Use the most recent one by default
      setCurrentRecord(sortedRecords[0]);
    } else {
      setCurrentRecord(null);
    }
  }, [academicRecords]);
  
  // Mutation for adding a new academic record (semester)
  const addAcademicRecordMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/academic-records", data);
      return response.json();
    },
    onSuccess: (newRecord) => {
      toast({
        title: "Semester added successfully",
        description: `${newRecord.semester} ${newRecord.year} has been added to your records`,
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["/api/academic-records"] });
      
      // Close dialog
      setIsAddingSemester(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add semester",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    },
  });
  
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
          queryKey: [`/api/academic-records/${selectedAcademicRecord.id}/courses`] 
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
  
  // Mutation for adding a new study plan
  const addStudyPlanMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/study-plans", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Study plan created",
        description: "Your study plan has been added successfully",
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["/api/study-plans"] });
      
      // Close dialog
      setIsAddingStudyPlan(false);
      setSelectedStudyPlan(null);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add study plan",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    },
  });
  
  // Mutation for deleting a study plan
  const deleteStudyPlanMutation = useMutation({
    mutationFn: async (planId: number) => {
      const response = await apiRequest("DELETE", `/api/study-plans/${planId}`);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Study plan deleted",
        description: "Your study plan has been deleted successfully",
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["/api/study-plans"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete study plan",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    },
  });
  
  const handleAddCourse = (academicRecord: AcademicRecord) => {
    setSelectedAcademicRecord(academicRecord);
    setIsAddingCourse(true);
  };
  
  const handleAddStudyPlan = () => {
    setSelectedStudyPlan(null);
    setIsAddingStudyPlan(true);
  };
  
  const handleEditStudyPlan = (plan: StudyPlan) => {
    setSelectedStudyPlan(plan);
    setIsAddingStudyPlan(true);
  };
  
  const handleDeleteStudyPlan = (planId: number) => {
    if (confirm("Are you sure you want to delete this study plan?")) {
      deleteStudyPlanMutation.mutate(planId);
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1">
        <div className="px-4 py-6 container mx-auto max-w-4xl">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-sm">Current GPA/Note</p>
                  <p className="text-2xl font-bold text-primary">{currentGPA}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">ECTS Credits</p>
                  <p className="text-2xl font-bold text-primary">{totalCredits}</p>
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <p className="text-gray-500 text-sm mb-1">Current Semester</p>
                  {academicRecords.length > 0 ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <select 
                        className="text-sm border rounded px-2 py-1 w-full max-w-[200px]"
                        value={currentRecord?.id || ""}
                        onChange={(e) => {
                          const selectedId = parseInt(e.target.value);
                          const record = academicRecords.find(r => r.id === selectedId);
                          if (record) {
                            setCurrentRecord(record);
                          }
                        }}
                      >
                        {academicRecords.map(record => (
                          <option key={record.id} value={record.id}>
                            {record.semester} {record.year}
                          </option>
                        ))}
                      </select>
                      <span className="text-xs text-primary">(You can change this)</span>
                    </div>
                  ) : (
                    <p className="font-medium">N/A</p>
                  )}
                </div>
                <div className="col-span-1 sm:col-span-2">
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
              <h3 className="text-lg font-medium">Semester Results</h3>
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <Button
                  onClick={() => setIsAddingSemester(true)}
                  size="sm"
                  variant="outline"
                  className="flex-1 sm:flex-none text-xs sm:text-sm"
                >
                  Add New Semester
                </Button>
                {academicRecords.length > 0 && currentRecord && (
                  <>
                    <Button
                      onClick={() => handleAddCourse(currentRecord)}
                      size="sm"
                      variant="outline"
                      className="flex-1 sm:flex-none text-xs sm:text-sm"
                    >
                      Add Course Manually
                    </Button>
                    <Button
                      onClick={() => setUploadingDocument(true)}
                      size="sm"
                      className="flex-1 sm:flex-none text-xs sm:text-sm"
                    >
                      Upload Grades Document
                    </Button>
                  </>
                )}
              </div>
            </div>
            
            {isLoadingRecords ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : academicRecords.length > 0 ? (
              <div>
                {academicRecords.map(record => (
                  <SemesterItem 
                    key={record.id}
                    academicRecord={record}
                    isCurrentSemester={currentRecord?.id === record.id}
                    onAddCourse={handleAddCourse}
                  />
                ))}
              </div>
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
              <h3 className="text-lg font-medium">Study Plan</h3>
              <Button
                onClick={handleAddStudyPlan}
                size="sm"
                variant={studyPlans.length > 0 ? "outline" : "default"}
                className="w-full sm:w-auto"
              >
                Add Semester Plan
              </Button>
            </div>
            <Card className="p-4">
              {isLoadingPlans ? (
                <Skeleton className="h-32 w-full" />
              ) : studyPlans.length > 0 ? (
                <StudyPlanTable 
                  studyPlans={studyPlans} 
                  onEditPlan={handleEditStudyPlan}
                  onDeletePlan={handleDeleteStudyPlan}
                />
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500">No study plan defined yet</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Create a study plan to track your future semesters and courses
                  </p>
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
            <DialogDescription>
              Enter the details of your course
            </DialogDescription>
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
      
      {/* Document Uploader Dialog */}
      <Dialog open={uploadingDocument} onOpenChange={setUploadingDocument}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Upload Grades Document
            </DialogTitle>
            <DialogDescription>
              Upload your academic document for automatic grade extraction
            </DialogDescription>
          </DialogHeader>
          
          {currentRecord && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Upload your grade document for {currentRecord.semester} {currentRecord.year}. The system will try to extract your courses and grades automatically.
              </p>
              
              <DocumentUploader 
                onExtractedData={(courses) => {
                  if (courses.length > 0 && currentRecord) {
                    // Process the extracted courses
                    const coursesToAdd = courses.map(course => ({
                      ...course,
                      academicRecordId: currentRecord.id,
                      status: 'completed'
                    }));
                    
                    // Add the courses one by one
                    Promise.all(
                      coursesToAdd.map(course => 
                        apiRequest("POST", "/api/courses", course)
                      )
                    )
                    .then(() => {
                      // Invalidate related queries to refresh the data
                      queryClient.invalidateQueries({ 
                        queryKey: [`/api/academic-records/${currentRecord.id}/courses`]
                      });
                      queryClient.invalidateQueries({ 
                        queryKey: ["/api/academic-records"]
                      });
                      
                      toast({
                        title: "Courses added successfully",
                        description: `${courses.length} courses were extracted and added to your record.`,
                      });
                      
                      setUploadingDocument(false);
                    })
                    .catch(error => {
                      toast({
                        title: "Failed to add courses",
                        description: error.message || "An error occurred while adding the extracted courses.",
                        variant: "destructive",
                      });
                    });
                  }
                }}
              />
              
              <div className="flex justify-end space-x-2 mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setUploadingDocument(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Add Study Plan Dialog */}
      <Dialog open={isAddingStudyPlan} onOpenChange={setIsAddingStudyPlan}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedStudyPlan ? "Edit Study Plan" : "Add New Study Plan"}
            </DialogTitle>
            <DialogDescription>
              Define your future semester plan including planned courses and credits
            </DialogDescription>
          </DialogHeader>
          
          <StudyPlanForm
            onSubmit={(data) => {
              // Ensure the userId is set for new plans
              if (!selectedStudyPlan && user) {
                data.userId = user.id;
              }
              
              if (selectedStudyPlan) {
                // Update existing plan
                const updateData = {
                  ...data,
                  id: selectedStudyPlan.id,
                };
                
                // Use the update API endpoint
                apiRequest("PUT", `/api/study-plans/${selectedStudyPlan.id}`, updateData)
                  .then(() => {
                    toast({
                      title: "Study plan updated",
                      description: "Your study plan has been updated successfully",
                    });
                    
                    // Invalidate related queries
                    queryClient.invalidateQueries({ queryKey: ["/api/study-plans"] });
                    
                    // Close dialog
                    setIsAddingStudyPlan(false);
                    setSelectedStudyPlan(null);
                  })
                  .catch(error => {
                    toast({
                      title: "Failed to update study plan",
                      description: error.message || "An error occurred",
                      variant: "destructive",
                    });
                  });
              } else {
                // Create new plan
                addStudyPlanMutation.mutate(data);
              }
            }}
            isLoading={addStudyPlanMutation.isPending}
            existingPlan={selectedStudyPlan || undefined}
          />
        </DialogContent>
      </Dialog>

    </div>
  );
}
