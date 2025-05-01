import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Claim, User } from "@shared/schema";
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
  
  // Fetch student details if admin
  const { data: student } = useQuery<User>({
    queryKey: [`/api/users/${claim?.userId}`],
    enabled: !!claim?.userId && isAdmin,
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
      <div className="flex flex-col h-screen overflow-hidden">
        <div className="flex-1 overflow-auto pb-16 px-4 py-6">
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
      <div className="flex flex-col h-screen overflow-hidden">
        <div className="flex-1 overflow-auto pb-16 px-4 py-6 flex items-center justify-center">
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
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="flex-1 overflow-auto pb-16">
        <div className="px-4 py-6">
          {/* Claim Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold">{claim.claimType} Claim</h2>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <a href={claim.receiptFile} download target="_blank" rel="noopener noreferrer">
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
                          <a href={claim.supportingDocFile} download target="_blank" rel="noopener noreferrer">
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
