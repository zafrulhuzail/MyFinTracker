import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateClaimStatusSchema } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ClaimReviewFormProps {
  claimId: number;
  onSuccess: () => void;
}

export default function ClaimReviewForm({ claimId, onSuccess }: ClaimReviewFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm({
    resolver: zodResolver(updateClaimStatusSchema),
    defaultValues: {
      status: "pending",
      reviewComment: "",
    },
  });
  
  const updateClaimMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", `/api/claims/${claimId}/status`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Claim reviewed successfully",
        description: "The claim status has been updated",
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/claims"] });
      queryClient.invalidateQueries({ queryKey: [`/api/claims/${claimId}`] });
      
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Error reviewing claim",
        description: error.message || "An error occurred while updating the claim status",
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: any) => {
    updateClaimMutation.mutate(data);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Claim Decision</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="approved" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Approve Claim
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="rejected" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Reject Claim
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="reviewComment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Review Comments (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add any comments or feedback for the student"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2">
          <Button
            type="submit"
            disabled={updateClaimMutation.isPending}
          >
            {updateClaimMutation.isPending ? "Submitting..." : "Submit Review"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
