import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { courseFormSchema } from "@/lib/validators";
import { AcademicRecord } from "@shared/schema";

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CourseFormProps {
  academicRecord: AcademicRecord;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

export default function CourseForm({ academicRecord, onSubmit, isLoading }: CourseFormProps) {
  const form = useForm({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      academicRecordId: academicRecord.id,
      name: "",
      credits: undefined,
      grade: "",
      status: "In Progress",
    },
  });
  
  const handleSubmit = (data: any) => {
    // Convert credits to number
    const formattedData = {
      ...data,
      credits: Number(data.credits),
    };
    
    onSubmit(formattedData);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Course Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter course name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="credits"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Credits</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="Enter credit points (ECTS)" 
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || "")} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="grade"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Grade (optional)</FormLabel>
              <FormControl>
                <Input placeholder="Enter grade (e.g., 1.7, A, etc.)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select course status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Passed">Passed</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Planned">Planned</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-2 pt-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Add Course"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
