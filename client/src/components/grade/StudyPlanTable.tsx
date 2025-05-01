import { StudyPlan } from "@shared/schema";

interface StudyPlanTableProps {
  studyPlans: StudyPlan[];
}

export default function StudyPlanTable({ studyPlans }: StudyPlanTableProps) {
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
            </tr>
          ))}
          
          {sortedPlans.length === 0 && (
            <tr>
              <td colSpan={3} className="py-4 text-center text-gray-500">
                No study plan available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
