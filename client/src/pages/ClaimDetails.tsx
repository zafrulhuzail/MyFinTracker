import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Claim, User, AcademicRecord, Course } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import AppHeader from "@/components/layout/AppHeader";
import ClaimReviewForm from "@/components/admin/ClaimReviewForm";
import { DocumentViewerDialog } from "@/components/claim/DocumentViewerDialog";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, FileText, DownloadCloud, Eye } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";

export default function ClaimDetails() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<{ url: string; name: string; title: string } | null>(null);
  
  // Debug function for document viewing
  const viewDocument = (document: { url: string; name: string; title: string }) => {
    console.log("Viewing document:", document);
    setViewingDocument(document);
  };
  
  // Fetch claim details
  const { data: claim, isLoading } = useQuery<Claim>({
    queryKey: [`/api/claims/${id}`],
  });
  
  // Fetch student details
  const { data: student , isLoading: isLoadingStudent} = useQuery<User>({
    queryKey: [`/api/users/${claim?.userId}`],
    enabled: !!claim?.userId,
  });

  // Fetch academic records for the student
  const { data: academicRecords, isLoading: isLoadingAcademicRecords } = useQuery<AcademicRecord[]>({
    queryKey: [
      `/api/academic-records`, 
      // When admin is viewing another student's records, pass studentId param
      isAdmin && student && claim && claim.userId !== user?.id ? { studentId: student.id } : undefined
    ],
    enabled: !!student,
  });
  
  // State for tracking which academic record has expanded courses view
  const [expandedRecordId, setExpandedRecordId] = useState<number | null>(null);
  
  // Fetch courses for expanded academic record
  const { data: courses, isLoading: isLoadingCourses } = useQuery<Course[]>({
    queryKey: [`/api/academic-records/${expandedRecordId}/courses`],
    enabled: expandedRecordId !== null,
  });
  
  useEffect(() => {
    if (!id) {
      setLocation("/history");
    }
  }, [id, setLocation]);
  
  // Format date
  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col">
        <div className="pb-16 px-4 py-6">
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-4 w-1/2 mb-8" />
          <Skeleton className="h-32 w-full mb-4" />
          <Skeleton className="h-32 w-full mb-4" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }
  
  if (!claim) {
    return (
      <div className="flex flex-col">
        <div className="pb-16 px-4 py-6 flex items-center justify-center">
          <Card className="w-full max-w-md mx-auto">
            <CardContent className="pt-6 flex flex-col items-center">
              <AlertCircle className="h-16 w-16 text-error mb-4" />
              <h2 className="text-xl font-bold mb-2">Claim Not Found</h2>
              <p className="text-gray-500 text-center mb-4">
                The claim you're looking for doesn't exist or you don't have permission to view it.
              </p>
              <Button onClick={() => setLocation("/history")}>
                Back to Claims
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col w-full">
      <div className="pb-16 w-full">
        <div className="px-4 py-6 w-full">
          {/* Claim Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-2xl font-bold">{claim.claimType} Claim</h2>
                {isLoadingStudent ? (
                  <Skeleton className="h-5 w-40 mt-1" />
                ) : student ? (
                  <p className="text-primary font-medium mt-1">
                    Student: {student.fullName} ({student.maraId})
                  </p>
                ) : null}
              </div>
              <StatusBadge status={claim.status as any} />
            </div>
            <p className="text-gray-600">Submitted on {formatDate(claim.createdAt)}</p>
            <p className="text-gray-500 text-sm mt-1">
              Claim ID: CL{claim.id.toString().padStart(4, '0')}
            </p>
          </div>
          
          {/* Student Info (Admin only) */}
          {isAdmin && student && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Student Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div>
                    <p className="text-gray-500 text-sm">Student Name</p>
                    <p className="font-medium">{student.fullName}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">MARA ID</p>
                    <p className="font-medium">{student.maraId}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Email</p>
                    <p className="font-medium">{student.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">University</p>
                    <p className="font-medium">{student.university}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Field of Study</p>
                    <p className="font-medium">{student.fieldOfStudy}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Country of Study</p>
                    <p className="font-medium">{student.countryOfStudy}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Degree Level</p>
                    <p className="font-medium">{student.degreeLevel}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">MARA Group</p>
                    <p className="font-medium">{student.maraGroup}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Sponsorship Period</p>
                    <p className="font-medium">{student.sponsorshipPeriod}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Claim Details */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Claim Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-sm">Claim Type</p>
                  <p className="font-medium">{claim.claimType}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Amount</p>
                  <p className="font-medium">€{claim.amount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Period/Semester</p>
                  <p className="font-medium">{claim.claimPeriod}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Status</p>
                  <StatusBadge status={claim.status as any} />
                </div>
              </div>
              
              {claim.description && (
                <div className="mt-4">
                  <p className="text-gray-500 text-sm">Additional Details</p>
                  <p className="mt-1">{claim.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Supporting Documents */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Supporting Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center p-3 border rounded-md">
                  <FileText className="h-6 w-6 text-primary mr-3" />
                  <div className="flex-1">
                    <p className="font-medium">Receipt/Proof of Payment</p>
                    <p className="text-gray-500 text-sm">
                      {claim.receiptFile.split('/').pop()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex items-center gap-1"
                      onClick={() => setViewingDocument({
                        url: claim.receiptFile,
                        name: claim.receiptFile.split('/').pop() || 'Receipt',
                        title: 'Receipt/Proof of Payment'
                      })}
                    >
                      <Eye className="h-4 w-4" />
                      <span className="hidden sm:inline">View</span>
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex items-center gap-1"
                      asChild
                    >
                      <a 
                        href={claim.receiptFile.startsWith('file://') 
                          ? `/uploads/${claim.receiptFile.replace('file://', '')}` 
                          : claim.receiptFile
                        } 
                        download 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <DownloadCloud className="h-4 w-4" />
                        <span className="hidden sm:inline">Download</span>
                      </a>
                    </Button>
                  </div>
                </div>
                
                {claim.supportingDocFile && (
                  <div className="flex items-center p-3 border rounded-md">
                    <FileText className="h-6 w-6 text-primary mr-3" />
                    <div className="flex-1">
                      <p className="font-medium">Supporting Document</p>
                      <p className="text-gray-500 text-sm">
                        {claim.supportingDocFile.split('/').pop()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex items-center gap-1"
                        onClick={() => claim.supportingDocFile && setViewingDocument({
                          url: claim.supportingDocFile,
                          name: claim.supportingDocFile.split('/').pop() || 'Supporting Document',
                          title: 'Supporting Document'
                        })}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="hidden sm:inline">View</span>
                      </Button>
                      {claim.supportingDocFile && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex items-center gap-1"
                          asChild
                        >
                          <a 
                            href={claim.supportingDocFile.startsWith('file://') 
                              ? `/uploads/${claim.supportingDocFile.replace('file://', '')}` 
                              : claim.supportingDocFile
                            } 
                            download 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <DownloadCloud className="h-4 w-4" />
                            <span className="hidden sm:inline">Download</span>
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Bank Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Bank Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <p className="text-gray-500 text-sm">Bank Name</p>
                  <p className="font-medium">{claim.bankName}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Bank Address</p>
                  <p className="font-medium">{claim.bankAddress}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Account Number</p>
                  <p className="font-medium">{claim.accountNumber}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">SWIFT Code</p>
                  <p className="font-medium">{claim.swiftCode}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Academic Records */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                  <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                </svg>
                Academic Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingAcademicRecords ? (
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : academicRecords && academicRecords.length > 0 ? (
                <div className="space-y-6">
                  {academicRecords.map((record) => (
                    <div key={record.id} className="border rounded-md p-4">
                      <div className="flex justify-between mb-3">
                        <h3 className="font-medium text-lg">{record.semester} {record.year}</h3>
                        <div className="px-2 py-1 text-sm bg-primary/10 text-primary rounded-md">
                          GPA: {record.gpa || 'N/A'}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-gray-500 text-sm">ECTS Credits</p>
                          <p className="font-medium">{record.ectsCredits || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-sm">Status</p>
                          <p className="font-medium">{record.isCompleted ? 'Completed' : 'In Progress'}</p>
                        </div>
                      </div>
                      
                      {/* View courses button */}
                      <div className="mt-4">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setExpandedRecordId(expandedRecordId === record.id ? null : record.id)}
                          className="w-full flex justify-between items-center"
                        >
                          <span>{expandedRecordId === record.id ? 'Hide Courses' : 'View Courses'}</span>
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className={`h-4 w-4 transition-transform ${expandedRecordId === record.id ? 'rotate-180' : ''}`} 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          >
                            <polyline points="6 9 12 15 18 9"></polyline>
                          </svg>
                        </Button>
                      </div>
                      
                      {/* Courses list */}
                      {expandedRecordId === record.id && (
                        <div className="mt-4 pl-4 border-l-2 border-primary/20">
                          <h4 className="font-medium mb-2">Courses</h4>
                          {isLoadingCourses ? (
                            <div className="space-y-2">
                              <Skeleton className="h-6 w-full" />
                              <Skeleton className="h-6 w-full" />
                              <Skeleton className="h-6 w-full" />
                            </div>
                          ) : courses && courses.length > 0 ? (
                            <div className="space-y-3">
                              {courses.map(course => (
                                <div key={course.id} className="border rounded-md p-3">
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <p className="font-medium">{course.name}</p>
                                      <p className="text-sm text-gray-500">
                                        Credits: {course.credits} · Status: {course.status}
                                      </p>
                                    </div>
                                    {course.grade && (
                                      <div className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm font-medium">
                                        Grade: {course.grade}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500 text-sm">No courses found for this semester.</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-gray-500">No academic records available for this student.</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Review Information (if reviewed) */}
          {claim.reviewedAt && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Review Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <p className="text-gray-500 text-sm">Reviewed On</p>
                    <p className="font-medium">{formatDate(claim.reviewedAt)}</p>
                  </div>
                  {claim.reviewComment && (
                    <div>
                      <p className="text-gray-500 text-sm">Reviewer Comments</p>
                      <p className="font-medium">{claim.reviewComment}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Admin Actions */}
          {isAdmin && claim.status === "pending" && (
            <div className="flex justify-end gap-3">
              <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                <DialogTrigger asChild>
                  <Button>Review Claim</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Review Claim</DialogTitle>
                  </DialogHeader>
                  <ClaimReviewForm 
                    claimId={claim.id} 
                    onSuccess={() => {
                      setIsReviewDialogOpen(false);
                      queryClient.invalidateQueries({ queryKey: [`/api/claims/${id}`] });
                    }} 
                  />
                </DialogContent>
              </Dialog>
            </div>
          )}
          
          {/* Back Button */}
          <div className="mt-8 flex justify-center">
            <Button 
              variant="outline" 
              onClick={() => setLocation(isAdmin ? "/admin" : "/history")}
            >
              Back to {isAdmin ? "Dashboard" : "Claims"}
            </Button>
          </div>
        </div>
      </div>

      {/* Document Viewer Dialog */}
      {viewingDocument && (
        <DocumentViewerDialog
          isOpen={!!viewingDocument}
          onClose={() => setViewingDocument(null)}
          fileUrl={viewingDocument.url}
          fileName={viewingDocument.name}
          title={viewingDocument.title}
        />
      )}
    </div>
  );
}
