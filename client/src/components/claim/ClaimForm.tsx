import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { claimFormSchema, claimTypes } from "@/lib/validators";
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
import { FileUpload } from "@/components/ui/file-input";

export default function ClaimForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const [selectedClaimTypes, setSelectedClaimTypes] = useState<string[]>([]);
  const [typeAmounts, setTypeAmounts] = useState<Record<string, number>>({});
  
  // Initialize form with default values
  const form = useForm({
    resolver: zodResolver(claimFormSchema),
    defaultValues: {
      claimType: claimTypes[0], // Default to first claim type
      amount: 0,
      claimPeriod: "",
      description: "",
      receiptFile: "",
      supportingDocFile: "",
      bankName: user?.bankName || "",
      bankAddress: user?.bankAddress || "",
      accountNumber: user?.accountNumber || "",
      swiftCode: user?.swiftCode || "",
      declaration: false,
      selectedTypes: [],
      typeAmounts: {},
    }
  });
  
  // Select the main claim type based on which has the highest amount
  useEffect(() => {
    if (selectedClaimTypes.length > 0) {
      // Find the claim type with the highest amount
      let maxType = selectedClaimTypes[0];
      let maxAmount = typeAmounts[maxType] || 0;
      
      selectedClaimTypes.forEach(type => {
        const amount = typeAmounts[type] || 0;
        if (amount > maxAmount) {
          maxType = type;
          maxAmount = amount;
        }
      });
      
      // Update the form's claimType field
      form.setValue("claimType", maxType as any);
    } else if (selectedClaimTypes.length === 0) {
      // If no claim types selected, default to first one but don't show it
      form.setValue("claimType", claimTypes[0] as any);
    }
    
    // Calculate and update the total amount
    let total = 0;
    Object.values(typeAmounts).forEach(amount => {
      total += amount;
    });
    form.setValue("amount", total);
    
  }, [selectedClaimTypes, typeAmounts, form]);
  
  // Calculate total whenever claim amounts change
  const calculateTotal = () => {
    let total = 0;
    Object.values(typeAmounts).forEach(amount => {
      total += amount;
    });
    return total;
  };
  
  // Need supporting document for these claim types
  const needsSupportingDoc = selectedClaimTypes.some(type => 
    ["Practical Allowance", "End of Study Allowance", "Flight Ticket"].includes(type)
  );
  
  const onSubmit = async (data: any) => {
    try {
      setIsLoading(true);
      
      // Validate we have at least one claim type selected
      if (selectedClaimTypes.length === 0) {
        toast({
          title: "Missing claim type",
          description: "Please select at least one claim type",
          variant: "destructive",
        });
        return;
      }
      
      // Validate total amount is greater than zero
      if (calculateTotal() <= 0) {
        toast({
          title: "Invalid amount",
          description: "Total amount must be greater than zero",
          variant: "destructive",
        });
        return;
      }
      
      // Remove UI-only fields before submission
      const { 
        declaration, 
        selectedTypes, 
        typeAmounts,
        ...submitData 
      } = data;
      
      // Add a summary of the selected claim types to the description
      if (selectedClaimTypes.length > 1) {
        const breakdown = selectedClaimTypes.map(type => 
          `${type}: €${(data.typeAmounts[type] || 0).toFixed(2)}`
        ).join('\n');
        
        submitData.description = 
          `${submitData.description || ''}\n\nClaim Breakdown:\n${breakdown}`;
      }
      
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
          <h3 className="text-lg font-medium mb-3">Select Claim Types</h3>
          <p className="text-sm text-gray-600 mb-4">You can select multiple claim types and specify the amount for each.</p>
          
          <div className="space-y-4">
            {claimTypes.map((claimType) => {
              const isSelected = selectedClaimTypes.includes(claimType);
              const amount = typeAmounts[claimType] || 0;
              
              return (
                <div key={claimType} className={`border rounded-lg p-4 ${isSelected ? 'border-primary bg-primary/5' : ''}`}>
                  <div className="flex items-start mb-2">
                    <Checkbox 
                      id={`claim-type-${claimType}`} 
                      checked={isSelected} 
                      onCheckedChange={(checked) => {
                        if (checked) {
                          // Add to selected types
                          const newSelectedTypes = [...selectedClaimTypes, claimType];
                          setSelectedClaimTypes(newSelectedTypes);
                          form.setValue("selectedTypes", newSelectedTypes as any);
                          
                          // Initialize amount if not exists
                          if (!typeAmounts[claimType]) {
                            const newAmounts = { ...typeAmounts, [claimType]: 0 };
                            setTypeAmounts(newAmounts);
                            form.setValue("typeAmounts", newAmounts as any);
                          }
                        } else {
                          // Remove from selected types
                          const newSelectedTypes = selectedClaimTypes.filter(t => t !== claimType);
                          setSelectedClaimTypes(newSelectedTypes);
                          form.setValue("selectedTypes", newSelectedTypes as any);
                          
                          // Remove amount
                          const newAmounts = { ...typeAmounts };
                          delete newAmounts[claimType];
                          setTypeAmounts(newAmounts);
                          form.setValue("typeAmounts", newAmounts as any);
                        }
                      }}
                      className="mt-1"
                    />
                    <div className="ml-3 flex-1">
                      <label htmlFor={`claim-type-${claimType}`} className="font-medium cursor-pointer">
                        {claimType}
                      </label>
                      <p className="text-sm text-gray-600 mt-1">
                        {claimType === "Insurance" && "For health and liability insurance fees"}
                        {claimType === "Tuition Fee" && "For university or language center fees"}
                        {claimType === "Practical Allowance" && "For internship or practical training periods"}
                        {claimType === "Flight Ticket" && "For return flights at the end of studies"}
                        {claimType === "End of Study Allowance" && "Final allowance upon completion of studies"}
                        {claimType === "Other" && "For other eligible expenses"}
                      </p>
                    </div>
                  </div>
                  
                  {isSelected && (
                    <div className="mt-3 ml-8 space-y-3">
                      <div>
                        <label className="text-sm font-medium">Amount (€)</label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          step="0.01"
                          value={amount || ''}
                          onChange={(e) => {
                            const newAmount = parseFloat(e.target.value) || 0;
                            const newAmounts = {
                              ...typeAmounts,
                              [claimType]: newAmount
                            };
                            setTypeAmounts(newAmounts);
                            form.setValue("typeAmounts", newAmounts as any);
                          }}
                          className="max-w-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            
            {selectedClaimTypes.length === 0 && (
              <div className="border border-yellow-200 bg-yellow-50 p-4 rounded-md">
                <p className="text-yellow-700">Please select at least one claim type.</p>
              </div>
            )}
            
            <FormField
              control={form.control}
              name="claimType"
              render={() => (
                <FormItem>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        {/* Claim Details Section */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Claim Summary</h3>
          
          <div className="border rounded-lg p-4 bg-gray-50 mb-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Total Amount:</h4>
              <span className="text-lg font-semibold">€{calculateTotal().toFixed(2)}</span>
            </div>
            
            {selectedClaimTypes.length > 0 && (
              <div className="mt-3">
                <h5 className="text-sm font-medium mb-2">Breakdown:</h5>
                <ul className="text-sm space-y-1">
                  {selectedClaimTypes.map(type => (
                    <li key={type} className="flex justify-between">
                      <span>{type}</span>
                      <span>€{(typeAmounts[type] || 0).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            {/* These fields will be updated by the useEffect */}
            <input type="hidden" {...form.register("amount")} />
            <input type="hidden" {...form.register("claimType")} />
            
            
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
