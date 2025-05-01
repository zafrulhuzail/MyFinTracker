import { useState } from "react";
import { AcademicRecord, Course } from "@shared/schema";
import GradeTable from "./GradeTable";

interface SemesterAccordionProps {
  academicRecord: AcademicRecord;
  courses: Course[];
  isCurrentSemester?: boolean;
}

export default function SemesterAccordion({
  academicRecord,
  courses,
  isCurrentSemester = false
}: SemesterAccordionProps) {
  const [isOpen, setIsOpen] = useState(isCurrentSemester);
  
  const toggleAccordion = () => setIsOpen(!isOpen);
  
  const { semester, year } = academicRecord;
  const title = `${semester} Semester ${year}${isCurrentSemester ? " (Current)" : ""}`;
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden mb-3">
      <div
        className="p-4 flex justify-between items-center cursor-pointer"
        onClick={toggleAccordion}
      >
        <h4 className="font-medium">{title}</h4>
        <span className="material-icons">
          {isOpen ? "expand_less" : "expand_more"}
        </span>
      </div>
      
      {isOpen && (
        <div className="px-4 pb-4">
          <GradeTable courses={courses} isCurrentSemester={isCurrentSemester} />
        </div>
      )}
    </div>
  );
}
