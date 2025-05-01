import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileUpdateSchema } from "@/lib/validators";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import AppHeader from "@/components/layout/AppHeader";
import BottomNavigation from "@/components/layout/BottomNavigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

export default function Profile() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingBank, setIsEditingBank] = useState(false);
  
  // Profile update form
  const profileForm = useForm({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      email: user?.email || "",
      phoneNumber: user?.phoneNumber || "",
      currentAddress: user?.currentAddress || "",
      bankName: user?.bankName || "",
      bankAddress: user?.bankAddress || "",
      accountNumber: user?.accountNumber || "",
      swiftCode: user?.swiftCode || "",
    },
  });
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", `/api/users/${user?.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
      
      setIsEditingProfile(false);
      setIsEditingBank(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update profile",
        description: error.message || "An error occurred while updating your profile",
        variant: "destructive",
      });
    },
  });
  
  const onSubmitProfile = (data: any) => {
    const updatedData = {
      email: data.email,
      phoneNumber: data.phoneNumber,
      currentAddress: data.currentAddress,
    };
    
    updateProfileMutation.mutate(updatedData);
  };
  
  const onSubmitBank = (data: any) => {
    const updatedData = {
      bankName: data.bankName,
      bankAddress: data.bankAddress,
      accountNumber: data.accountNumber,
      swiftCode: data.swiftCode,
    };
    
    updateProfileMutation.mutate(updatedData);
  };
  
  if (!user) {
    return (
      <div className="flex flex-col h-screen overflow-hidden">
        <AppHeader title="Profile" />
        <div className="flex-1 flex items-center justify-center">
          <Skeleton className="h-screen w-full" />
        </div>
        <BottomNavigation />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <AppHeader title="Profile" />
      
      <div className="flex-1 overflow-auto pb-16">
        <div className="px-4 py-6">
          {/* User Header */}
          <div className="mb-6">
            <div className="flex items-center">
              <div className="w-20 h-20 rounded-full bg-primary-200 flex items-center justify-center text-primary-700 text-2xl font-bold mr-4">
                {user.fullName.charAt(0)}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{user.fullName}</h2>
                <p className="text-gray-600">MARA Student ID: {user.maraId}</p>
              </div>
            </div>
          </div>
          
          {/* Personal Information Section */}
          <Card className="p-5 mb-6">
            <h3 className="text-lg font-medium mb-4">Personal Information</h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <p className="text-gray-500 text-sm">National ID</p>
                <p className="font-medium">{user.nationalId}</p>
              </div>
              
              <div>
                <p className="text-gray-500 text-sm">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              
              <div>
                <p className="text-gray-500 text-sm">Phone Number</p>
                <p className="font-medium">{user.phoneNumber}</p>
              </div>
              
              <div>
                <p className="text-gray-500 text-sm">Current Address</p>
                <p className="font-medium">{user.currentAddress}</p>
              </div>
            </div>
            
            <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
              <DialogTrigger asChild>
                <Button variant="ghost" className="mt-4 text-primary font-medium text-sm flex items-center">
                  <span className="material-icons text-sm mr-1">edit</span> Edit Personal Information
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Personal Information</DialogTitle>
                </DialogHeader>
                
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-4">
                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your phone number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="currentAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your current address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsEditingProfile(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={updateProfileMutation.isPending}>
                        {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </Card>
          
          {/* Study Information Section */}
          <Card className="p-5 mb-6">
            <h3 className="text-lg font-medium mb-4">Study Information</h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <p className="text-gray-500 text-sm">Country of Study</p>
                <p className="font-medium">{user.countryOfStudy}</p>
              </div>
              
              <div>
                <p className="text-gray-500 text-sm">University</p>
                <p className="font-medium">{user.university}</p>
              </div>
              
              <div>
                <p className="text-gray-500 text-sm">Field of Study</p>
                <p className="font-medium">{user.fieldOfStudy}</p>
              </div>
              
              <div>
                <p className="text-gray-500 text-sm">Degree Level</p>
                <p className="font-medium">{user.degreeLevel}</p>
              </div>
              
              <div>
                <p className="text-gray-500 text-sm">MARA Group</p>
                <p className="font-medium">{user.maraGroup}</p>
              </div>
              
              <div>
                <p className="text-gray-500 text-sm">Sponsorship Period</p>
                <p className="font-medium">{user.sponsorshipPeriod}</p>
              </div>
            </div>
          </Card>
          
          {/* Bank Information Section */}
          <Card className="p-5 mb-6">
            <h3 className="text-lg font-medium mb-4">Bank Information</h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <p className="text-gray-500 text-sm">Bank Name</p>
                <p className="font-medium">{user.bankName}</p>
              </div>
              
              <div>
                <p className="text-gray-500 text-sm">Bank Address</p>
                <p className="font-medium">{user.bankAddress}</p>
              </div>
              
              <div>
                <p className="text-gray-500 text-sm">Account Number</p>
                <p className="font-medium">{user.accountNumber}</p>
              </div>
              
              <div>
                <p className="text-gray-500 text-sm">SWIFT/BIC Code</p>
                <p className="font-medium">{user.swiftCode}</p>
              </div>
            </div>
            
            <Dialog open={isEditingBank} onOpenChange={setIsEditingBank}>
              <DialogTrigger asChild>
                <Button variant="ghost" className="mt-4 text-primary font-medium text-sm flex items-center">
                  <span className="material-icons text-sm mr-1">edit</span> Update Bank Information
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update Bank Information</DialogTitle>
                </DialogHeader>
                
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onSubmitBank)} className="space-y-4">
                    <FormField
                      control={profileForm.control}
                      name="bankName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bank Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter bank name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="bankAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bank Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter bank address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="accountNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter account number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="swiftCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SWIFT Code</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter SWIFT code" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsEditingBank(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={updateProfileMutation.isPending}>
                        {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </Card>
          
          {/* Account Actions */}
          <div className="mt-6 space-y-3">
            <Button variant="outline" className="w-full py-3 flex items-center justify-center font-medium">
              <span className="material-icons mr-2">help</span> Help & Support
            </Button>
            
            <Button variant="outline" className="w-full py-3 flex items-center justify-center font-medium">
              <span className="material-icons mr-2">settings</span> Settings
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full py-3 text-error flex items-center justify-center font-medium">
                  <span className="material-icons mr-2">logout</span> Sign Out
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure you want to sign out?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You will need to log in again to access your account.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={logout}>Sign Out</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
}
