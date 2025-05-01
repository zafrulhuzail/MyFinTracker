import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertStudyPlanSchema, StudyPlan } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, X } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

// Extend the schema to add validation
const studyPlanFormSchema = insertStudyPlanSchema.extend({
  // Override plannedCourses to handle the string array input
  plannedCourses: z.array(z.string()).min(1, "At least one course is required"),
  semester: z.enum(["Summer", "Winter"], {
    required_error: "Please select a semester",
  }),
  year: z.string().min(4, "Please enter a valid year"),
  totalCredits: z.coerce.number().min(1, "Total credits are required"),
});

// Define form type
type StudyPlanFormValues = z.infer<typeof studyPlanFormSchema>;

interface StudyPlanFormProps {
  onSubmit: (data: StudyPlanFormValues) => void;
  isLoading: boolean;
  existingPlan?: StudyPlan;
}

export default function StudyPlanForm({ onSubmit, isLoading, existingPlan }: StudyPlanFormProps) {
  // Set up the form with default values
  const form = useForm<StudyPlanFormValues>({
    resolver: zodResolver(studyPlanFormSchema),
    defaultValues: existingPlan
      ? {
          userId: existingPlan.userId,
          semester: existingPlan.semester as "Winter" | "Summer",
          year: existingPlan.year,
          totalCredits: existingPlan.totalCredits,
          // Handle different formats of plannedCourses
          plannedCourses: Array.isArray(existingPlan.plannedCourses)
            ? existingPlan.plannedCourses
            : typeof existingPlan.plannedCourses === 'object' && existingPlan.plannedCourses !== null
              ? Object.values(existingPlan.plannedCourses as Record<string, string>)
              : []
        }
      : {
          userId: 0, // Will be set by the server based on authenticated user
          semester: "Winter",
          year: new Date().getFullYear().toString(),
          plannedCourses: [""],
          totalCredits: 0,
        },
  });

  // State to track the course inputs
  const [courses, setCourses] = useState<string[]>(
    form.getValues().plannedCourses?.length > 0
      ? form.getValues().plannedCourses
      : [""]
  );

  // Handle adding a new course input
  const addCourse = () => {
    const newCourses = [...courses, ""];
    setCourses(newCourses);
    form.setValue("plannedCourses", newCourses);
  };

  // Handle removing a course input
  const removeCourse = (index: number) => {
    if (courses.length > 1) {
      const newCourses = [...courses];
      newCourses.splice(index, 1);
      setCourses(newCourses);
      form.setValue("plannedCourses", newCourses);
    }
  };

  // Handle updating course value
  const updateCourse = (index: number, value: string) => {
    const newCourses = [...courses];
    newCourses[index] = value;
    setCourses(newCourses);
    form.setValue("plannedCourses", newCourses);
  };

  // Form submission
  const handleSubmit = (data: StudyPlanFormValues) => {
    // Filter out empty course names
    const filteredCourses = data.plannedCourses.filter(course => course.trim() !== "");
    
    if (filteredCourses.length === 0) {
      form.setError("plannedCourses", {
        type: "manual",
        message: "At least one course is required",
      });
      return;
    }
    
    onSubmit({
      ...data,
      plannedCourses: filteredCourses,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="semester"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Semester</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a semester" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Winter">Winter</SelectItem>
                    <SelectItem value="Summer">Summer</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Year</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 2025" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="totalCredits"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total Credits</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g. 30" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <FormLabel>Planned Courses</FormLabel>
          <FormMessage className="text-red-500">
            {form.formState.errors.plannedCourses?.message}
          </FormMessage>
          <div className="space-y-2 mt-2">
            {courses.map((course, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={course}
                  onChange={(e) => updateCourse(index, e.target.value)}
                  placeholder="Course name"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeCourse(index)}
                  disabled={courses.length <= 1}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addCourse}
              className="mt-2"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Course
            </Button>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Study Plan"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}