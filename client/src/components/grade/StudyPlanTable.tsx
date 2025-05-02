import { StudyPlan } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

interface StudyPlanTableProps {
  studyPlans: StudyPlan[];
  onEditPlan?: (plan: StudyPlan) => void;
  onDeletePlan?: (planId: number) => void;
}

export default function StudyPlanTable({ 
  studyPlans, 
  onEditPlan,
  onDeletePlan 
}: StudyPlanTableProps) {
  // Sort study plans by year and semester
  const sortedPlans = [...studyPlans].sort((a, b) => {
    // Compare year first
    const yearDiff = parseInt(a.year) - parseInt(b.year);
    if (yearDiff !== 0) return yearDiff;
    
    // If same year, compare semester (Winter > Summer)
    return a.semester === "Winter" ? -1 : 1;
  });
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="bg-gray-50">
            <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase">Semester</th>
            <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase">Planned Courses</th>
            <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase">Total ECTS</th>
            <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {sortedPlans.map((plan) => (
            <tr key={plan.id}>
              <td className="py-2 px-3 text-sm">{plan.semester} {plan.year}</td>
              <td className="py-2 px-3 text-sm">
                <ul className="list-disc pl-4 text-sm">
                  {Array.isArray(plan.plannedCourses) 
                    ? plan.plannedCourses.map((course: string, index: number) => (
                        <li key={index}>{course}</li>
                      ))
                    : typeof plan.plannedCourses === 'object' && plan.plannedCourses !== null
                      ? Object.entries(plan.plannedCourses).map(([key, value]) => (
                          <li key={key}>{value as string}</li>
                        ))
                      : <li>No courses planned</li>
                  }
                </ul>
              </td>
              <td className="py-2 px-3 text-sm">{plan.totalCredits}</td>
              <td className="py-2 px-3 text-sm">
                <div className="flex space-x-2">
                  {onEditPlan && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onEditPlan(plan)}
                      className="h-8 w-8 p-0" 
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  {onDeletePlan && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onDeletePlan(plan.id)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50" 
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
          
          {sortedPlans.length === 0 && (
            <tr>
              <td colSpan={4} className="py-4 text-center text-gray-500">
                No study plan available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
