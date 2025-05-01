import { Course } from "@shared/schema";

interface GradeTableProps {
  courses: Course[];
  isCurrentSemester?: boolean;
}

export default function GradeTable({ courses, isCurrentSemester = false }: GradeTableProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Passed":
        return <span className="bg-green-100 text-success px-2 py-0.5 rounded-full text-xs">Passed</span>;
      case "Failed":
        return <span className="bg-red-100 text-error px-2 py-0.5 rounded-full text-xs">Failed</span>;
      case "In Progress":
        return <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">In Progress</span>;
      case "Planned":
        return <span className="bg-blue-100 text-info px-2 py-0.5 rounded-full text-xs">Planned</span>;
      default:
        return <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{status}</span>;
    }
  };
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="bg-gray-50">
            <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
            <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase">Credits</th>
            <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
            <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {courses.length > 0 ? (
            courses.map((course) => (
              <tr key={course.id}>
                <td className="py-2 px-3 text-sm">{course.name}</td>
                <td className="py-2 px-3 text-sm">{course.credits}</td>
                <td className="py-2 px-3 text-sm">{course.grade || "-"}</td>
                <td className="py-2 px-3 text-sm">
                  {getStatusBadge(course.status)}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="py-4 text-center text-gray-500">
                {isCurrentSemester
                  ? "No courses added for this semester yet."
                  : "No courses available for this semester."}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
