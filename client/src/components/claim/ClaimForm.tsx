import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { claimFormSchema } from "@/lib/validators";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";

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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FileUpload } from "@/components/ui/file-upload";

export default function ClaimForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  
  // Initialize form with default values
  const form = useForm({
    resolver: zodResolver(claimFormSchema),
    defaultValues: {
      claimType: undefined,
      amount: undefined,
      claimPeriod: "",
      description: "",
      receiptFile: "",
      supportingDocFile: "",
      bankName: user?.bankName || "",
      bankAddress: user?.bankAddress || "",
      accountNumber: user?.accountNumber || "",
      swiftCode: user?.swiftCode || "",
      declaration: false,
    }
  });
  
  const claimType = form.watch("claimType") as string | undefined;
  
  // Need supporting document for these claim types
  const needsSupportingDoc = claimType ? ["Practical Allowance", "End of Study Allowance", "Flight Ticket"].includes(claimType) : false;
  
  const onSubmit = async (data: any) => {
    try {
      setIsLoading(true);
      
      // Remove declaration as it's just for UI
      const { declaration, ...submitData } = data;
      
      // Make API request to create claim
      await apiRequest("POST", "/api/claims", submitData);
      
      // Invalidate claims query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["/api/claims"] });
      
      toast({
        title: "Claim submitted successfully",
        description: "Your claim has been submitted and is pending review.",
      });
      
      setLocation("/history");
    } catch (error: any) {
      console.error("Submit claim error:", error);
      toast({
        title: "Error submitting claim",
        description: error.message || "An error occurred while submitting your claim.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Claim Type Section */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Claim Type</h3>
          
          <FormField
            control={form.control}
            name="claimType"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="grid grid-cols-1 gap-3"
                  >
                    <FormItem className="flex items-start space-x-3 space-y-0 border rounded-lg p-3">
                      <FormControl>
                        <RadioGroupItem value="Insurance" />
                      </FormControl>
                      <div className="flex-1">
                        <FormLabel className="font-medium">Insurance</FormLabel>
                        <p className="text-sm text-gray-600">For health and liability insurance fees</p>
                      </div>
                    </FormItem>
                    
                    <FormItem className="flex items-start space-x-3 space-y-0 border rounded-lg p-3">
                      <FormControl>
                        <RadioGroupItem value="Tuition Fee" />
                      </FormControl>
                      <div className="flex-1">
                        <FormLabel className="font-medium">Tuition Fee</FormLabel>
                        <p className="text-sm text-gray-600">For university or language center fees</p>
                      </div>
                    </FormItem>
                    
                    <FormItem className="flex items-start space-x-3 space-y-0 border rounded-lg p-3">
                      <FormControl>
                        <RadioGroupItem value="Practical Allowance" />
                      </FormControl>
                      <div className="flex-1">
                        <FormLabel className="font-medium">Practical Allowance</FormLabel>
                        <p className="text-sm text-gray-600">For internship or practical training periods</p>
                      </div>
                    </FormItem>
                    
                    <FormItem className="flex items-start space-x-3 space-y-0 border rounded-lg p-3">
                      <FormControl>
                        <RadioGroupItem value="Flight Ticket" />
                      </FormControl>
                      <div className="flex-1">
                        <FormLabel className="font-medium">Flight Ticket</FormLabel>
                        <p className="text-sm text-gray-600">For return flights at the end of studies</p>
                      </div>
                    </FormItem>
                    
                    <FormItem className="flex items-start space-x-3 space-y-0 border rounded-lg p-3">
                      <FormControl>
                        <RadioGroupItem value="End of Study Allowance" />
                      </FormControl>
                      <div className="flex-1">
                        <FormLabel className="font-medium">End of Study Allowance</FormLabel>
                        <p className="text-sm text-gray-600">Final allowance upon completion of studies</p>
                      </div>
                    </FormItem>
                    
                    <FormItem className="flex items-start space-x-3 space-y-0 border rounded-lg p-3">
                      <FormControl>
                        <RadioGroupItem value="Other" />
                      </FormControl>
                      <div className="flex-1">
                        <FormLabel className="font-medium">Other</FormLabel>
                        <p className="text-sm text-gray-600">For other eligible expenses</p>
                      </div>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Claim Details Section */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Claim Details</h3>
          
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (€)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="claimPeriod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Claim Period/Semester</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Summer 2023" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Details</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional information about your claim"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        {/* Supporting Documents Section */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Supporting Documents</h3>
          
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="receiptFile"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <FileUpload
                      label="Upload receipt or proof of payment"
                      description="PDF, JPG or PNG (Max. 5MB)"
                      icon="cloud_upload"
                      value={field.value}
                      onChange={field.onChange}
                      error={form.formState.errors.receiptFile?.message}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {needsSupportingDoc && (
              <FormField
                control={form.control}
                name="supportingDocFile"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <FileUpload
                        label="Upload supporting letter"
                        description="Company offer letter, university completion letter, etc."
                        icon="description"
                        value={field.value}
                        onChange={field.onChange}
                        error={form.formState.errors.supportingDocFile?.message}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        </div>
        
        {/* Bank Information Section */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Bank Information</h3>
          
          <div className="space-y-4">
            <FormField
              control={form.control}
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
              control={form.control}
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
              control={form.control}
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
              control={form.control}
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
          </div>
        </div>
        
        {/* Declaration Section */}
        <div className="mb-6">
          <FormField
            control={form.control}
            name="declaration"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm text-gray-700">
                    I declare that all information provided is true and correct. I understand that providing false information may result in the rejection of my claim and other penalties as stated in the MARA scholarship agreement.
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
        </div>
        
        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Submitting..." : "Submit Claim"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
